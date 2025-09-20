# Getting Started with PoE API SDK

This guide will help you get up and running with the Path of Exile API SDK quickly.

## Installation

```bash
npm install poe-js-sdk
```

## Quick Start Examples

### 1. Official API - Get Your Profile

```typescript
import { PoEApiClient, OAuthHelper } from 'poe-js-sdk';

// First, set up OAuth (one-time setup)
const oauthConfig = {
  clientId: 'your-client-id', // Register at pathofexile.com/developer
  redirectUri: 'http://localhost:8080/callback',
  scopes: ['account:profile', 'account:characters']
};

const pkce = OAuthHelper.generatePKCE();
const authUrl = OAuthHelper.buildAuthUrl(oauthConfig, 'random-state', pkce);
console.log('Visit:', authUrl);

// After user authorizes, exchange code for token
const tokens = await OAuthHelper.exchangeCodeForToken(
  oauthConfig, 
  'code-from-callback', 
  pkce.codeVerifier
);

// Use the API
const client = new PoEApiClient({
  accessToken: tokens.access_token,
  userAgent: 'MyApp/1.0.0 (contact: you@example.com)'
});

const profile = await client.getProfile();
console.log(`Hello, ${profile.name}!`);
```

### 2. Trade Search - Find Items

```typescript
import { TradeClient, TradeQueryBuilder, ItemCategories, Currencies } from 'poe-js-sdk';

// Get POESESSID from browser cookies (see README for details)
const tradeClient = new TradeClient({
  poesessid: 'your-poesessid-cookie'
});

// Simple search
const query = new TradeQueryBuilder()
  .onlineOnly(true)
  .category(ItemCategories.ACCESSORY_RING)
  .price(Currencies.CHAOS, 1, 50)
  .andStats([
    { id: 'explicit.stat_3299347043', min: 70 }, // Life
  ])
  .build();

const results = await tradeClient.searchAndFetch('Standard', query, 10);
console.log(`Found ${results.search.total} rings`);

results.items.result.forEach(item => {
  console.log(`${item.item.name}: ${item.listing.price.amount} ${item.listing.price.currency}`);
  console.log(`Whisper: ${item.listing.whisper}`);
});
```

### 3. Advanced PoE2 Trade Search (NEW!)

```typescript
import { 
  AdvancedTradeQueryBuilder, 
  ENHANCED_CATEGORIES, 
  ENHANCED_CURRENCIES,
  COMMON_STAT_IDS,
  groupTradeResults 
} from 'poe-js-sdk';

// Search for PoE2 crossbows with high DPS
const weaponQuery = new AdvancedTradeQueryBuilder()
  .category(ENHANCED_CATEGORIES.CROSSBOW)
  .price(ENHANCED_CURRENCIES.GREATER_CHAOS, 1, 100)
  .weaponDPS(undefined, undefined, 200) // Min 200 total DPS
  .itemLevel(70) // Min item level 70
  .quality(15) // Min 15% quality
  .build();

const results = await tradeClient.searchAndFetch('Standard', weaponQuery, 10, 'poe2');

// Group results to reduce spam
const grouped = groupTradeResults(results.items.result);
console.log(`${results.search.total} items grouped into ${grouped.length} listings`);

grouped.forEach(item => {
  console.log(`${item.item.name}: ${item.listing.price.amount} ${item.listing.price.currency}`);
  console.log(`Listed ${item.listedTimes} times`);
  if (item.priceRange) {
    console.log(`Price range: ${item.priceRange.min}-${item.priceRange.max}`);
  }
});
```

### 4. Rate-Limited Trading

```typescript
import { TradeRateLimiter } from 'poe-js-sdk';

const rateLimiter = new TradeRateLimiter();

async function safeTradeSearch(query) {
  if (rateLimiter.canMakeRequest('search')) {
    rateLimiter.recordRequest('search');
    return await tradeClient.search('Standard', query);
  } else {
    const waitTime = rateLimiter.getWaitTime('search');
    console.log(`Rate limited, waiting ${waitTime}ms`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
    return safeTradeSearch(query); // Retry
  }
}
```

## Common Use Cases

### Find Gear Upgrades
```typescript
// Life + resistance gear
const gearQuery = new AdvancedTradeQueryBuilder()
  .category(ENHANCED_CATEGORIES.FOCUS) // PoE2 focus
  .andStats([
    { id: COMMON_STAT_IDS.LIFE, min: 70 },
    { id: COMMON_STAT_IDS.FIRE_RES, min: 30 },
    { id: COMMON_STAT_IDS.COLD_RES, min: 30 },
  ])
  .totalResistance(75) // Total elemental res
  .price(ENHANCED_CURRENCIES.GREATER_CHAOS, undefined, 50)
  .build();
```

### Currency Trading
```typescript
// Find currency deals
const currencyQuery = new TradeQueryBuilder()
  .category('currency')
  .price(ENHANCED_CURRENCIES.PERFECT_CHAOS, undefined, 1)
  .build();
```

### Gem Shopping
```typescript
// High level gems
const gemQuery = new AdvancedTradeQueryBuilder()
  .category('gem.activegem')
  .gemLevel(18)
  .quality(15)
  .corrupted(false)
  .build();
```

## Error Handling

```typescript
try {
  const results = await tradeClient.searchAndFetch('Standard', query, 10);
} catch (error) {
  if (error.response?.status === 403) {
    console.error('Invalid POESESSID - please get a new cookie from browser');
  } else if (error.response?.status === 429) {
    console.error('Rate limited - wait before making more requests');
  } else {
    console.error('API error:', error.message);
  }
}
```

## Getting POESESSID Cookie

1. Open [pathofexile.com](https://pathofexile.com) in your browser
2. Log in to your account
3. Open Developer Tools (F12)
4. Go to **Application** tab → **Storage** → **Cookies**
5. Find the `POESESSID` cookie and copy its value
6. Use this value in your `TradeClient` constructor

⚠️ **Important**: Keep your POESESSID private and don't share it. It provides access to your account.

## Next Steps

- Check out the [examples/](./examples/) directory for more detailed examples
- Read the full [README.md](./README.md) for complete API documentation
- See [CHANGELOG.md](./CHANGELOG.md) for what's new in each version

## Need Help?

- Check the [FAQ section](./README.md#faq) in the README
- Look at the [examples](./examples/) for common patterns
- Open an issue on GitHub if you find bugs or need features
