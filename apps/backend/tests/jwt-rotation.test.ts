import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import crypto from 'crypto';
import { Buffer } from 'buffer';

function base64UrlEncode(input: string): string {
  return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function manuallySignJwt(payload: object, secret: string, kid?: string): string {
  const header = { alg: 'HS256', typ: 'JWT', kid: kid ?? '1' };
  const data = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(payload))}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `${data}.${signature}`;
}

describe('JWT Key Rotation & Security Validation', () => {

  beforeEach(() => {
    vi.stubEnv('AUTH_JWT_SECRETS', 'new-secret-2026,old-secret-2025');
    vi.stubEnv('AUTH_JWT_SECRET', 'new-secret-2026');
    vi.stubEnv('AUTH_JWT_KID', '2');
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('1. verifyJwt should accept token signed by CURRENT secret', async () => {
    const { createAuthToken, verifyJwt } = await import('../src/services/authService');

    const { token } = createAuthToken('test-subject');
    const decoded = verifyJwt(token);
    expect(decoded.sub).toBe('test-subject');
  });

  it('2. verifyJwt should accept token signed by OLD secret in rotation vault', async () => {
    const { verifyJwt } = await import('../src/services/authService');
    const nowSeconds = Math.floor(Date.now() / 1000);
    
    const oldToken = manuallySignJwt(
      { sub: 'old-user', exp: nowSeconds + 3600 },
      'old-secret-2025',
      '1'
    );
    
    const decoded = verifyJwt(oldToken);
    expect(decoded.sub).toBe('old-user');
  });

  it('3. verifyJwt should REJECT token signed by UNKNOWN secret', async () => {
    const { verifyJwt } = await import('../src/services/authService');
    const nowSeconds = Math.floor(Date.now() / 1000);
    const badToken = manuallySignJwt(
      { sub: 'hacker', exp: nowSeconds + 3600 },
      'hacker-secret',
      '99'
    );
    
    expect(() => verifyJwt(badToken)).toThrow('INVALID_SIGNATURE');
  });

  it('4. verifyJwt should REJECT expired token even with correct signature', async () => {
    const { verifyJwt } = await import('../src/services/authService');
    const pastSeconds = Math.floor(Date.now() / 1000) - 100;
    const expiredToken = manuallySignJwt(
      { sub: 'late-user', exp: pastSeconds },
      'new-secret-2026',
      '2'
    );
    
    expect(() => verifyJwt(expiredToken)).toThrow('TOKEN_EXPIRED');
  });

  it('5. verifyJwt should REJECT malformed token strings', async () => {
    const { verifyJwt } = await import('../src/services/authService');
    expect(() => verifyJwt('just.two')).toThrow('INVALID_TOKEN_FORMAT');
    expect(() => verifyJwt('one_no_dot')).toThrow('INVALID_TOKEN_FORMAT');
  });

});
