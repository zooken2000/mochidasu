import { CfnOutput, Stack } from 'aws-cdk-lib';
import { IdentityPool } from 'aws-cdk-lib/aws-cognito-identitypool';
import type { IRole } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { suppressRules } from './checkov.js';
import { RuntimeConfig } from './runtime-config.js';

/**
 * ログインなしで使うための Cognito Identity Pool（ゲスト ID のみ）。
 *
 * ブラウザはここから一時的な AWS 認証情報を受け取り、SigV4 署名で AgentCore を呼ぶ。
 * 標準（Enhanced）フローでは未認証 ID に AWS のスコープダウンポリシーが付き、
 * bedrock-agentcore を呼べないため、Basic（クラシック）フローを有効にして使う。
 * ユーザープール（アカウント・ログイン）は作らない。
 */
export class GuestIdentity extends Construct {
  public readonly identityPool: IdentityPool;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.identityPool = new IdentityPool(this, 'IdentityPool', {
      allowUnauthenticatedIdentities: true,
      allowClassicFlow: true,
    });
    suppressRules(
      this.identityPool,
      ['CKV_AWS_366'],
      '審査員がログインなしで試せるよう、ゲスト ID を許可する（権限は AgentCore の呼び出しのみ）',
    );

    RuntimeConfig.ensure(this).set('connection', 'cognitoProps', {
      region: Stack.of(this).region,
      identityPoolId: this.identityPool.identityPoolId,
      guestRoleArn: this.identityPool.unauthenticatedRole.roleArn,
    });

    new CfnOutput(this, 'IdentityPoolId', {
      value: this.identityPool.identityPoolId,
    });
  }

  /** ゲスト（未認証）ID に与えられるロール */
  public get guestRole(): IRole {
    return this.identityPool.unauthenticatedRole;
  }
}
