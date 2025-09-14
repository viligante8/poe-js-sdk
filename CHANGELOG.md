# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-01-13

### Added
- **Enhanced Trade Search Features** - Comprehensive trade functionality inspired by Exiled-Exchange-2 and PathOfBuilding
- `AdvancedTradeQueryBuilder` - Advanced query builder with pseudo stats, DPS filters, and item filters
- `TradeRateLimiter` - Automatic rate limiting to prevent API abuse
- `groupTradeResults()` - Groups duplicate listings by account/price to reduce spam
- **Enhanced Categories** - PoE2 specific item categories (crossbow, focus, spear, buckler, etc.)
- **Enhanced Currencies** - PoE2 currency support (greater/perfect orbs)
- **Common Stat IDs** - Pre-defined stat IDs for life, resistances, damage, etc.
- **Pseudo Stats Support** - Total resistance, total life+ES, weapon DPS calculations
- **Advanced Filters** - Item level, gem level, quality, corruption, influence filters
- **Result Grouping** - Price range calculation for grouped listings
- **Rate Limiting** - Built-in request throttling with wait time calculation

### Enhanced
- Trade search now supports both PoE1 and PoE2 with realm-specific features
- Comprehensive TypeScript types for all new trade functionality
- Examples updated with advanced trade patterns
- Documentation expanded with new feature usage

### Technical
- Package size increased to 18.12 kB (ESM) / 12.55 kB (CJS) due to enhanced features
- All tests passing (24 total)
- Full TypeScript strict mode compliance maintained

## [1.0.0] - 2025-01-13

### Added
- **Official PoE API Client** - Complete TypeScript client for official Path of Exile API
- **OAuth 2.1 Support** - Full authentication flow with PKCE for secure access
- **Trade Search API** - Unofficial trade search functionality using pathofexile.com endpoints
- **Complete TypeScript Types** - Full type definitions for all API responses
- **Multi-Realm Support** - PoE1 and PoE2 support (PC, Xbox, PlayStation, PoE2)
- **Rate Limit Handling** - Automatic rate limit detection and header parsing
- **Modern Package Structure** - ESM/CJS dual exports with proper TypeScript declarations

### API Endpoints
- Profile management (`getProfile()`)
- League data (`getLeagues()`, `getLeague()`, `getLeagueLadder()`)
- Character data (`getCharacters()`, `getCharacter()`)
- Stash tabs (`getStashes()`, `getStash()`) - PoE1 only
- Public stash API (`getPublicStashes()`) - PoE1 only
- Currency exchange (`getCurrencyExchange()`)
- PvP matches (`getPvpMatches()`, `getPvpMatch()`) - PoE1 only
- Item filters (`getItemFilters()`, `createItemFilter()`, `updateItemFilter()`)

### Trade Features
- `TradeClient` - Full trade search client
- `TradeQueryBuilder` - Fluent API for building search queries
- Search and fetch functionality with automatic item retrieval
- Whisper message generation for trading
- Support for complex stat filtering (AND, OR, weighted)
- Price and category filtering

### Development
- Comprehensive test suite with Jest
- ESLint + Prettier for code quality
- Vite for modern building and bundling
- GitHub Actions CI/CD pipeline
- Full documentation and examples

### Security
- OAuth 2.1 with PKCE implementation
- Secure token management
- Rate limit respect and handling
- User-Agent requirements compliance
