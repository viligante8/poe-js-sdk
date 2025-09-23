---
id: index
title: Overview
slug: /
---

Typed client for the official Path of Exile API (PoE1 + limited PoE2) with:

- OAuth 2.1 helpers (PKCE, refresh, client credentials for service scopes)
- Automatic, header‑driven rate‑limit compliance
- Fully typed endpoints (ladders, PvP, stashes, characters, filters, leagues)
- Optional, clearly labeled Unofficial Trade API client

Server: `https://api.pathofexile.com`

This SDK follows the official docs at https://www.pathofexile.com/developer/docs.

Note: Former package names were `poe-api-sdk` and `poe-sdk`. The current name is `poe-js-sdk`.

## Install

```bash
npm install poe-js-sdk
```

Or from GitHub for SSR builds:

```bash
npm install github:viligante8/poe-js-sdk
```

When installing from a Git repo, npm runs the `prepare` script to build `dist/`. If your CI disables lifecycle scripts (e.g. `--ignore-scripts`), make sure to run `npm run build` or enable `prepare`.

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

See the guides in the sidebar for OAuth, rate limiting, realms, and trade.

