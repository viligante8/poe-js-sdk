import {
  OAuthHelper,
  type OAuthConfig,
  type TokenResponse,
  type PKCEParameters,
} from './oauth';

/**
 * A stored token set for browser apps. `expires_at` is epoch seconds when the
 * access token will expire (with a small safety skew applied).
 */
export interface TokenSet {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  scope: string;
  /** Epoch seconds when the access token expires */
  expires_at: number;
}

/**
 * Minimal persistence interface for storing token sets. Provide your own to
 * integrate with custom storage; defaults to sessionStorage when available.
 */
export interface TokenStorage {
  get(): TokenSet | undefined;
  set(tokens: TokenSet): void;
  clear(): void;
}

class InMemoryStorage implements TokenStorage {
  private value: TokenSet | undefined;
  get(): TokenSet | undefined {
    return this.value;
  }
  set(tokens: TokenSet): void {
    this.value = tokens;
  }
  clear(): void {
    this.value = undefined;
  }
}

class WebStorage implements TokenStorage {
  constructor(
    private store: Storage,
    private key = 'poe_auth_tokens'
  ) {}
  get(): TokenSet | undefined {
    try {
      const raw = this.store.getItem(this.key);
      return raw ? (JSON.parse(raw) as TokenSet) : undefined;
    } catch {
      return undefined;
    }
  }
  set(tokens: TokenSet): void {
    this.store.setItem(this.key, JSON.stringify(tokens));
  }
  clear(): void {
    this.store.removeItem(this.key);
  }
}

const PKCE_STATE_KEY = 'poe_auth_pkce_state';

/**
 * High-level browser auth API for SPAs.
 */
export type BrowserAuth = {
  login(): Promise<void>;
  handleRedirectCallback(): Promise<TokenSet>;
  getAccessToken(): Promise<string>;
  getTokenSet(): TokenSet | undefined;
  logout(): void;
  setOnTokenChange(handler?: (t: TokenSet | undefined) => void): void;
};

/**
 * Configuration for browser auth. Do not include client secrets in public apps
 * unless you are using a confidential client behind a trusted server.
 */
export type BrowserAuthConfig = Pick<
  OAuthConfig,
  'clientId' | 'redirectUri' | 'scopes' | 'clientSecret'
>;

/**
 * Create a browser-only auth helper that manages PKCE, redirects and token refresh.
 * Use from SPAs and import via `poe-js-sdk/browser-auth` to avoid pulling Node-only code.
 */
export function createBrowserAuth(
  config: BrowserAuthConfig,
  storage?: TokenStorage
): BrowserAuth {
  type GlobalWithWindow = { window?: Window; document?: Document };
  const g = globalThis as unknown as GlobalWithWindow;
  const hasWindow = !!g.window?.location;
  const tokenStorage: TokenStorage =
    storage ||
    (hasWindow && g.window?.sessionStorage !== undefined
      ? new WebStorage(g.window.sessionStorage)
      : new InMemoryStorage());

  // Accept an optional parameter internally so calling without args is valid in all environments
  let onTokenChange: ((t?: TokenSet) => void) | undefined;

  function saveTokensFromResponse(token: TokenResponse): TokenSet {
    const now = Math.floor(Date.now() / 1000);
    const expires_at = now + Math.max(0, token.expires_in - 30); // 30s skew
    const base: Omit<TokenSet, 'refresh_token'> & { refresh_token?: string } = {
      access_token: token.access_token,
      token_type: token.token_type,
      scope: token.scope,
      expires_at,
    };
    if (token.refresh_token) base.refresh_token = token.refresh_token;
    const tokenSet: TokenSet = base as TokenSet;
    tokenStorage.set(tokenSet);
    if (onTokenChange) onTokenChange(tokenSet);
    return tokenSet;
  }

  async function maybeRefresh(tokenSet: TokenSet): Promise<TokenSet> {
    const now = Math.floor(Date.now() / 1000);
    if (tokenSet.expires_at - now > 60) return tokenSet; // still valid
    if (!tokenSet.refresh_token) return tokenSet; // cannot refresh
    const cfg: OAuthConfig = {
      clientId: config.clientId,
      redirectUri: config.redirectUri,
      scopes: config.scopes,
      ...(config.clientSecret ? { clientSecret: config.clientSecret } : {}),
    };
    const refreshed = await OAuthHelper.refreshToken(
      cfg,
      tokenSet.refresh_token
    );
    return saveTokensFromResponse(refreshed);
  }

  async function generateBrowserPKCE(): Promise<PKCEParameters> {
    // Prefer Web Crypto when available (browser/edge runtimes)
    type MaybeCrypto = {
      crypto?: {
        subtle?: SubtleCrypto;
        getRandomValues?: (array: Uint8Array) => void;
      };
    };
    const g = globalThis as MaybeCrypto;
    if (g.crypto?.subtle && g.crypto.getRandomValues) {
      const toBase64Url = (buf: ArrayBuffer) => {
        // Use btoa when available (browsers). Fallback to Buffer in Node.
        const bytes = new Uint8Array(buf);
        if (typeof btoa === 'function') {
          let binary = '';
          for (const b of bytes) binary += String.fromCodePoint(b);
          return btoa(binary)
            .replaceAll('+', '-')
            .replaceAll('/', '_')
            .replace(/=+$/, '');
        }
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
      const rnd = new Uint8Array(32);
      g.crypto.getRandomValues(rnd);
      const codeVerifier = toBase64Url(rnd.buffer);
      const digest = await g.crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(codeVerifier)
      );
      const codeChallenge = toBase64Url(digest);
      return { codeVerifier, codeChallenge };
    }
    // Fallback to OAuthHelper (Node environments)
    return await OAuthHelper.generatePKCE();
  }

  return {
    async login(): Promise<void> {
      if (!hasWindow) throw new Error('login() requires a browser environment');
      const state = crypto.randomUUID();
      const pkce = await generateBrowserPKCE();
      // Persist state and codeVerifier for callback validation
      const stateBlob = { state, codeVerifier: pkce.codeVerifier };
      g.window!.sessionStorage.setItem(
        PKCE_STATE_KEY,
        JSON.stringify(stateBlob)
      );
      const authCfg: OAuthConfig = {
        clientId: config.clientId,
        redirectUri: config.redirectUri,
        scopes: config.scopes,
        ...(config.clientSecret ? { clientSecret: config.clientSecret } : {}),
      };
      const url = OAuthHelper.buildAuthUrl(authCfg, state, pkce);
      g.window!.location.assign(url);
    },

    async handleRedirectCallback(): Promise<TokenSet> {
      if (!hasWindow)
        throw new Error('handleRedirectCallback() requires a browser');
      const parameters = new URLSearchParams(g.window!.location.search);
      const code = parameters.get('code');
      const state = parameters.get('state');
      const error = parameters.get('error');
      if (error) throw new Error(`Authorization error: ${error}`);
      if (!code || !state) throw new Error('Missing code or state');

      const raw = g.window!.sessionStorage.getItem(PKCE_STATE_KEY);
      if (!raw) throw new Error('Missing stored PKCE state');
      const parsed = JSON.parse(raw) as { state: string; codeVerifier: string };
      if (parsed.state !== state) throw new Error('State mismatch');

      const exCfg: OAuthConfig = {
        clientId: config.clientId,
        redirectUri: config.redirectUri,
        scopes: config.scopes,
        ...(config.clientSecret ? { clientSecret: config.clientSecret } : {}),
      };
      const token = await OAuthHelper.exchangeCodeForToken(
        exCfg,
        code,
        parsed.codeVerifier
      );

      g.window!.sessionStorage.removeItem(PKCE_STATE_KEY);

      // Clean query string without reloading
      try {
        const url = new URL(g.window!.location.href);
        url.search = '';
        g.window!.history.replaceState(
          {},
          g.document?.title ?? '',
          url.toString()
        );
      } catch {
        // ignore
      }

      return saveTokensFromResponse(token);
    },

    async getAccessToken(): Promise<string> {
      const current = tokenStorage.get();
      if (!current) throw new Error('Not authenticated');
      const refreshed = await maybeRefresh(current);
      return refreshed.access_token;
    },

    getTokenSet(): TokenSet | undefined {
      return tokenStorage.get();
    },

    logout(): void {
      tokenStorage.clear();
      if (onTokenChange) onTokenChange();
    },

    setOnTokenChange(handler?: (t: TokenSet | undefined) => void): void {
      onTokenChange = handler;
    },
  };
}

/**
 * Built-in storage implementations.
 */
export const Storages = {
  InMemory: InMemoryStorage,
  Web: WebStorage,
};
