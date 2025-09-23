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
