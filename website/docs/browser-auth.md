---
id: browser-auth
title: Browser Auth (SPA)
---

Use the high-level SPA helper to implement OAuth Authorization Code + PKCE entirely in the browser. Import from `poe-js-sdk/browser-auth` to avoid bundling any Node-only code.

Scopes: request only `account:*` during user login. Do not request `service:*` in the browser; `service:*` is for confidential clients using the Client Credentials grant on the server.

## Quick Start

```ts
import { createBrowserAuth } from 'poe-js-sdk/browser-auth';
import { PoEApiClient } from 'poe-js-sdk';

const auth = createBrowserAuth({
  clientId: '<public-client-id>',
  redirectUri: 'http://localhost:5173/callback',
  scopes: ['account:profile'],
});

// Start login (e.g. on button click)
await auth.login();

// On the redirectUri page
await auth.handleRedirectCallback();

// Use the token
const client = new PoEApiClient({
  userAgent: 'OAuth myapp/1.0.0 (contact: you@example.com)',
  accessToken: await auth.getAccessToken(),
});
const profile = await client.getProfile();
```

- PKCE and `state` are handled automatically.
- No client secret in the browser. Use a confidential client only on the server.
- Default storage is `sessionStorage` (see Storage below).
- Tokens auto-refresh when near expiry if a `refresh_token` exists.

## Full Flow

```ts
// 1) Create once at app startup
const auth = createBrowserAuth({
  clientId: '<public-client-id>',
  redirectUri: 'http://localhost:5173/callback',
  scopes: ['account:profile'],
});

// 2) Trigger login (button)
document.getElementById('login')!.addEventListener('click', () => auth.login());

// 3) On your callback route/page
if (location.search.includes('code=')) {
  await auth.handleRedirectCallback();
}

// 4) Call APIs using a fresh access token
const token = await auth.getAccessToken();
```

## Storage

Tokens persist via a minimal `TokenStorage` interface. By default, the helper uses `sessionStorage` (when available) to avoid lingering sessions after the tab closes.

Options:

```ts
import { createBrowserAuth, Storages } from 'poe-js-sdk/browser-auth';

// Default (sessionStorage)
createBrowserAuth(cfg); // uses sessionStorage internally

// Local storage (persist across sessions)
createBrowserAuth(cfg, new Storages.Web(localStorage, 'poe_auth_tokens'));

// In-memory (clears on reload)
createBrowserAuth(cfg, new Storages.InMemory());
```

You can also provide your own custom storage by implementing:

```ts
interface TokenStorage {
  get(): TokenSet | undefined;
  set(tokens: TokenSet): void;
  clear(): void;
}
```

## Token Lifecycle

- `getAccessToken()` refreshes automatically when the token is close to expiry (if `refresh_token` exists).
- `getTokenSet()` returns the raw stored tokens (without forcing refresh).
- `logout()` clears storage.
- `setOnTokenChange(handler)` lets you update UI when tokens are written/cleared.

```ts
auth.setOnTokenChange((t) => {
  const isAuthed = !!t?.access_token;
  // e.g., show/hide authenticated UI
});
```

## Error Handling

`handleRedirectCallback()` validates `state` and requires an OAuth `code`. Errors include:

- `Authorization error: <error>` if provider returns an error param
- `Missing code or state` when query params are incomplete
- `State mismatch` when the stored state doesn’t match the redirect

Wrap calls in try/catch to present a helpful UI.

## Minimal Vanilla Example

```html
<!-- index.html -->
<button id="login">Login</button>
<script type="module">
  import { createBrowserAuth } from 'poe-js-sdk/browser-auth';
  import { PoEApiClient } from 'poe-js-sdk';

  const auth = createBrowserAuth({
    clientId: '<public-client-id>',
    redirectUri: location.origin + '/callback',
    scopes: ['account:profile'],
  });

  document.getElementById('login').addEventListener('click', () => auth.login());

  if (location.pathname === '/callback' && location.search.includes('code=')) {
    await auth.handleRedirectCallback();
    location.replace('/');
  }

  // Later, when calling the API
  async function fetchProfile() {
    const client = new PoEApiClient({
      userAgent: 'OAuth myapp/1.0.0 (contact: you@example.com)',
      accessToken: await auth.getAccessToken(),
    });
    console.log(await client.getProfile());
  }
  // fetchProfile();
  </script>
```

## Tips

- Use `http://localhost` or `http://127.0.0.1` in dev and add your redirect URI in the PoE developer portal.
- Keep `clientSecret` out of browser builds. Use server routes if you need confidential features.
- For a full Next.js flow with cookie storage and API routes, see the Next.js guide and `examples/nextjs/`.
