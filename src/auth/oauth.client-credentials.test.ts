import { OAuthHelper } from './oauth';

describe('OAuthHelper.getClientCredentialsToken', () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn();
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  const base = {
    clientId: 'cid',
    clientSecret: 'csecret',
    scopes: ['service:leagues', 'service:leagues:ladder'] as string[],
  };

  it('requests token with correct body and returns TokenResponse', async () => {
    const token = {
      access_token: 'svc-token',
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'service:leagues service:leagues:ladder',
    };
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(token),
    });

    const response = await OAuthHelper.getClientCredentialsToken(base);
    expect(response).toEqual(token);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://www.pathofexile.com/oauth/token',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
    );
  });

  it('throws on non-ok response with details', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
      json: () =>
        Promise.resolve({
          error: 'access_denied',
          error_description: 'Service scopes not allowed for public client',
        }),
    });
    try {
      await OAuthHelper.getClientCredentialsToken(base);
      fail('Expected client credentials request to throw');
    } catch (e: any) {
      expect(String(e.message)).toContain('403');
      expect(String(e.message)).toContain('access_denied');
      expect(e.status).toBe(403);
    }
  });

  it('requires clientSecret', async () => {
    await expect(
      OAuthHelper.getClientCredentialsToken({
        clientId: 'cid',
        scopes: ['service:psapi'],
      }) as any
    ).rejects.toThrow('Client secret is required for client_credentials grant');
  });
});
