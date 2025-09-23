---
id: faq
title: FAQ
---

### Is the trade API official?

No. The trade client uses website endpoints and may change without notice. Requires `POESESSID`.

### Why am I getting 429s?

The API enforces strict rate limits. The SDK honors headers and retries based on `Retry-After`. See Rate Limiting.

### How should I format `User-Agent`?

```
User-Agent: OAuth {clientId}/{version} (contact: {email}) OptionalInfo
```

### Does the SDK support PoE2?

Yes, select endpoints and realms. Use `poe2` where applicable.

