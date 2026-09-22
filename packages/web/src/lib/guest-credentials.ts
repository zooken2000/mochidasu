/**
 * ログインなしのゲスト用に、一時的な AWS 認証情報をもらう。
 *
 * Cognito Identity Pool の Basic（クラシック）フローを使う:
 *   GetId → GetOpenIdToken → STS AssumeRoleWithWebIdentity
 *
 * 標準（Enhanced）フローの GetCredentialsForIdentity では、未認証 ID に
 * AWS が決めた権限の上限（スコープダウンポリシー）が自動で付き、
 * その中に bedrock-agentcore が含まれないため AgentCore を呼べない。
 * Basic フローなら、ゲスト用ロールに付けた権限（このエージェントの呼び出しだけ）がそのまま効く。
 */

export interface GuestCredentialsConfig {
  region: string;
  identityPoolId: string;
  guestRoleArn: string;
}

export interface GuestCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
  expiration: Date;
}

const cognito = async <T>(
  region: string,
  target: string,
  body: Record<string, unknown>,
): Promise<T> => {
  const res = await fetch(`https://cognito-identity.${region}.amazonaws.com/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Target': `AWSCognitoIdentityService.${target}`,
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Cognito ${target} ${res.status}: ${json.message ?? ''}`);
  }
  return json as T;
};

/** STS の XML 応答から値を取り出す（テストしやすいよう分けてある） */
export const parseAssumeRoleResponse = (xml: string): GuestCredentials => {
  const pick = (tag: string): string => {
    const m = xml.match(new RegExp(`<${tag}>([^<]+)</${tag}>`));
    if (!m) throw new Error(`STS の応答に ${tag} がありません`);
    return m[1];
  };
  return {
    accessKeyId: pick('AccessKeyId'),
    secretAccessKey: pick('SecretAccessKey'),
    sessionToken: pick('SessionToken'),
    expiration: new Date(pick('Expiration')),
  };
};

// ゲスト ID はタブを開いている間だけ使い回す（ブラウザには保存しない）
let identityId: string | undefined;

export const getGuestCredentials = async ({
  region,
  identityPoolId,
  guestRoleArn,
}: GuestCredentialsConfig): Promise<GuestCredentials> => {
  if (!identityId) {
    ({ IdentityId: identityId } = await cognito<{ IdentityId: string }>(
      region,
      'GetId',
      { IdentityPoolId: identityPoolId },
    ));
  }
  const { Token } = await cognito<{ Token: string }>(region, 'GetOpenIdToken', {
    IdentityId: identityId,
  });

  const params = new URLSearchParams({
    Action: 'AssumeRoleWithWebIdentity',
    Version: '2011-06-15',
    RoleArn: guestRoleArn,
    RoleSessionName: 'mochidasu-guest',
    WebIdentityToken: Token,
  });
  const res = await fetch(`https://sts.${region}.amazonaws.com/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  const xml = await res.text();
  if (!res.ok) {
    const code = xml.match(/<Code>([^<]+)<\/Code>/)?.[1] ?? '';
    throw new Error(`STS AssumeRoleWithWebIdentity ${res.status}: ${code}`);
  }
  return parseAssumeRoleResponse(xml);
};
