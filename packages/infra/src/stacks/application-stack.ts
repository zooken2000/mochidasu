import { Extractor, UserIdentity, Web } from '@mochidasu/common-constructs';
import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Mfa } from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

export class ApplicationStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // ハッカソンのデモ用途なので MFA は任意にしておく
    const identity = new UserIdentity(this, 'Identity', {
      mfa: Mfa.OPTIONAL,
    });

    // 読み取った紙の画像・会話履歴を保持するため、スタック削除時にバケットも消す
    new Extractor(this, 'Extractor', {
      identity,
      sessionBucketRemovalPolicy: RemovalPolicy.DESTROY,
    });

    new Web(this, 'Web');
  }
}
