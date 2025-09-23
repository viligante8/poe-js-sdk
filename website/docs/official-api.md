---
id: official-api
title: Official API Coverage
---

### Account

- Profile: `getProfile()`
- Item Filters: `getItemFilters()`, `getItemFilter(id)`, `createItemFilter()`, `updateItemFilter()`
- Characters: `getCharacters(realm?)`, `getCharacter(name, realm?)`
- Stashes (PoE1): `getStashes(league, realm?)`, `getStash(league, stashId, substashId?, realm?)`
- League Account (PoE1): `getLeagueAccount(league, realm?)`
- Account Leagues (PoE1): `getAccountLeagues(realm?)`
- Guild Stashes (PoE1): `getGuildStashes(league, realm?)`, `getGuildStash(league, stashId, substashId?, realm?)`

### Public

- Leagues: `getLeagues(realmOrOptions?)`, `getLeague(id, realm?)`
- Ladders (PoE1):
  - League Ladder: `getLeagueLadder(league, { realm, limit, offset, sort, class })`
  - Event Ladder: `getLeagueEventLadder(league, { realm, limit, offset })`
- PvP Matches (PoE1): `getPvpMatches({ realm, type, season, league })`, `getPvpMatch(id, realm?)`, `getPvpMatchLadder(id, { realm, limit, offset })`
- Public Stashes (PoE1): `getPublicStashes({ realm, id })`
- Currency Exchange: `getCurrencyExchange(realm?, id?)`

### Typed Responses (examples)

- `getLeagueLadder` → `{ league: League; ladder: Ladder }`
- `getLeagueEventLadder` → `{ league: League; ladder: { total: number; entries: EventLadderEntry[] } }`
- `getPvpMatchLadder` → `{ match: PvpMatch; ladder: { total: number; entries: PvPLadderTeamEntry[] } }`

See the API Reference for full, auto-generated typings.

