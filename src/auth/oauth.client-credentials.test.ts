import { OAuthHelper } from './oauth';

describe('OAuthHelper.getClientCredentialsToken', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
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
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(token) });

    const res = await OAuthHelper.getClientCredentialsToken(base);
    expect(res).toEqual(token);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://www.pathofexile.com/oauth/token',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
    );
  });

  it('throws on non-ok response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, statusText: 'Forbidden' });
    await expect(OAuthHelper.getClientCredentialsToken(base)).rejects.toThrow('Client credentials failed: Forbidden');
  });

  it('requires clientSecret', async () => {
    await expect(
      OAuthHelper.getClientCredentialsToken({ clientId: 'cid', scopes: ['service:psapi'] }) as any
    ).rejects.toThrow('Client secret is required for client_credentials grant');
  });
});
