import { createBrowserAuth } from './browser-auth';
import { OAuthHelper } from './oauth';

// Mock fetch used by OAuthHelper
const originalFetch = globalThis.fetch;

describe('browser-auth helper', () => {
  beforeEach(() => {
    // Minimal browser globals for tests (node environment)
    const mem: Record<string, string> = {};
    const fakeStorage = {
      getItem: (k: string) => (k in mem ? mem[k] : undefined),
      setItem: (k: string, v: string) => {
        mem[k] = v;
      },
      removeItem: (k: string) => {
        delete mem[k];
      },
      clear: () => {
        for (const k of Object.keys(mem)) delete mem[k];
      },
    } as unknown as Storage;

    const url = new URL('https://example.com/callback');
    (globalThis as any).window = {
      sessionStorage: fakeStorage,
      location: {
        href: url.toString(),
        search: url.search,
        assign: jest.fn(),
      },
      history: {
        replaceState: jest.fn(),
      },
    };
    // Alias common browser globals onto globalThis for convenience
    (globalThis as any).location = (globalThis as any).window.location;
    (globalThis as any).sessionStorage = (
      globalThis as any
    ).window.sessionStorage;
    (globalThis as any).history = (globalThis as any).window.history;
    (globalThis as any).document = { title: 'Test' };
  });

  afterAll(() => {
    globalThis.fetch = originalFetch as any;
  });

  const baseConfig = {
    clientId: 'client',
    redirectUri: 'https://example.com/callback',
    scopes: ['account:profile'] as string[],
  };

  it('builds auth URL and redirects on login()', async () => {
    const auth = createBrowserAuth(baseConfig);
    await auth.login();

    const assign = (globalThis.location as any).assign as any;
    expect(assign).toHaveBeenCalledTimes(1);
    const url = new URL(assign.mock.calls[0][0]);
    expect(url.origin + url.pathname).toBe(
      'https://www.pathofexile.com/oauth/authorize'
    );
    expect(url.searchParams.get('client_id')).toBe('client');
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('redirect_uri')).toBe(baseConfig.redirectUri);
    expect(url.searchParams.get('scope')).toBe('account:profile');
    expect(url.searchParams.get('code_challenge')).toBeTruthy();
    expect(url.searchParams.get('code_challenge_method')).toBe('S256');
    // state is stored
    expect(
      globalThis.sessionStorage.getItem('poe_auth_pkce_state')
    ).toBeTruthy();
  });

  it('handles redirect callback and stores tokens', async () => {
    const auth = createBrowserAuth(baseConfig);

    // Simulate previous login()
    const pkce = OAuthHelper.generatePKCE();
    const state = crypto.randomUUID();
    globalThis.sessionStorage.setItem(
      'poe_auth_pkce_state',
      JSON.stringify({ state, codeVerifier: pkce.codeVerifier })
    );

    // Mock URL with code and state
    const url = new URL('https://example.com/callback?code=abc&state=' + state);
    (globalThis.location as any).href = url.toString();
    (globalThis.location as any).search = url.search;

    // Mock token exchange
    const now = Math.floor(Date.now() / 1000);
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: 'atk',
        refresh_token: 'rtk',
        token_type: 'Bearer',
        scope: 'account:profile',
        expires_in: 3600,
      }),
    });

    const set = await auth.handleRedirectCallback();
    expect(set.access_token).toBe('atk');
    expect(set.refresh_token).toBe('rtk');
    expect(set.expires_at).toBeGreaterThanOrEqual(now);

    const stored = auth.getTokenSet();
    expect(stored?.access_token).toBe('atk');
    expect((globalThis.history as any).replaceState).toHaveBeenCalled();
  });

  it('refreshes token when near expiry in getAccessToken()', async () => {
    // Custom storage holding an expiring token
    const soon = Math.floor(Date.now() / 1000) + 10;
    let store = {
      access_token: 'old',
      refresh_token: 'rtk',
      token_type: 'Bearer',
      scope: 'account:profile',
      expires_at: soon,
    };
    const storage = {
      get: () => store,
      set: (t: any) => {
        store = t;
      },
      clear: () => {
        // noop
      },
    };

    const auth = createBrowserAuth(baseConfig, storage as any);

    // Mock refresh
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: 'new',
        refresh_token: 'rtk2',
        token_type: 'Bearer',
        scope: 'account:profile',
        expires_in: 3600,
      }),
    });

    const token = await auth.getAccessToken();
    expect(token).toBe('new');
  });
});
