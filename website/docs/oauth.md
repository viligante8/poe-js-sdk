---
id: oauth
title: OAuth 2.1
---

The SDK supports Authorization Code + PKCE, Refresh Token, and Client Credentials (service scopes for confidential clients only).

## Browser Auth Helper (SPA)

See also: [Browser Auth (SPA)](./browser-auth.md) for storage, lifecycle, and error handling details.

```ts
import { createBrowserAuth } from 'poe-js-sdk/browser-auth';
import { PoEApiClient } from 'poe-js-sdk';

const auth = createBrowserAuth({
  clientId: '<public-client-id>',
  redirectUri: 'http://127.0.0.1:8080/callback',
  scopes: ['account:profile'],
});

// Start login
auth.login();

// On your redirectUri page
await auth.handleRedirectCallback();

// Use the access token
const client = new PoEApiClient({
  userAgent: 'OAuth myapp/1.0.0 (contact: dev@example.com)',
  accessToken: await auth.getAccessToken(),
});
```

Notes:
- Uses PKCE and `state` automatically; no secrets in the browser.
- Tokens stored in `sessionStorage` by default; you can inject a custom storage.
- Automatically refreshes when near expiry.

## Grants

```ts
import { OAuthHelper } from 'poe-js-sdk';

// 1) Build auth URL (PKCE)
const state = crypto.randomUUID();
const pkce = await OAuthHelper.generatePKCE();
const url = OAuthHelper.buildAuthUrl({
  clientId: process.env.OAUTH_CLIENT_ID!,
  redirectUri: 'http://127.0.0.1:8080/callback',
  scopes: ['account:profile'],
}, state, pkce);

// 2) Exchange code
const token = await OAuthHelper.exchangeCodeForToken({
  clientId: process.env.OAUTH_CLIENT_ID!,
  clientSecret: process.env.OAUTH_CLIENT_SECRET, // confidential only
  redirectUri: 'http://127.0.0.1:8080/callback',
  scopes: ['account:profile'],
}, '<authorization_code>', pkce.codeVerifier);

// 3) Client credentials (service scopes)
const svcToken = await OAuthHelper.getClientCredentialsToken({
  clientId: process.env.OAUTH_CLIENT_ID!,
  clientSecret: process.env.OAUTH_CLIENT_SECRET!,
  scopes: ['service:leagues', 'service:leagues:ladder'],
});
```

## User‑Agent

```
User-Agent: OAuth {clientId}/{version} (contact: {email}) OptionalInfo
```

## Third‑Party Notice

This product isn't affiliated with or endorsed by Grinding Gear Games in any way.
