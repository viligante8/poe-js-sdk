---
id: examples
title: Examples
---

Explore the `examples/` directory in the repository for comprehensive usage:

- `examples/basic-usage.ts` – Quick API usage
- `examples/trade-example.ts` – Basic trade search
- `examples/enhanced-trade-example.ts` – Advanced queries and grouping
- `examples/nextjs/` – Next.js App Router auth flow with httpOnly cookies

Sample snippets:

```ts
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

