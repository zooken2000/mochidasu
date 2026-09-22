import {
  Extractor,
  GuestIdentity,
  suppressRules,
  Web,
} from '@mochidasu/common-constructs';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class ApplicationStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // ログインなし: ゲスト ID でブラウザから AgentCore を呼ぶ（IAM 認証）
    const guest = new GuestIdentity(this, 'Guest');

    // 会話履歴は保存しない（in-memory）。写真はリクエストの処理にだけ使う
    const extractor = new Extractor(this, 'Extractor');
    extractor.grantInvokeAccess(guest.guestRole);

    // ハッカソン用に費用を抑えるため WAF は付けない
    const web = new Web(this, 'Web', { enableWaf: false });
    suppressRules(
      web.cloudFrontDistribution,
      ['CKV_AWS_68'],
      'ハッカソン用に費用を抑えるため WAF を付けない',
    );
  }
}
