---
id: rate-limiting
title: Rate Limiting
---

The SDK automatically respects server rate limits by parsing `X-Rate-Limit-*` and `X-Rate-Limit-*-State` headers. If a restriction is active, subsequent requests wait. On `429`, it reads `Retry-After`.

```ts
const info = client.getRateLimitInfo();
// { policy, rules, account, ip, client, accountState, ipState, clientState, retryAfter? }
```

Best practices:
- Avoid polling; cache where possible
- Handle 429 gracefully
- Keep your User-Agent clear and contactable

