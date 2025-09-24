// Universal PKCE generation uses Web Crypto when available and falls back to Node.

/**
 * OAuth configuration used by {@link OAuthHelper}.
 */
export interface OAuthConfig {
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  scopes: string[];
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

export interface PKCEParameters {
  codeVerifier: string;
  codeChallenge: string;
}

/**
 * Helpers for OAuth 2.1 flows used by the PoE API.
 *
 * @see https://www.pathofexile.com/developer/docs/authorization
 */
export class OAuthHelper {
  private static readonly AUTH_URL =
    'https://www.pathofexile.com/oauth/authorize';
  private static readonly TOKEN_URL = 'https://www.pathofexile.com/oauth/token';

  /**
   * Generate PKCE code verifier and code challenge (S256).
   *
   * Breaking change (v2): this method is now async and universal.
   * - Uses Web Crypto in Edge/Workers/Browsers
   * - Falls back to Node's crypto in server runtimes
   */
  static async generatePKCE(): Promise<PKCEParameters> {
    type MaybeWebCrypto = {
      crypto?: {
        subtle?: SubtleCrypto;
        getRandomValues?: (array: Uint8Array) => void;
      };
    };
    const g = globalThis as unknown as MaybeWebCrypto;

    const toBase64Url = (data: ArrayBuffer | Uint8Array) => {
      const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
      // Use btoa in browser-like environments
      if (typeof (globalThis as unknown as { btoa?: unknown }).btoa === 'function') {
        let binary = '';
        for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (btoa as any)(binary)
          .replaceAll('+', '-')
          .replaceAll('/', '_')
          .replace(/=+$/, '');
      }
      // Fallback to Node's Buffer
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const B: any = (globalThis as any).Buffer;
      if (B && typeof B.from === 'function') {
        return B.from(bytes)
          .toString('base64')
          .replaceAll('+', '-')
          .replaceAll('/', '_')
          .replace(/=+$/, '');
      }
      throw new Error('No Base64 encoder available');
    };

    if (g.crypto?.subtle && g.crypto.getRandomValues) {
      const rnd = new Uint8Array(32);
      g.crypto.getRandomValues(rnd);
      const codeVerifier = toBase64Url(rnd);
      const digest = await g.crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(codeVerifier)
      );
      const codeChallenge = toBase64Url(digest);
      return { codeVerifier, codeChallenge };
    }

    // Node fallback
    // Dynamic import to avoid pulling Node-only crypto into edge bundles
    const nodeCrypto = await import('node:crypto');
    const codeVerifier = nodeCrypto.randomBytes(32).toString('base64url');
    const codeChallenge = nodeCrypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');
    return { codeVerifier, codeChallenge };
  }

  /**
   * Build authorization URL for the Authorization Code flow (supports PKCE).
   * @param config Client configuration
   * @param state Opaque anti-CSRF token
   * @param pkce Optional PKCE values (recommended for public clients)
   * @see https://www.pathofexile.com/developer/docs/authorization#authorization_code
   */
  static buildAuthUrl(
    config: OAuthConfig,
    state: string,
    pkce?: PKCEParameters
  ): string {
    const parameters = new URLSearchParams({
      client_id: config.clientId,
      response_type: 'code',
      redirect_uri: config.redirectUri,
      scope: config.scopes.join(' '),
      state,
    });

    if (pkce) {
      parameters.append('code_challenge', pkce.codeChallenge);
      parameters.append('code_challenge_method', 'S256');
    }

    return `${this.AUTH_URL}?${parameters.toString()}`;
  }

  /**
   * Exchange authorization code for an access token.
   * @see https://www.pathofexile.com/developer/docs/authorization#tokens
   */
  static async exchangeCodeForToken(
    config: OAuthConfig,
    code: string,
    codeVerifier?: string
  ): Promise<TokenResponse> {
    const body = new URLSearchParams({
      client_id: config.clientId,
      grant_type: 'authorization_code',
      code,
      redirect_uri: config.redirectUri,
    });

    if (config.clientSecret) {
      body.append('client_secret', config.clientSecret);
    }

    if (codeVerifier) {
      body.append('code_verifier', codeVerifier);
    }

    const response = await fetch(this.TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Refresh an access token using a refresh token.
   * @see https://www.pathofexile.com/developer/docs/authorization#tokens
   */
  static async refreshToken(
    config: OAuthConfig,
    refreshToken: string
  ): Promise<TokenResponse> {
    const body = new URLSearchParams({
      client_id: config.clientId,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });

    if (config.clientSecret) {
      body.append('client_secret', config.clientSecret);
    }

    const response = await fetch(this.TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Client Credentials grant for service scopes (confidential clients only).
   * Note: Public clients cannot request `service:*` scopes.
   * @see https://www.pathofexile.com/developer/docs/authorization#client_credentials
   */
  static async getClientCredentialsToken(
    config: Pick<OAuthConfig, 'clientId' | 'clientSecret' | 'scopes'>
  ): Promise<TokenResponse> {
    if (!config.clientSecret) {
      throw new Error('Client secret is required for client_credentials grant');
    }

    const body = new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: 'client_credentials',
      scope: config.scopes.join(' '),
    });

    const response = await fetch(this.TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!response.ok) {
      throw new Error(`Client credentials failed: ${response.statusText}`);
    }

    return response.json();
  }
}
