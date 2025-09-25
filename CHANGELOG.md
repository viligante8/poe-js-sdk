# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2025-09-19

## [1.7.0] - 2025-09-20

### Added
- Browser auth helper for SPAs: `createBrowserAuth` with PKCE + state, sessionStorage token persistence, and auto refresh via `refresh_token`.
- Types and utilities: `TokenSet`, `TokenStorage`, `Storages`.
- Documentation and examples for SPA auth usage.
- Dedicated browser subpath export: `poe-js-sdk/browser-auth` now points to a browser-safe build to avoid Node polyfills in SPAs. Prefer this import path in client apps.
- Next.js (App Router) example demonstrating secure server-side OAuth with httpOnly cookies, including login, callback, refresh, and a profile route.

### Fixed
- Align league ladder parameters with docs (`sort`, optional `class`) and PoE1 realms only.
- Parse and expose rate limit state headers: `X-Rate-Limit-Account-State`, `X-Rate-Limit-IP-State`, `X-Rate-Limit-Client-State`.
- Add `locale` to `Profile` type per docs.

### Added
- `getLeagueEventLadder()` (PoE1) and `getPvpMatchLadder()` (PoE1) endpoints.
- `getAccountLeagues()` (PoE1) typed envelope `{ leagues }`.
- `getGuildStashes()` returns `{ stashes }` and `getGuildStash()` returns `{ stash }` (PoE1).
 - `OAuthHelper.getClientCredentialsToken()` to support service scopes with confidential clients.
 - Automatic request waiting using `Retry-After` and active restriction seconds from rate limit state headers.
 - Fully typed ladder responses: `Ladder`, `LadderEntry`, `EventLadderEntry`, `PvPLadderTeamEntry`.
 - Helpers: `LadderPager` for ladder pagination and `publicStashStream` async generator.
 - `PoEApiError` thrown for structured API errors.

### Changed
- BREAKING: Standardized typed envelopes to mirror official docs.
  - `getLeagues` → `{ leagues }`, `getLeague` → `{ league }`
  - `getCharacters` → `{ characters }`, `getCharacter` → `{ character }`
  - `getStashes` → `{ stashes }`, `getStash` → `{ stash }` (PoE1)
  - `getPublicStashes` now returns `PublicStashesResponse`
  - `getCurrencyExchange` returns `CurrencyExchangeResponse`
- Enforce compliant `User-Agent` for both `PoEApiClient` and `TradeClient` (must start with `OAuth ` and include `(contact: ...)`).
- README rewritten to document service scopes, rate‑limit behavior, typed envelopes, and new helpers.
- Project/package renamed to `poe-js-sdk` (previously referenced as `poe-api-sdk`/`poe-sdk`).
### Technical
- Tests significantly expanded; coverage ~78% statements. Utilities ~86–100%.
- Full TypeScript strict mode compliance maintained.
- CI added for tests/lint/type-check. Release workflow creates GitHub Releases on `v*.*.*` tags and uploads `dist/` artifacts.

## [1.7.1] - 2025-09-22

### Fixed
- SPA PKCE generation now prefers Web Crypto + `btoa` for base64url and only falls back to Node `Buffer` when needed. Removes accidental hard dependency on `Buffer` in browsers.
- Minor type and lint fixes in `browser-auth` implementation and tests.

### Docs
- Clarify usage of the browser-only subpath export: import from `poe-js-sdk/browser-auth` in SPAs.
## [2.0.0] - 2025-09-24

### Changed
- BREAKING: `OAuthHelper.generatePKCE()` is now async and universal. It uses Web Crypto in Edge/Workers/Browsers and falls back to Node's crypto in server runtimes. Update your code to `await OAuthHelper.generatePKCE()`.
- Removed `generatePKCEAsync()` (introduced temporarily); the single `generatePKCE()` method now covers all runtimes.
- Next.js example updated to call the async PKCE generator.

### Docs
- Updated README and website docs to reflect the async PKCE API and Edge compatibility notes.

## [2.0.1] - 2025-09-24

### Changed
- OAuth token errors from `exchangeCodeForToken`, `refreshToken`, and `getClientCredentialsToken` now include HTTP status and the token endpoint response body (JSON or text) to ease debugging. Error objects also expose `status`, `statusText`, and `body` fields when available.

### Docs
- Clarify that Authorization Code “with PKCE” is required for both public and confidential clients.
- Document that the token endpoint uses `client_secret_post` for confidential clients.
- Add scope guidance: request `account:*` scopes during user login; request `service:*` scopes separately via the Client Credentials grant for confidential clients.

## [2.0.2] - 2025-09-24

### Added
- Optional `userAgent` on `OAuthHelper` config. When provided from a server runtime, token requests (`exchangeCodeForToken`, `refreshToken`, `getClientCredentialsToken`) include a `User-Agent` header to avoid WAF blocks.

### Docs
- Next.js and OAuth docs updated to show passing `userAgent` during token requests.
- Next.js examples updated to use `import { cookies } from 'next/headers'` instead of dynamic imports.
- Getting Started examples now use a compliant `User-Agent` string (must start with `OAuth ` and include contact info).

## [2.1.0] - 2025-09-25

### Added
- Request/response logging in `PoEApiClient` with cURL output for easy Postman import.
  - New `ClientConfig` options: `logLevel` (`none` | `basic` | `headers` | `body` | `debug`), `logger`, and `redactHeaders`.
  - Logs include method/URL/status/duration; `headers` adds a ready-to-copy cURL; `body` also prints JSON payloads (truncated).
- Docs: new "Logging & cURL" guide with examples (`website/docs/logging.md`).
- API docs density: parameters rendered as compact tables via a remark plugin; tighter spacing and dark theme polish.
- Local search for docs (fallback to Algolia), Prism themes configured.

### Changed
- Docs hosting reliability on GitHub Pages: use `trailingSlash: true` and static redirect for `/api` to `/poe-js-sdk/api/`.
- Isolated TypeDoc output under `/api` to avoid cross-deps with main docs during CI builds.

### Tests
- Added tests for cURL logging and redaction behavior in `PoEApiClient`.
