---
id: getting-started
title: Getting Started
---

This guide gets you up and running quickly.

## Installation

```bash
npm install poe-js-sdk
```

## Official API – Profile

```ts
import { PoEApiClient, OAuthHelper } from 'poe-js-sdk';

const oauthConfig = {
  clientId: 'your-client-id',
  redirectUri: 'http://localhost:8080/callback',
  scopes: ['account:profile', 'account:characters'],
};

const pkce = OAuthHelper.generatePKCE();
const authUrl = OAuthHelper.buildAuthUrl(oauthConfig, 'random-state', pkce);
console.log('Visit:', authUrl);

// After callback
const tokens = await OAuthHelper.exchangeCodeForToken(oauthConfig, 'code', pkce.codeVerifier);

const client = new PoEApiClient({
  accessToken: tokens.access_token,
  userAgent: 'MyApp/1.0.0 (contact: you@example.com)',
});

const profile = await client.getProfile();
console.log(`Hello, ${profile.name}!`);
```

## SPA Auth Helper (PKCE)

```ts
import { createBrowserAuth } from 'poe-js-sdk/browser-auth';
import { PoEApiClient } from 'poe-js-sdk';

const auth = createBrowserAuth({
  clientId: 'your-client-id',
  redirectUri: 'http://localhost:8080/callback',
  scopes: ['account:profile'],
});

auth.login();
await auth.handleRedirectCallback();

const client = new PoEApiClient({
  userAgent: 'MyApp/1.0.0 (contact: you@example.com)',
  accessToken: await auth.getAccessToken(),
});
```

## Trade Search – Quick Example (Unofficial)

```ts
import { TradeClient, TradeQueryBuilder, ItemCategories, Currencies } from 'poe-js-sdk';

const tradeClient = new TradeClient({
  poesessid: 'your-poesessid-cookie',
});

const query = new TradeQueryBuilder()
  .onlineOnly(true)
  .category(ItemCategories.ACCESSORY_RING)
  .price(Currencies.CHAOS, 1, 50)
  .andStats([{ id: 'explicit.stat_3299347043', min: 70 }])
  .build();

const results = await tradeClient.searchAndFetch('Standard', query, 10);
console.log(`Found ${results.search.total} rings`);
```

## Next Steps

- Read the detailed guides (OAuth, Trade, Rate Limiting)
- Explore the API Reference
- Try the `examples/` directory in the repository

