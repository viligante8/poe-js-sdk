---
id: helpers
title: Helpers
---

### LadderPager

Paginate league ladders in chunks.

```ts
import { LadderPager } from 'poe-js-sdk';

const pager = new LadderPager(client, 'Affliction', { realm: 'pc', limit: 200 });
await pager.loadFirst();
while (await pager.next()) {
  // pager.entries
}
```

### Public Stash Stream

Async iterator over public stash pages with idle waits.

```ts
import { publicStashStream } from 'poe-js-sdk';

for await (const chunk of publicStashStream(client, { realm: 'pc', idleWaitMs: 2000 })) {
  // chunk.stashes
  break;
}
```

