# Path of Exile SDK (TypeScript)

Docs: https://viligante8.github.io/poe-js-sdk/

## Browser Auth (SPA)

Use the high-level helper for Authorization Code + PKCE entirely in the browser. Import from `poe-js-sdk/browser-auth` so your bundler excludes Node-only code.

```ts
import { createBrowserAuth } from 'poe-js-sdk/browser-auth';
import { PoEApiClient } from 'poe-js-sdk';

const auth = createBrowserAuth({
  clientId: '<public-client-id>',
  redirectUri: 'http://localhost:5173/callback',
  scopes: ['account:profile'],
});

// Start login (e.g., on button click)
await auth.login();

// On your callback page
await auth.handleRedirectCallback();

// Call APIs
const client = new PoEApiClient({
  userAgent: 'OAuth myapp/1.0.0 (contact: you@example.com)',
  accessToken: await auth.getAccessToken(),
});
```

More in the guides: `Browser Auth (SPA)`, `OAuth 2.1`, and the `examples/` folder (including a Next.js reference implementation).

## Edge/Workers runtimes (Next.js Edge, Cloudflare Workers, Bun, Deno)

Some runtimes don’t provide Node’s `crypto.randomBytes`. As of v2, `OAuthHelper.generatePKCE()` is async and universal, using Web Crypto where available and falling back to Node.

```ts
import { OAuthHelper } from 'poe-js-sdk';

export async function GET() {
  const state = crypto.randomUUID();
  const pkce = await OAuthHelper.generatePKCE();
  const url = OAuthHelper.buildAuthUrl(
    { clientId, redirectUri, scopes },
    state,
    pkce
  );
  // redirect to url...
}
```

- Use `createBrowserAuth()` for SPA-only flows.
