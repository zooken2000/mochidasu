import { AwsClient } from 'aws4fetch';
import { useCallback, useRef } from 'react';
import {
  GuestCredentials,
  getGuestCredentials,
} from '../lib/guest-credentials';
import { useRuntimeConfig } from './useRuntimeConfig';

// Capture the native fetch before any monkey-patching can occur.
const nativeFetch = globalThis.fetch.bind(globalThis);

// 期限の少し前に取り直す
const CREDENTIAL_EXPIRY_OFFSET_MILLIS = 30 * 1000;

/**
 * ログインなしで AgentCore を呼ぶための SigV4 署名付き fetch。
 * Cognito Identity Pool のゲスト（未認証）IDから、Basic フローで一時的な AWS 認証情報をもらい、
 * リクエストに署名する（理由は lib/guest-credentials.ts）。
 * ローカル開発（local-dev かつ cognitoProps なし）では署名しない。
 */
export const useSigV4 = (): typeof globalThis.fetch => {
  const { cognitoProps } = useRuntimeConfig();
  const cached = useRef<GuestCredentials | undefined>(undefined);
  const skipSigning = !cognitoProps && import.meta.env.MODE === 'local-dev';

  const getAwsClient = useCallback(async (): Promise<AwsClient> => {
    if (!cognitoProps?.identityPoolId || !cognitoProps?.guestRoleArn) {
      throw new Error('runtime-config.json の cognitoProps が不足しています');
    }
    let creds = cached.current;
    if (
      !creds ||
      creds.expiration.getTime() <= Date.now() + CREDENTIAL_EXPIRY_OFFSET_MILLIS
    ) {
      creds = cached.current = await getGuestCredentials({
        region: cognitoProps.region,
        identityPoolId: cognitoProps.identityPoolId,
        guestRoleArn: cognitoProps.guestRoleArn,
      });
    }
    return new AwsClient({
      accessKeyId: creds.accessKeyId,
      secretAccessKey: creds.secretAccessKey,
      sessionToken: creds.sessionToken,
      region: cognitoProps.region,
      service: 'bedrock-agentcore',
    });
  }, [cognitoProps]);

  return useCallback(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      if (skipSigning) return nativeFetch(input, init);
      const client = await getAwsClient();
      return client.fetch(input, init);
    },
    [skipSigning, getAwsClient],
  );
};
