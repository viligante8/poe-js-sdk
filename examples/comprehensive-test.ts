import { 
  PoEApiClient, 
  TradeClient, 
  OAuthHelper, 
  TradeQueryBuilder,
  AdvancedTradeQueryBuilder,
  ItemCategories,
  Currencies 
} from '../src';

// Configuration - Update these with your actual values
const CONFIG = {
  accessToken: process.env.POE_ACCESS_TOKEN || 'your-access-token-here',
  poesessid: process.env.POE_SESSION_ID || 'your-poesessid-here',
  userAgent: 'poe-js-sdk-Test/1.0.0 (contact: test@example.com)',
  testLeague: 'Standard', // Change to current league
  clientId: 'your-client-id',
  redirectUri: 'http://localhost:8080/callback'
};

class ComprehensiveTest {
  private apiClient: PoEApiClient;
  private tradeClient: TradeClient;
  private results: { [key: string]: 'PASS' | 'FAIL' | 'SKIP' } = {};

  constructor() {
    this.apiClient = new PoEApiClient({
      accessToken: CONFIG.accessToken,
      userAgent: CONFIG.userAgent
    });

    this.tradeClient = new TradeClient({
      poesessid: CONFIG.poesessid,
      userAgent: CONFIG.userAgent
    });
  }

  private async testMethod(name: string, testFn: () => Promise<any>): Promise<void> {
    try {
      console.log(`\n🧪 Testing ${name}...`);
      const result = await testFn();
      console.log(`✅ ${name}: PASS`);
      if (result) console.log(`   Result:`, JSON.stringify(result, null, 2).slice(0, 200) + '...');
      this.results[name] = 'PASS';
    } catch (error: any) {
      console.log(`❌ ${name}: FAIL`);
      console.log(`   Error: ${error.message}`);
      this.results[name] = 'FAIL';
    }
  }

  // OAuth Helper Tests
  async testOAuthHelpers(): Promise<void> {
    console.log('\n=== OAuth Helper Tests ===');

    await this.testMethod('OAuthHelper.generatePKCE', async () => {
      const pkce = await OAuthHelper.generatePKCE();
      if (!pkce.codeVerifier || !pkce.codeChallenge) throw new Error('Invalid PKCE');
      return { hasCodeVerifier: !!pkce.codeVerifier, hasCodeChallenge: !!pkce.codeChallenge };
    });

    await this.testMethod('OAuthHelper.buildAuthUrl', async () => {
      const pkce = await OAuthHelper.generatePKCE();
      const url = OAuthHelper.buildAuthUrl({
        clientId: CONFIG.clientId,
        redirectUri: CONFIG.redirectUri,
        scopes: ['account:profile']
      }, 'test-state', pkce);
      if (!url.includes('oauth.pathofexile.com')) throw new Error('Invalid auth URL');
      return { url: url.slice(0, 100) + '...' };
    });
  }

  // API Client Tests
  async testApiClient(): Promise<void> {
    console.log('\n=== API Client Tests ===');

    await this.testMethod('getRateLimitInfo', async () => {
      return this.apiClient.getRateLimitInfo();
    });

    await this.testMethod('getProfile', async () => {
      return await this.apiClient.getProfile();
    });

    await this.testMethod('getLeagues', async () => {
      const leagues = await this.apiClient.getLeagues();
      return { count: leagues.length, leagues: leagues.slice(0, 3).map(l => l.id) };
    });

    await this.testMethod('getLeagues (PoE2)', async () => {
      const leagues = await this.apiClient.getLeagues('poe2');
      return { count: leagues.length, leagues: leagues.slice(0, 3).map(l => l.id) };
    });

    await this.testMethod('getLeague', async () => {
      return await this.apiClient.getLeague(CONFIG.testLeague);
    });

    await this.testMethod('getLeagueLadder', async () => {
      const ladder = await this.apiClient.getLeagueLadder(CONFIG.testLeague, { limit: 5 });
      return { entries: ladder.entries?.length || 0 };
    });

    await this.testMethod('getCharacters', async () => {
      const characters = await this.apiClient.getCharacters();
      return { count: characters.length, names: characters.slice(0, 3).map(c => c.name) };
    });

    // Test character details if characters exist
    try {
      const characters = await this.apiClient.getCharacters();
      if (characters.length > 0) {
        await this.testMethod('getCharacter', async () => {
          const character = await this.apiClient.getCharacter(characters[0].name);
          return { 
            name: character.name, 
            level: character.level, 
            class: character.class,
            equipmentCount: character.equipment?.length || 0
          };
        });
      }
    } catch (error) {
      console.log('⏭️  Skipping getCharacter (no characters available)');
      this.results['getCharacter'] = 'SKIP';
    }

    await this.testMethod('getStashes', async () => {
      const stashes = await this.apiClient.getStashes(CONFIG.testLeague);
      return { count: stashes.length, names: stashes.slice(0, 3).map(s => s.name) };
    });

    await this.testMethod('getLeagueAccount', async () => {
      return await this.apiClient.getLeagueAccount(CONFIG.testLeague);
    });

    await this.testMethod('getPvpMatches', async () => {
      const matches = await this.apiClient.getPvpMatches();
      return { count: matches.length };
    });

    await this.testMethod('getPublicStashes', async () => {
      const stashes = await this.apiClient.getPublicStashes();
      return { nextChangeId: stashes.next_change_id, stashCount: stashes.stashes?.length || 0 };
    });

    await this.testMethod('getCurrencyExchange', async () => {
      return await this.apiClient.getCurrencyExchange();
    });

    await this.testMethod('getItemFilters', async () => {
      const filters = await this.apiClient.getItemFilters();
      return { count: filters.length || 0 };
    });
  }

  // Trade Client Tests
  async testTradeClient(): Promise<void> {
    console.log('\n=== Trade Client Tests ===');

    const basicQuery = {
      query: {
        status: { option: 'online' },
        type: 'Leather Belt'
      },
      sort: { price: 'asc' }
    };

    await this.testMethod('TradeClient.search', async () => {
      const result = await this.tradeClient.search(CONFIG.testLeague, basicQuery);
      return { 
        id: result.id, 
        total: result.total, 
        resultCount: result.result.length 
      };
    });

    await this.testMethod('TradeClient.searchAndFetch', async () => {
      const result = await this.tradeClient.searchAndFetch(CONFIG.testLeague, basicQuery, 3);
      return { 
        searchTotal: result.search.total,
        itemsCount: result.items.result.length,
        firstItemType: result.items.result[0]?.item?.typeLine
      };
    });

    // Test fetch with actual search results
    try {
      const searchResult = await this.tradeClient.search(CONFIG.testLeague, basicQuery);
      if (searchResult.result.length > 0) {
        await this.testMethod('TradeClient.fetch', async () => {
          const items = await this.tradeClient.fetch(
            searchResult.result.slice(0, 3), 
            searchResult.id
          );
          return { itemCount: items.result.length };
        });

        await this.testMethod('TradeClient.getWhisper', async () => {
          const whisper = await this.tradeClient.getWhisper(
            searchResult.result[0], 
            searchResult.id
          );
          return { whisperLength: whisper.whisper.length };
        });
      }
    } catch (error) {
      console.log('⏭️  Skipping fetch/whisper tests (search failed)');
      this.results['TradeClient.fetch'] = 'SKIP';
      this.results['TradeClient.getWhisper'] = 'SKIP';
    }
  }

  // Query Builder Tests
  async testQueryBuilders(): Promise<void> {
    console.log('\n=== Query Builder Tests ===');

    await this.testMethod('TradeQueryBuilder.basic', async () => {
      const query = new TradeQueryBuilder()
        .itemType('Leather Belt')
        .online()
        .maxPrice(50, 'chaos')
        .build();
      return { hasQuery: !!query.query, hasSort: !!query.sort };
    });

    await this.testMethod('TradeQueryBuilder.withStats', async () => {
      const query = new TradeQueryBuilder()
        .itemType('Leather Belt')
        .addStat('explicit.pseudo_total_life', { min: 70 })
        .addStat('explicit.pseudo_total_resistance', { min: 60 })
        .build();
      return { statCount: query.query.stats?.[0]?.filters?.length || 0 };
    });

    await this.testMethod('AdvancedTradeQueryBuilder', async () => {
      const query = new AdvancedTradeQueryBuilder()
        .itemType('Leather Belt')
        .online()
        .addLifeStat(70)
        .addResistanceStat('fire', 30)
        .priceRange(10, 100, 'chaos')
        .build();
      return { hasQuery: !!query.query, hasSort: !!query.sort };
    });

    await this.testMethod('ItemCategories', async () => {
      const categories = Object.keys(ItemCategories);
      return { categoryCount: categories.length, sample: categories.slice(0, 5) };
    });

    await this.testMethod('Currencies', async () => {
      const currencies = Object.keys(Currencies);
      return { currencyCount: currencies.length, sample: currencies.slice(0, 5) };
    });
  }

  // Realm-specific tests
  async testRealms(): Promise<void> {
    console.log('\n=== Realm-specific Tests ===');

    const realms = ['pc', 'xbox', 'sony', 'poe2'] as const;

    for (const realm of realms) {
      await this.testMethod(`getLeagues (${realm})`, async () => {
        const leagues = await this.apiClient.getLeagues(realm);
        return { realm, count: leagues.length, leagues: leagues.slice(0, 2).map(l => l.id) };
      });

      await this.testMethod(`getCharacters (${realm})`, async () => {
        const characters = await this.apiClient.getCharacters(realm);
        return { realm, count: characters.length };
      });
    }
  }

  // Run all tests
  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Comprehensive PoE SDK Tests');
    console.log('==========================================');

    await this.testOAuthHelpers();
    await this.testApiClient();
    await this.testTradeClient();
    await this.testQueryBuilders();
    await this.testRealms();

    this.printSummary();
  }

  private printSummary(): void {
    console.log('\n📊 Test Summary');
    console.log('================');
    
    const passed = Object.values(this.results).filter(r => r === 'PASS').length;
    const failed = Object.values(this.results).filter(r => r === 'FAIL').length;
    const skipped = Object.values(this.results).filter(r => r === 'SKIP').length;
    const total = Object.keys(this.results).length;

    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`📈 Total: ${total}`);
    console.log(`🎯 Success Rate: ${((passed / (total - skipped)) * 100).toFixed(1)}%`);

    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      Object.entries(this.results)
        .filter(([_, result]) => result === 'FAIL')
        .forEach(([test, _]) => console.log(`   - ${test}`));
    }

    console.log('\n💡 Tips:');
    console.log('- Update CONFIG values with your actual tokens');
    console.log('- Ensure POESESSID is valid for trade API tests');
    console.log('- Some tests may fail due to rate limiting');
    console.log('- League-specific tests depend on current league availability');
  }
}

// Run tests
async function main(): Promise<void> {
  const tester = new ComprehensiveTest();
  await tester.runAllTests();
}

// Export for use in other files
export { ComprehensiveTest, CONFIG };

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
