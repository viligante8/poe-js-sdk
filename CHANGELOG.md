# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2025-09-19

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
