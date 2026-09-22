import { describe, expect, it } from 'vitest';
import { parseAssumeRoleResponse } from './guest-credentials';

describe('parseAssumeRoleResponse', () => {
  it('STS の XML から一時的な鍵を取り出す', () => {
    const xml = `<AssumeRoleWithWebIdentityResponse><AssumeRoleWithWebIdentityResult><Credentials>
      <AccessKeyId>ASIAEXAMPLE</AccessKeyId><SecretAccessKey>secret</SecretAccessKey>
      <SessionToken>token</SessionToken><Expiration>2026-09-21T13:00:00Z</Expiration>
      </Credentials></AssumeRoleWithWebIdentityResult></AssumeRoleWithWebIdentityResponse>`;
    const c = parseAssumeRoleResponse(xml);
    expect(c.accessKeyId).toBe('ASIAEXAMPLE');
    expect(c.secretAccessKey).toBe('secret');
    expect(c.sessionToken).toBe('token');
    expect(c.expiration.toISOString()).toBe('2026-09-21T13:00:00.000Z');
  });
  it('鍵がなければエラーにする', () => {
    expect(() => parseAssumeRoleResponse('<Error/>')).toThrow();
  });
});
