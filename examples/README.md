# PoE SDK Examples

This directory contains comprehensive examples and tests for the PoE SDK.

## Files

### Test Files
- **`comprehensive-test.ts`** - Complete test suite covering all SDK methods
- **`leagues-test.ts`** - Focused test for league-related functionality  
- **`run-tests.ts`** - Test runner with environment variable support

### Example Files
- **`basic-usage.ts`** - Basic SDK usage examples
- **`trade-example.ts`** - Trade API examples
- **`enhanced-trade-example.ts`** - Advanced trade functionality

## Running Tests

### Prerequisites
Set up your environment variables:
```bash
export POE_ACCESS_TOKEN="your-access-token-here"
export POE_SESSION_ID="your-poesessid-here"
```

### Run All Tests
```bash
npm run test:comprehensive
# or
npm run test:examples
```

### Run League-Specific Tests
```bash
npm run test:leagues
```

### Run Individual Files
```bash
npx tsx examples/comprehensive-test.ts
npx tsx examples/leagues-test.ts
```

## Configuration

Update the `CONFIG` object in `comprehensive-test.ts`:
```typescript
const CONFIG = {
  accessToken: process.env.POE_ACCESS_TOKEN || 'your-access-token-here',
  poesessid: process.env.POE_SESSION_ID || 'your-poesessid-here',
  userAgent: 'PoE-SDK-Test/1.0.0 (contact: test@example.com)',
  testLeague: 'Standard', // Change to current league
  clientId: 'your-client-id',
  redirectUri: 'http://localhost:8080/callback'
};
```

## What Gets Tested

### PoEApiClient Methods
- ✅ Profile management (`getProfile`)
- ✅ League operations (`getLeagues`, `getLeague`, `getLeagueLadder`)
- ✅ Character management (`getCharacters`, `getCharacter`)
- ✅ Stash operations (`getStashes`, `getStash`)
- ✅ PvP matches (`getPvpMatches`, `getPvpMatch`)
- ✅ Public stashes (`getPublicStashes`)
- ✅ Currency exchange (`getCurrencyExchange`)
- ✅ Item filters (`getItemFilters`, `getItemFilter`)
- ✅ Rate limiting (`getRateLimitInfo`)

### TradeClient Methods (Unofficial)
- ✅ Trade search (`search`)
- ✅ Item fetching (`fetch`)
- ✅ Combined operations (`searchAndFetch`)
- ✅ Whisper messages (`getWhisper`)

### OAuth Helper Methods
- ✅ PKCE generation (`generatePKCE`)
- ✅ Auth URL building (`buildAuthUrl`)
- ✅ Token exchange (`exchangeCodeForToken`)

### Query Builders
- ✅ Basic trade queries (`TradeQueryBuilder`)
- ✅ Advanced queries (`AdvancedTradeQueryBuilder`)
- ✅ Item categories and currencies

### Multi-Realm Support
- ✅ PC (default)
- ✅ Xbox (`xbox`)
- ✅ PlayStation (`sony`)
- ✅ PoE2 (`poe2`)

## Troubleshooting

### Common Issues

**Authentication Errors**
- Verify your access token is valid and has required scopes
- Check token expiration

**League Issues**
- Ensure the test league exists and is active
- Try different realms if one fails
- Check for seasonal league changes

**Rate Limiting**
- Tests may fail due to API rate limits
- Wait and retry if you hit limits
- Check rate limit info in test output

**Trade API Issues**
- Ensure POESESSID is valid and current
- Trade API is unofficial and may change
- Check browser session if POESESSID fails

### Getting Tokens

**Access Token**
1. Register OAuth application at https://www.pathofexile.com/developer/api-keys
2. Use OAuth flow or generate personal token
3. Ensure required scopes: `account:profile`, `account:characters`, `account:stashes`

**POESESSID**
1. Log into pathofexile.com in browser
2. Open developer tools → Application → Cookies
3. Copy POESESSID value

## Output Example

```
🚀 Starting Comprehensive PoE SDK Tests
==========================================

=== OAuth Helper Tests ===
🧪 Testing OAuthHelper.generatePKCE...
✅ OAuthHelper.generatePKCE: PASS

=== API Client Tests ===
🧪 Testing getLeagues...
✅ getLeagues: PASS
   Result: {"count":8,"leagues":["Standard","Hardcore","Solo Self-Found"]}

📊 Test Summary
================
✅ Passed: 25
❌ Failed: 2
⏭️  Skipped: 3
📈 Total: 30
🎯 Success Rate: 92.6%
```
