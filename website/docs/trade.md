---
id: trade
title: Trade (Unofficial)
---

The trade client uses website endpoints and requires a `POESESSID` cookie. This API is unofficial and may change without notice.

```ts
import { TradeClient } from 'poe-js-sdk';

const trade = new TradeClient({
  poesessid: process.env.POESESSID!,
  userAgent: 'OAuth myapp/1.0.0 (contact: dev@example.com)',
});

const { search, items } = await trade.searchAndFetch('Standard', { /* query */ } as any, 10, 'pc');
```

### Advanced Queries

```ts
import {
  AdvancedTradeQueryBuilder,
  ENHANCED_CATEGORIES,
  ENHANCED_CURRENCIES,
  COMMON_STAT_IDS,
  groupTradeResults,
  TradeRateLimiter,
} from 'poe-js-sdk';

const weaponQuery = new AdvancedTradeQueryBuilder()
  .category(ENHANCED_CATEGORIES.CROSSBOW)
  .price(ENHANCED_CURRENCIES.GREATER_CHAOS, 1, 50)
  .weaponDPS(undefined, undefined, 200)
  .itemLevel(70)
  .quality(15)
  .build();

const results = await trade.searchAndFetch('Standard', weaponQuery, 10, 'poe2');
const grouped = groupTradeResults(results.items.result);
```

### Getting POESESSID

1. Open pathofexile.com and log in
2. DevTools → Application/Storage → Cookies
3. Copy the `POESESSID` value

Keep your `POESESSID` private.

