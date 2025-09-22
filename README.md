# Path of Exile SDK (TypeScript)

Typed client for the official Path of Exile API (PoE1 + limited PoE2) with:
- OAuth 2.1 helpers (PKCE, refresh, client credentials for service scopes)
- Automatic, header‑driven rate‑limit compliance
- Fully typed endpoints (ladders, PvP, stashes, characters, filters, leagues)
- Optional, clearly labeled Unofficial Trade API client

Server: `https://api.pathofexile.com`

This SDK follows the official docs found on https://www.pathofexile.com/developer/docs.

> Note: This package was renamed. Former names you might see in older docs or code:
> - `poe-api-sdk`
> - `poe-sdk`
> The current and correct name is `poe-js-sdk`.

## Install

Install from GitHub (for SSR):

```
npm install github:viligante8/poe-js-sdk
```

Note: when installing from a Git repo, npm runs the `prepare` script to build `dist/`. If your CI disables lifecycle scripts (e.g. `--ignore-scripts`), SSR may fail to resolve the entry. Ensure `prepare` runs or build manually (`npm run build`).

## Exports

- Runtime: `PoEApiClient`, `TradeClient`, helpers (`LadderPager`, `publicStashStream`)
- OAuth: `OAuthHelper`
- Browser (subpath): `createBrowserAuth` (import from `poe-js-sdk/browser-auth`)
- Types: `Profile`, `League`, `Character`, `Item`, `StashTab`, `PvpMatch`, `LeagueAccount`, `Ladder`, `LadderEntry`, `EventLadderEntry`, `PvPLadderTeamEntry`, `ItemFilter`, `PublicStashesResponse`, `CurrencyExchangeResponse`, `RateLimitInfo`, `Realm`, trade types

Type definitions are included in `dist/index.d.ts` and re-exported from the entry. You can `import type { ... } from 'poe-js-sdk'` directly.

## Quick Start

```ts
import { PoEApiClient } from 'poe-js-sdk';

const client = new PoEApiClient({
  userAgent: 'OAuth myapp/1.0.0 (contact: dev@example.com)',
  accessToken: '<user-or-service-access-token>',
});

const profile = await client.getProfile();
console.log(profile.name);
```

## Authorization (OAuth 2.1)

### Browser Auth Helper (SPA)

For SPAs, you can use a thin helper that wires PKCE + state + redirects for you.

```ts
// Import the browser-safe build to avoid Node polyfills
import { createBrowserAuth } from 'poe-js-sdk/browser-auth';
import { PoEApiClient } from 'poe-js-sdk';

const auth = createBrowserAuth({
  clientId: '<public-client-id>',
  redirectUri: 'http://127.0.0.1:8080/callback',
  scopes: ['account:profile']
});

// Start login
document.getElementById('login')!.onclick = () => auth.login();

// On your redirectUri page
if (location.search.includes('code=')) {
  await auth.handleRedirectCallback();
}

// Use the access token
const client = new PoEApiClient({
  userAgent: 'OAuth myapp/1.0.0 (contact: dev@example.com)',
  accessToken: await auth.getAccessToken(),
});
```

Notes:
- Uses PKCE and `state` automatically; no secrets in the browser.
- Stores tokens in `sessionStorage` by default; you can inject a custom storage.
- Will refresh the access token automatically when it’s near expiry.
 - Import from `poe-js-sdk/browser-auth` (browser-only build) to avoid bundling Node deps.

### Grants
- Authorization Code + PKCE (user consent)
- Refresh Token
- Client Credentials (service scopes, confidential clients only)

```ts
import { OAuthHelper } from 'poe-js-sdk';

// 1) PKCE auth URL (public or confidential)
const state = crypto.randomUUID();
const pkce = OAuthHelper.generatePKCE();
const url = OAuthHelper.buildAuthUrl({
  clientId: process.env.OAUTH_CLIENT_ID!,
  redirectUri: 'http://127.0.0.1:8080/callback',
  scopes: ['account:profile'],
}, state, pkce);

// 2) Exchange code
const token = await OAuthHelper.exchangeCodeForToken({
  clientId: process.env.OAUTH_CLIENT_ID!,
  clientSecret: process.env.OAUTH_CLIENT_SECRET, // only for confidential
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

Public clients cannot request `service:*` scopes.

### User‑Agent
```
User-Agent: OAuth {clientId}/{version} (contact: {email}) OptionalInfo
```

### Third‑Party Notice
```
This product isn't affiliated with or endorsed by Grinding Gear Games in any way.
```

## Official API Coverage

### Account
- Profile: `getProfile()`
- Item Filters: `getItemFilters()`, `getItemFilter(id)`, `createItemFilter()`, `updateItemFilter()`
- Characters: `getCharacters(realm?)`, `getCharacter(name, realm?)`
- Stashes (PoE1): `getStashes(league, realm?)`, `getStash(league, stashId, substashId?, realm?)`
- League Account (PoE1): `getLeagueAccount(league, realm?)`
- Account Leagues (PoE1): `getAccountLeagues(realm?)`
- Guild Stashes (PoE1): `getGuildStashes(league, realm?)`, `getGuildStash(league, stashId, substashId?, realm?)`

### Public
- Leagues: `getLeagues(realm?)`, `getLeague(id, realm?)`
- Ladders (PoE1):
  - League Ladder: `getLeagueLadder(league, { realm, limit, offset, sort, class })`
  - Event Ladder: `getLeagueEventLadder(league, { realm, limit, offset })`
- PvP Matches (PoE1): `getPvpMatches({ realm, type, season, league })`, `getPvpMatch(id, realm?)`, `getPvpMatchLadder(id, { realm, limit, offset })`
- Public Stashes (PoE1): `getPublicStashes({ realm, id })`
- Currency Exchange: `getCurrencyExchange(realm?, id?)`

### Typed Responses (examples)
- `getLeagueLadder` → `{ league: League; ladder: Ladder }`
- `getLeagueEventLadder` → `{ league: League; ladder: { total: number; entries: EventLadderEntry[] } }`
- `getPvpMatchLadder` → `{ match: PvpMatch; ladder: { total: number; entries: PvPLadderTeamEntry[] } }`

See `src/types/index.ts` for all exported types.

## Rate Limiting (Automatic)

The SDK automatically respects server rate limits:
- Parses `X-Rate-Limit-*` and `X-Rate-Limit-*-State` headers
- If a restriction is active (`*-State` third number > 0), subsequent requests wait
- On `429 Too Many Requests`, reads `Retry-After` and delays further requests

You can inspect current state:

```ts
const info = client.getRateLimitInfo();
// { policy, rules, account, ip, client, accountState, ipState, clientState, retryAfter? }
```

Best practices:
- Avoid polling; cache where possible
- Handle 429 gracefully
- Keep your User-Agent clear and contactable

## Unofficial Trade API

`TradeClient` uses the website endpoints and requires a `POESESSID` cookie.

```ts
import { TradeClient } from 'poe-js-sdk';

const trade = new TradeClient({
  poesessid: process.env.POESESSID!,
  userAgent: 'OAuth myapp/1.0.0 (contact: dev@example.com)',
});

const { search, items } = await trade.searchAndFetch('Standard', { /* query */ } as any, 10, 'pc');
```

This API is unofficial and may change without notice.

## Examples

```ts
// League ladder sorted by class
await client.getLeagueLadder('Affliction', {
  realm: 'pc',
  sort: 'class',
  class: 'witch',
  limit: 50,
});

// Characters (PoE2 on console realms)
await client.getCharacters('poe2');

// Guild stash (PoE1)
await client.getGuildStashes('Standard');

// Ladder pagination helper
import { LadderPager } from 'poe-js-sdk';
const pager = new LadderPager(client, 'Affliction', { realm: 'pc', limit: 200 });
await pager.loadFirst();
while (await pager.next()) {
  // process pager.entries
}

// Public stash streaming
import { publicStashStream } from 'poe-js-sdk';
for await (const chunk of publicStashStream(client, { realm: 'pc', idleWaitMs: 2000 })) {
  // chunk.stashes ...
  break; // stop when you want
}
```

### Framework Example
- Next.js (App Router) auth flow with httpOnly cookies: `examples/nextjs/`

## Security
- Never embed credentials/secrets in distributed binaries or client code
- Keep refresh tokens and client secrets server‑side only
- One product per registered application

## User‑Agent Header
```
User-Agent: OAuth {clientId}/{version} (contact: {email}) OptionalInfo
```

## License
MIT

## Testing & Coverage

- Run tests: `npm test`
- Watch tests: `npm run test:watch`
- Coverage report: `npm run test:coverage`

## CI & Releases

- GitHub Actions run tests, lint, and type checks on pushes and PRs.
- Create a release by pushing a tag `vX.Y.Z` to `main`. The Release workflow will:
  - run tests/lint/type-check
  - build `dist/`
  - create a GitHub Release with autogenerated notes and upload `dist/**` artifacts

No npm publish is performed by the release workflow.
