---
id: logging
title: Logging & cURL
---

You can enable request/response logging on `PoEApiClient` to see exactly what calls are made and copy a ready-to-run cURL command (importable into Postman).

Enable logging:

```ts
import { PoEApiClient } from 'poe-js-sdk';

const client = new PoEApiClient({
  userAgent: 'OAuth myapp/1.0.0 (contact: you@example.com)',
  accessToken: process.env.POE_TOKEN!,
  logLevel: 'headers', // 'none' | 'basic' | 'headers' | 'body' | 'debug'
  // Optional:
  // logger: (line) => myLogger.info(line),
  // redactHeaders: ['authorization', 'cookie']
});

await client.getProfile();
```

Log levels:

- `basic`: method + URL + status + duration
- `headers`: basic + request headers and a cURL snippet you can paste into Postman
- `body`: headers + request and response bodies (truncated)
- `debug`: same as body (reserved for extra detail later)

Example output (cURL is ready to copy/paste):

```
[PoE SDK] -> GET https://api.pathofexile.com/profile
curl -X GET 'https://api.pathofexile.com/profile' \
  -H 'User-Agent: OAuth myapp/1.0.0 (contact: you@example.com)' \
  -H 'Authorization: ***'
[PoE SDK] <- 200 GET https://api.pathofexile.com/profile (132ms)
```

Tips

- Postman can import raw cURL: click Import → Raw text → paste the cURL.
- Add `logLevel: 'body'` to also see JSON payloads (truncated to avoid huge logs).
- Use `redactHeaders` to mask any additional sensitive headers.

