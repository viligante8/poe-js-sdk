# Path of Exile API SDK

A fully-typed TypeScript SDK for the official Path of Exile API, supporting both PoE1 and PoE2, **plus unofficial trade search functionality**.

[![CI](https://github.com/viligante8/poe-js-sdk/workflows/CI/badge.svg)](https://github.com/viligante8/poe-js-sdk/actions)
[![Coverage Status](https://coveralls.io/repos/github/viligante8/poe-js-sdk/badge.svg?branch=main)](https://coveralls.io/github/viligante8/poe-js-sdk?branch=main)

## Features

- 🔒 **Full OAuth 2.1 support** with PKCE for secure authentication
- 📝 **Complete TypeScript types** for all API responses
- 🎮 **PoE1 & PoE2 support** with realm-specific endpoints
- ⚡ **Rate limit handling** with automatic retry logic
- 🧪 **Fully tested** with comprehensive test coverage
- 📦 **Modern ESM/CJS** dual package support
- 🔄 **Automatic token refresh** for long-running applications
- 🛒 **Trade search functionality** (unofficial API)

## What's New in v1.1.0 🎉

- **🔥 Advanced Trade Queries** - Pseudo stats, DPS filters, item level/quality filters
- **🎯 PoE2 Enhanced Support** - Crossbows, focus items, greater/perfect currencies  
- **📊 Result Grouping** - Automatically group duplicate listings to reduce spam
- **⏱️ Rate Limiting** - Built-in request throttling to prevent API abuse
- **📈 Common Stat IDs** - Pre-defined constants for life, resistances, damage, etc.

See [CHANGELOG.md](./CHANGELOG.md) for complete details.

## Installation

```bash
npm install poe-js-sdk
# or
yarn add poe-js-sdk
# or
pnpm add poe-js-sdk
```

## Quick Start

### Basic Setup

```typescript
import { PoEApiClient, OAuthHelper } from 'poe-js-sdk';

// Initialize the client
const client = new PoEApiClient({
  accessToken: 'your-access-token',
  userAgent: 'YourApp/1.0.0 (contact: your-email@example.com)'
});

// Get user profile
const profile = await client.getProfile();
console.log(`Hello, ${profile.name}!`);
```

### Trade Search (Unofficial API)

```typescript
import { TradeClient, TradeQueryBuilder, ItemCategories, Currencies } from 'poe-js-sdk';

// Initialize trade client with POESESSID from browser
const tradeClient = new TradeClient({
  poesessid: 'your-poesessid-cookie', // Get from browser dev tools
  userAgent: 'YourApp/1.0.0 (contact: your-email@example.com)'
});

// Search for rings with life and resistance
const query = new TradeQueryBuilder()
  .onlineOnly(true)
  .category(ItemCategories.ACCESSORY_RING)
  .price(Currencies.CHAOS, 1, 50) // 1-50 chaos
  .andStats([
    { id: 'explicit.stat_3299347043', min: 70 }, // Life
    { id: 'explicit.stat_4220027924', min: 30 }, // Fire Resistance
  ])
  .build();

const results = await tradeClient.searchAndFetch('Standard', query, 10);
console.log(`Found ${results.search.total} items`);

results.items.result.forEach(item => {
  console.log(`${item.item.name}: ${item.listing.price.amount} ${item.listing.price.currency}`);
  console.log(`Whisper: ${item.listing.whisper}`);
});
```

### OAuth Authentication Flow

```typescript
import { OAuthHelper } from 'poe-js-sdk';

const config = {
  clientId: 'your-client-id',
  redirectUri: 'http://localhost:8080/callback',
  scopes: ['account:profile', 'account:characters']
};

// Generate PKCE parameters for security
const pkce = OAuthHelper.generatePKCE();

// Build authorization URL
const authUrl = OAuthHelper.buildAuthUrl(config, 'random-state', pkce);

// Redirect user to authUrl, then exchange the code for tokens
const tokens = await OAuthHelper.exchangeCodeForToken(
  config,
  'authorization-code-from-callback',
  pkce.codeVerifier
);

// Use the access token
const client = new PoEApiClient({
  accessToken: tokens.access_token,
  userAgent: 'YourApp/1.0.0 (contact: your-email@example.com)'
});
```

### Browser Auth (SPA)

```typescript
import { createBrowserAuth } from 'poe-js-sdk/browser-auth';
import { PoEApiClient } from 'poe-js-sdk';

const auth = createBrowserAuth({
  clientId: 'your-client-id',
  redirectUri: 'http://localhost:8080/callback',
  scopes: ['account:profile']
});

// Trigger login
auth.login();

// On callback page
await auth.handleRedirectCallback();

// Use API with auto-refreshing access token
const client = new PoEApiClient({
  userAgent: 'YourApp/1.0.0 (contact: your-email@example.com)',
  accessToken: await auth.getAccessToken(),
});
```

Notes:
- Uses PKCE and state under the hood; no secrets in browser.
- Stores tokens in sessionStorage by default; can inject custom storage.
- Automatically refreshes access token when near expiry.
- Import from `poe-js-sdk/browser-auth` to avoid Node polyfills in SPA bundles.

### Framework Example
- Next.js (App Router) server-side OAuth with httpOnly cookies: `examples/nextjs/`

## API Reference

### Trade Search API (Unofficial)

⚠️ **Warning**: The trade search functionality uses unofficial endpoints that may change without notice. Requires a valid POESESSID cookie from your browser session.

#### Basic Trade Search
```typescript
import { TradeClient, TradeQueryBuilder, ItemCategories, Currencies } from 'poe-js-sdk';

const tradeClient = new TradeClient({
  poesessid: 'your-poesessid-from-browser-cookies'
});

// Search for items
const query = new TradeQueryBuilder()
  .onlineOnly(true)
  .category(ItemCategories.ACCESSORY_RING)
  .price(Currencies.CHAOS, 1, 100)
  .build();

const results = await tradeClient.searchAndFetch('Standard', query, 10);
```

#### Advanced Trade Queries (NEW!)
```typescript
import { 
  AdvancedTradeQueryBuilder, 
  ENHANCED_CATEGORIES, 
  ENHANCED_CURRENCIES,
  COMMON_STAT_IDS,
  groupTradeResults,
  TradeRateLimiter
} from 'poe-js-sdk';

// PoE2 weapon search with DPS filtering
const weaponQuery = new AdvancedTradeQueryBuilder()
  .category(ENHANCED_CATEGORIES.CROSSBOW) // PoE2 crossbow
  .price(ENHANCED_CURRENCIES.GREATER_CHAOS, 1, 50)
  .weaponDPS(undefined, undefined, 200) // Min 200 total DPS
  .itemLevel(70) // Min item level 70
  .quality(15) // Min 15% quality
  .build();

// Life + resistance armor search
const armorQuery = new AdvancedTradeQueryBuilder()
  .category(ENHANCED_CATEGORIES.FOCUS) // PoE2 focus
  .andStats([
    { id: COMMON_STAT_IDS.LIFE, min: 70 },
    { id: COMMON_STAT_IDS.FIRE_RES, min: 30 },
  ])
  .totalResistance(75) // Total elemental res >= 75%
  .totalLifeES(150) // Combined life + ES
  .corrupted(false)
  .build();

// Group results to reduce spam listings
const results = await tradeClient.searchAndFetch('Standard', weaponQuery, 10, 'poe2');
const grouped = groupTradeResults(results.items.result);

grouped.forEach(item => {
  console.log(`${item.item.name}: ${item.listing.price.amount} ${item.listing.price.currency}`);
  console.log(`Listed ${item.listedTimes} times`);
  if (item.priceRange) {
    console.log(`Price range: ${item.priceRange.min}-${item.priceRange.max}`);
  }
});
```

#### Rate Limiting (NEW!)
```typescript
const rateLimiter = new TradeRateLimiter();

if (rateLimiter.canMakeRequest('search')) {
  rateLimiter.recordRequest('search');
  const results = await tradeClient.search('Standard', query);
} else {
  console.log(`Wait ${rateLimiter.getWaitTime('search')}ms before next request`);
}
```

#### Enhanced Categories & Currencies (NEW!)
```typescript
// PoE2 specific items
ENHANCED_CATEGORIES.CROSSBOW     // weapon.crossbow
ENHANCED_CATEGORIES.FOCUS        // armour.focus
ENHANCED_CATEGORIES.SPEAR        // weapon.spear
ENHANCED_CATEGORIES.BUCKLER      // armour.buckler

// PoE2 currencies
ENHANCED_CURRENCIES.GREATER_CHAOS    // greater-chaos-orb
ENHANCED_CURRENCIES.PERFECT_CHAOS    // perfect-chaos-orb
ENHANCED_CURRENCIES.GREATER_TRANSMUTE // greater-orb-of-transmutation

// Common stat IDs
COMMON_STAT_IDS.LIFE            // explicit.stat_3299347043
COMMON_STAT_IDS.FIRE_RES        // explicit.stat_4220027924
COMMON_STAT_IDS.ENERGY_SHIELD   // explicit.stat_2901986750
```

#### Trade Client Methods
```typescript
// Search only (returns item IDs)
const searchResult = await tradeClient.search('Standard', query, 'pc');

// Fetch item details by IDs
const items = await tradeClient.fetch(searchResult.result, searchResult.id);

// Get whisper message for trading
const whisper = await tradeClient.getWhisper('item-id', 'query-id');

// Combined search and fetch
const results = await tradeClient.searchAndFetch('Standard', query, 10);
```

#### Getting POESESSID Cookie
1. Open pathofexile.com in your browser
2. Log in to your account
3. Open Developer Tools (F12)
4. Go to Application/Storage → Cookies
5. Find `POESESSID` cookie value
6. Use this value in TradeClient constructor

### Official API Client

### Client Methods

#### Profile
```typescript
// Get account profile
const profile = await client.getProfile();
```

#### Leagues
```typescript
// Get all leagues
const leagues = await client.getLeagues();

// Get leagues for specific realm
const xboxLeagues = await client.getLeagues('xbox');

// Get specific league
const league = await client.getLeague('Affliction');

// Get league ladder (PoE1 only)
const ladder = await client.getLeagueLadder('Affliction', {
  limit: 20,
  offset: 0
});
```

#### Characters
```typescript
// Get all characters
const characters = await client.getCharacters();

// Get characters for specific realm
const xboxCharacters = await client.getCharacters('xbox');

// Get specific character details
const character = await client.getCharacter('CharacterName');
```

#### Stashes (PoE1 only)
```typescript
// Get all stash tabs
const stashes = await client.getStashes('Affliction');

// Get specific stash tab
const stash = await client.getStash('Affliction', 'stash-id');

// Get substash
const substash = await client.getStash('Affliction', 'stash-id', 'substash-id');
```

#### Public Data
```typescript
// Get public stash tabs (PoE1 only)
const publicStashes = await client.getPublicStashes();

// Get currency exchange data
const currencyData = await client.getCurrencyExchange();

// Get PvP matches (PoE1 only)
const matches = await client.getPvpMatches();
```

#### Item Filters
```typescript
// Get all item filters
const filters = await client.getItemFilters();

// Create new item filter
const newFilter = await client.createItemFilter({
  filter_name: 'My Filter',
  realm: 'pc',
  description: 'Custom filter',
  filter: 'Show\n    BaseType "Currency"'
});
```

### Rate Limit Information

```typescript
// Check current rate limit status
const rateLimitInfo = client.getRateLimitInfo();
console.log('Rate limit policy:', rateLimitInfo.policy);
console.log('Retry after:', rateLimitInfo.retryAfter);
```

### Error Handling

```typescript
try {
  const profile = await client.getProfile();
} catch (error) {
  if (error.response?.status === 429) {
    console.log('Rate limited, retry after:', error.response.headers['retry-after']);
  } else if (error.response?.status === 401) {
    console.log('Unauthorized, refresh your token');
  } else {
    console.error('API error:', error.message);
  }
}
```

## TypeScript Support

The SDK provides complete TypeScript definitions for all API responses:

```typescript
import type { Character, Item, League, Profile } from 'poe-js-sdk';

const character: Character = await client.getCharacter('MyCharacter');
const items: Item[] = character.inventory || [];
const weapon = items.find(item => item.inventoryId === 'Weapon');

if (weapon?.sockets) {
  weapon.sockets.forEach(socket => {
    console.log(`Socket: ${socket.sColour} (${socket.attr})`);
  });
}
```

## Realms

The SDK supports all Path of Exile realms:

- `pc` - PC (default)
- `xbox` - Xbox
- `sony` - PlayStation
- `poe2` - Path of Exile 2

```typescript
// Get PoE2 leagues
const poe2Leagues = await client.getLeagues('poe2');

// Get Xbox characters
const xboxChars = await client.getCharacters('xbox');
```

## OAuth Scopes

Available scopes for different data access:

### Account Scopes
- `account:profile` - Basic profile information
- `account:leagues` - Available leagues (including private)
- `account:stashes` - Stash tabs and items
- `account:characters` - Characters and inventories
- `account:league_accounts` - Atlas passive allocations
- `account:item_filter` - Item filter management

### Service Scopes (Confidential clients only)
- `service:leagues` - League data
- `service:leagues:ladder` - League ladders
- `service:pvp_matches` - PvP match data
- `service:psapi` - Public Stash API
- `service:cxapi` - Currency Exchange API

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build the package
npm run build

# Lint code
npm run lint

# Format code
npm run format
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This product isn't affiliated with or endorsed by Grinding Gear Games in any way.

## Links

- **[Getting Started Guide](./GETTING_STARTED.md)** - Quick start examples and common patterns
- **[Changelog](./CHANGELOG.md)** - What's new in each version
- **[Examples](./examples/)** - Comprehensive usage examples
- [Official Path of Exile API Documentation](https://www.pathofexile.com/developer/docs)
- [Path of Exile Website](https://www.pathofexile.com)
- [Grinding Gear Games](https://www.grindinggear.com)
