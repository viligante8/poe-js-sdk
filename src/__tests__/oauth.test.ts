import { OAuthHelper } from '../auth/oauth';

describe('OAuthHelper', () => {
  const mockConfig = {
    clientId: 'test-client-id',
    redirectUri: 'http://localhost:8080/callback',
    scopes: ['account:profile', 'account:characters'],
  };

  describe('generatePKCE', () => {
    it('should generate PKCE parameters', async () => {
      const pkce = await OAuthHelper.generatePKCE();

      expect(pkce.codeVerifier).toBeDefined();
      expect(pkce.codeChallenge).toBeDefined();
      expect(typeof pkce.codeVerifier).toBe('string');
      expect(typeof pkce.codeChallenge).toBe('string');
      expect(pkce.codeVerifier.length).toBeGreaterThan(0);
      expect(pkce.codeChallenge.length).toBeGreaterThan(0);
    });

    it('should generate different values each time', async () => {
      const pkce1 = await OAuthHelper.generatePKCE();
      const pkce2 = await OAuthHelper.generatePKCE();

      expect(pkce1.codeVerifier).not.toBe(pkce2.codeVerifier);
      expect(pkce1.codeChallenge).not.toBe(pkce2.codeChallenge);
    });
  });

  describe('buildAuthUrl', () => {
    it('should build authorization URL without PKCE', () => {
      const state = 'test-state';
      const url = OAuthHelper.buildAuthUrl(mockConfig, state);

      expect(url).toContain('https://www.pathofexile.com/oauth/authorize');
      expect(url).toContain(`client_id=${mockConfig.clientId}`);
      expect(url).toContain(
        `redirect_uri=${encodeURIComponent(mockConfig.redirectUri)}`
      );
      expect(url).toContain(`scope=account%3Aprofile+account%3Acharacters`);
      expect(url).toContain(`state=${state}`);
      expect(url).toContain('response_type=code');
    });

    it('should build authorization URL with PKCE', async () => {
      const state = 'test-state';
      const pkce = await OAuthHelper.generatePKCE();
      const url = OAuthHelper.buildAuthUrl(mockConfig, state, pkce);

      expect(url).toContain(`code_challenge=${pkce.codeChallenge}`);
      expect(url).toContain('code_challenge_method=S256');
    });
  });

  describe('exchangeCodeForToken', () => {
    beforeEach(() => {
      globalThis.fetch = jest.fn();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should exchange authorization code for token', async () => {
      const mockResponse = {
        access_token: 'test-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
        scope: 'account:profile',
      };

      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await OAuthHelper.exchangeCodeForToken(
        mockConfig,
        'test-code'
      );

      expect(result).toEqual(mockResponse);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://www.pathofexile.com/oauth/token',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
      );
    });

    it('should handle token exchange errors with details', async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () =>
          Promise.resolve({
            error: 'invalid_grant',
            error_description: 'Authorization code expired',
          }),
      });

      await expect(
        OAuthHelper.exchangeCodeForToken(mockConfig, 'invalid-code')
      ).rejects.toEqual(
        expect.objectContaining({
          status: 400,
          message: expect.stringMatching(
            /(400).*invalid_grant|invalid_grant.*(400)/
          ),
        })
      );
    });
  });
});
