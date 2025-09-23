---
id: examples
title: Examples
---

Explore the `examples/` directory in the repository for comprehensive usage:

- `examples/basic-usage.ts` – Quick API usage
- `examples/browser-auth.ts` – Minimal SPA auth helper wiring
- `examples/trade-example.ts` – Basic trade search
- `examples/enhanced-trade-example.ts` – Advanced queries and grouping
- `examples/nextjs/` – Next.js App Router auth flow with httpOnly cookies

Sample snippets:

```ts
// SPA login (Authorization Code + PKCE)
import { createBrowserAuth } from 'poe-js-sdk/browser-auth';
import { PoEApiClient } from 'poe-js-sdk';

const auth = createBrowserAuth({
  clientId: '<public-client-id>',
  redirectUri: 'http://localhost:5173/callback',
  scopes: ['account:profile'],
});

document.getElementById('login')!.addEventListener('click', () => auth.login());

if (location.search.includes('code=')) {
  await auth.handleRedirectCallback();
}

const client = new PoEApiClient({
  userAgent: 'OAuth myapp/1.0.0 (contact: you@example.com)',
  accessToken: await auth.getAccessToken(),
});
const profile = await client.getProfile();

// League ladder sorted by class
await client.getLeagueLadder('Affliction', {
  realm: 'pc',
  sort: 'class',
  class: 'witch',
  limit: 50,
});

// Ladder pagination helper
import { LadderPager } from 'poe-js-sdk';
const pager = new LadderPager(client, 'Affliction', { realm: 'pc', limit: 200 });
await pager.loadFirst();
while (await pager.next()) {
  // process pager.entries
}
```
