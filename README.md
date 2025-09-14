# Path of Exile API Documentation

Complete reference for the official Path of Exile API, supporting both PoE1 and PoE2 (limited).

## Overview & Policy

**Purpose**: Official API for accessing Path of Exile game data - primarily read-only snapshots from game servers.

**Server Endpoint**: `https://api.pathofexile.com`

### Third-Party Policy

- **✅ Websites/web apps**: Encouraged (safest for users)
- **⚠️ Independent executables**: Permitted but must use public OAuth clients
- **❌ Game-interacting apps**: Strictly forbidden (immediate account termination)

### Macro Rules
- Manual invocation only
- One action per invocation
- No automation (timers, file changes, screen reading)

### Registration
Manual approval via `oauth@grindinggear.com` (low priority, especially during league launches)

## Authorization System (OAuth 2.1)

### Client Types

#### Confidential Clients
- Server-backed applications
- HTTPS redirect URIs required
- 28-day access tokens, 90-day refresh tokens
- Individual rate limits

#### Public Clients
- Desktop applications
- Local redirect URIs only (`http://127.0.0.1:8080/callback`)
- 10-hour access tokens, 7-day refresh tokens
- Shared rate limits
- Cannot use `service:*` scopes

### Grant Types

1. **Authorization Code** (with PKCE): User consent flow
2. **Client Credentials**: Service access without user
3. **Refresh Token**: Token renewal

### Scopes

#### Account Scopes
- `account:profile` - Basic profile information
- `account:leagues` - Available leagues (including private)
- `account:stashes` - Stash tabs and items
- `account:characters` - Characters and inventories
- `account:league_accounts` - Atlas passive allocations
- `account:item_filter` - Item filter management

#### Service Scopes (Confidential clients only)
- `service:leagues` - League data
- `service:leagues:ladder` - League ladders
- `service:pvp_matches` - PvP match data
- `service:psapi` - Public Stash API
- `service:cxapi` - Currency Exchange API

## API Endpoints

### Account Data

#### Profile
```
GET /profile
```
Returns basic account info, Twitch integration status.

#### Item Filters
```
GET /item-filter
GET /item-filter/<id>
POST /item-filter
POST /item-filter/<id>
```
Create, read, and update item filters for all realms (pc, xbox, sony, poe2).

#### Characters
```
GET /character[/<realm>]
GET /character[/<realm>]/<name>
```
List characters or get detailed character data including equipment, passives, inventory.

#### Stashes (PoE1 only)
```
GET /stash[/<realm>]/<league>
GET /stash[/<realm>]/<league>/<stash_id>[/<substash_id>]
```
Access account stash tabs and items.

#### League Accounts (PoE1 only)
```
GET /league-account[/<realm>]/<league>
```
Get Atlas passive tree allocations.

### Public Data

#### Leagues
```
GET /league
GET /league/<league>
GET /league/<league>/ladder (PoE1 only)
GET /league/<league>/event-ladder (PoE1 only)
```
League information and ladders. Supports realm parameter (pc, xbox, sony, poe2).

#### PvP Matches (PoE1 only)
```
GET /pvp-match
GET /pvp-match/<match>
GET /pvp-match/<match>/ladder
```
Tournament data and rankings.

#### Public Stashes (PoE1 only)
```
GET /public-stash-tabs[/<realm>]
```
Real-time trading data stream with 5-minute delay.

#### Currency Exchange
```
GET /currency-exchange[/<realm>][/<id>]
```
Historical trading data in hourly aggregates.

#### Guild Stashes (PoE1 only)
```
GET /guild[/<realm>]/stash/<league>
GET /guild[/<realm>]/stash/<league>/<stash_id>[/<substash_id>]
```
Guild stash access (special request scope required).

### Rate Limiting

Dynamic rate limits with detailed headers:
- `X-Rate-Limit-Policy`: Policy name
- `X-Rate-Limit-Rules`: Applicable rules (ip, account, client)
- `X-Rate-Limit-{rule}`: Limits format `max:period:restriction`
- `X-Rate-Limit-{rule}-State`: Current state `current:period:active_restriction`
- `Retry-After`: Wait time when limited

## Data Structures

### Core Types

#### Item
Comprehensive item data including:
- Basic properties: `name`, `typeLine`, `baseType`, `rarity`
- Dimensions: `w`, `h`, positioning: `x`, `y`
- Modifiers: `implicitMods`, `explicitMods`, `craftedMods`, `enchantMods`
- Sockets: `sockets[]`, `socketedItems[]`
- PoE2-specific: `gemSockets[]`, `sanctified`, `desecrated`, `iconTierText`

#### Character
- Basic info: `id`, `name`, `class`, `level`, `experience`
- Equipment arrays: `equipment[]`, `inventory[]`, `skills[]` (PoE2)
- Passive trees: `passives.hashes[]`, `passives.specialisations{}` (PoE2)
- Realm support: `realm` field indicates pc/xbox/sony

#### League
- Identification: `id`, `name`, `realm`
- Timing: `startAt`, `endAt`, `registerAt`
- Properties: `rules[]`, `category`, event flags

#### StashTab
- Organization: `id`, `parent`, `folder`, `name`, `type`
- Content: `items[]`, `children[]`
- Metadata: `public`, `colour`, special properties

### PoE2-Specific Features

#### Gem System
- `gemTabs[]`: Skill gem organization
- `gemSockets[]`: Always "W" for PoE2
- `gemBackground`, `gemSkill`: Visual properties

#### Character Specializations
- `passives.specialisations.set1[]`: First specialization tree
- `passives.specialisations.set2[]`: Second specialization tree  
- `passives.specialisations.set3[]`: Third specialization tree

#### New Item Properties
- `sanctified`: Item sanctification status
- `desecrated`: Item desecration status
- `desecratedMods[]`: Desecration modifiers
- `iconTierText`: Tier display (roman numerals)

### Advanced Features

#### Passive Trees
Encoded URLs for sharing builds:
```
https://www.pathofexile.com/passive-skill-tree/3.15.0/AAAABQMADAQHES0fAiycLR9Ms18qg_eOvpLB37Dr5AA=
```

#### Cluster Jewels
- `jewel_data{}`: Jewel socket information
- `subgraph.nodes{}`: Cluster jewel passive nodes
- `expansionJewel`: Cluster jewel properties

#### Mastery Effects
- `mastery_effects{}`: Selected mastery effects
- `masteryEffects[]`: Available mastery options

## Recent Changes

### PoE2 Early Access (0.3.0 - Latest)
- ✅ Added Currency Exchange API
- 🔄 Renamed `shapeshift` to `set3` in specializations
- ✅ New item properties: `iconTierText`, `sanctified`, `desecrated`
- ❌ Removed `flavourTextParsed`

### PoE1 Updates (3.26.0)
- ✅ OAuth 2.1 specification compliance
- ✅ Added `memoryItem` property
- ❌ Removed deprecated category fields

### Historical Features
- Account discriminators (#0000 format)
- Realm support (pc, xbox, sony, poe2)
- Guild stash access
- Atlas passive trees
- Tattoo system support

## Data Exports

### PoE1 Available
- **Passive Skill Tree**: https://github.com/grindinggear/skilltree-export
- **Atlas Passive Tree**: https://github.com/grindinggear/atlastree-export

### PoE2 Status
Currently no PoE2-specific data exports available.

## Developer Requirements

### Registration Requirements
1. PoE account name with discriminator (e.g., `Username#1234`)
2. Application name and client type
3. Required grant types and scopes with justification
4. Redirect URIs (HTTPS for confidential, local for public)

### Technical Requirements

#### User-Agent Header
```
User-Agent: OAuth {clientId}/{version} (contact: {email}) OptionalInfo
```

#### Third-Party Notice
```
This product isn't affiliated with or endorsed by Grinding Gear Games in any way.
```

#### Error Handling
- Handle 4xx responses properly
- Respect rate limits
- Avoid excessive invalid requests

### Security Guidelines

#### Credential Management
- ❌ Never include credentials in code or binaries
- ❌ Never share application credentials
- ✅ Keep client secrets server-side only

#### Token Storage
- ✅ Access tokens: Can be stored client-side (HTTPS required)
- ❌ Refresh tokens: Must be stored server-side securely

#### Application Scope
- One product per registered application
- Clear separation of concerns

## Error Codes

### HTTP Status Codes
- `200` OK - Request succeeded
- `202` Accepted - Request accepted, may need processing
- `400` Bad Request - Invalid request format
- `404` Not Found - Resource not found
- `429` Too Many Requests - Rate limited
- `500` Internal Server Error - Server issue

### API Error Codes
- `0` Accepted
- `1` Resource not found
- `2` Invalid query
- `3` Rate limit exceeded
- `4` Internal error
- `5` Unexpected content type
- `6` Forbidden
- `7` Temporarily Unavailable
- `8` Unauthorized
- `9` Method not allowed
- `10` Unprocessable Entity

## Best Practices

### Rate Limiting
- Parse and respect rate limit headers
- Implement exponential backoff
- Cache responses when appropriate
- Avoid polling endpoints unnecessarily

### Data Handling
- Handle null/optional fields properly
- Validate data structures
- Implement proper error recovery
- Cache static data (leagues, items)

### User Experience
- Provide clear error messages
- Implement proper loading states
- Respect user privacy
- Follow OAuth best practices

## Example Implementations

### Basic Authorization Flow
```javascript
// 1. Generate PKCE parameters
const codeVerifier = generateCodeVerifier();
const codeChallenge = await generateCodeChallenge(codeVerifier);

// 2. Redirect to authorization
const authUrl = `https://www.pathofexile.com/oauth/authorize?` +
  `client_id=${clientId}&` +
  `response_type=code&` +
  `scope=account:profile&` +
  `state=${state}&` +
  `redirect_uri=${redirectUri}&` +
  `code_challenge=${codeChallenge}&` +
  `code_challenge_method=S256`;

// 3. Exchange code for token
const tokenResponse = await fetch('https://www.pathofexile.com/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    client_id: clientId,
    grant_type: 'authorization_code',
    code: authCode,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier
  })
});
```

### API Request with Token
```javascript
const response = await fetch('https://api.pathofexile.com/profile', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'User-Agent': 'OAuth myapp/1.0.0 (contact: dev@example.com)'
  }
});
```

This documentation provides everything needed to build third-party Path of Exile applications while maintaining security and respecting the game's ecosystem.
