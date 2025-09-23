---
id: error-handling
title: Error Handling
---

The client throws `PoEApiError` for API errors that return an `{ error: { code, message } }` payload, and preserves `status`, `url`, and response headers when available. Handle rate limits and auth errors explicitly.

```ts
try {
  const profile = await client.getProfile();
} catch (error: any) {
  if (error.response?.status === 429) {
    console.log('Rate limited, retry after:', error.response.headers['retry-after']);
  } else if (error.response?.status === 401) {
    console.log('Unauthorized, refresh your token');
  } else {
    console.error('API error:', error.message);
  }
}
```

