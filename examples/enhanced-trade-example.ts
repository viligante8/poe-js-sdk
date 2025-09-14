import { 
  TradeClient, 
  AdvancedTradeQueryBuilder, 
  TradeRateLimiter,
  groupTradeResults,
  ENHANCED_CATEGORIES,
  ENHANCED_CURRENCIES,
  COMMON_STAT_IDS
} from '../src';

async function enhancedTradeExample(): Promise<void> {
  // Initialize with rate limiting (like Exiled-Exchange-2)
  const rateLimiter = new TradeRateLimiter();
  const tradeClient = new TradeClient({
    poesessid: 'your-poesessid-here',
    userAgent: 'MyPoEApp/1.0.0 (contact: developer@example.com)'
  });

  try {
    // Example 1: Advanced weapon search (like PathOfBuilding)
    console.log('=== Advanced Weapon Search ===');
    const weaponQuery = new AdvancedTradeQueryBuilder()
      .onlineOnly(true)
      .category(ENHANCED_CATEGORIES.CROSSBOW) // PoE2 crossbow
      .price(ENHANCED_CURRENCIES.GREATER_CHAOS, 1, 100)
      .weaponDPS(undefined, undefined, 200) // Min 200 total DPS
      .itemLevel(70) // Min item level 70
      .quality(15) // Min 15% quality
      .build();

    if (rateLimiter.canMakeRequest('search')) {
      rateLimiter.recordRequest('search');
      const weaponResults = await tradeClient.searchAndFetch('Standard', weaponQuery, 10, 'poe2');
      
      // Group results like Exiled-Exchange-2
      const groupedWeapons = groupTradeResults(weaponResults.items.result);
      
      console.log(`Found ${weaponResults.search.total} crossbows, grouped into ${groupedWeapons.length} listings:`);
      groupedWeapons.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. ${item.item.name || item.item.typeLine}`);
        console.log(`   Price: ${item.listing.price.amount} ${item.listing.price.currency}`);
        console.log(`   Listed ${item.listedTimes} times`);
        if (item.priceRange) {
          console.log(`   Price range: ${item.priceRange.min}-${item.priceRange.max}`);
        }
        console.log(`   Account: ${item.listing.account.name}`);
        console.log('');
      });
    } else {
      console.log(`Rate limited, wait ${rateLimiter.getWaitTime('search')}ms`);
    }

    // Example 2: Life + Resistance armor search (common PoE pattern)
    console.log('=== Life + Resistance Armor Search ===');
    const armorQuery = new AdvancedTradeQueryBuilder()
      .onlineOnly(true)
      .category(ENHANCED_CATEGORIES.FOCUS) // PoE2 focus
      .price(ENHANCED_CURRENCIES.PERFECT_CHAOS, undefined, 50) // Max 50 perfect chaos
      .andStats([
        { id: COMMON_STAT_IDS.LIFE, min: 70 },
        { id: COMMON_STAT_IDS.ENERGY_SHIELD, min: 50 },
      ])
      .totalResistance(75) // Total elemental resistance >= 75%
      .itemLevel(60, 85) // Item level 60-85
      .build();

    await new Promise(resolve => setTimeout(resolve, rateLimiter.getWaitTime('search')));
    
    if (rateLimiter.canMakeRequest('search')) {
      rateLimiter.recordRequest('search');
      const armorResults = await tradeClient.searchAndFetch('Standard', armorQuery, 8, 'poe2');
      
      console.log(`Found ${armorResults.search.total} focus items:`);
      armorResults.items.result.slice(0, 3).forEach((item, index) => {
        console.log(`${index + 1}. ${item.item.name || item.item.typeLine}`);
        console.log(`   iLevel: ${item.item.itemLevel}`);
        console.log(`   Price: ${item.listing.price.amount} ${item.listing.price.currency}`);
        
        // Show relevant mods
        if (item.item.explicitMods) {
          const lifeMods = item.item.explicitMods.filter(mod => mod.includes('Life'));
          const resMods = item.item.explicitMods.filter(mod => mod.includes('Resistance'));
          if (lifeMods.length) console.log(`   Life: ${lifeMods.join(', ')}`);
          if (resMods.length) console.log(`   Res: ${resMods.join(', ')}`);
        }
        console.log('');
      });
    }

    // Example 3: Gem search with level/quality filters
    console.log('=== Gem Search ===');
    const gemQuery = new AdvancedTradeQueryBuilder()
      .onlineOnly(true)
      .category('gem.activegem')
      .gemLevel(18) // Min level 18
      .quality(15) // Min 15% quality
      .corrupted(false) // Not corrupted
      .price(ENHANCED_CURRENCIES.CHAOS, undefined, 20)
      .build();

    await new Promise(resolve => setTimeout(resolve, rateLimiter.getWaitTime('search')));
    
    if (rateLimiter.canMakeRequest('search')) {
      rateLimiter.recordRequest('search');
      const gemResults = await tradeClient.searchAndFetch('Standard', gemQuery, 5);
      
      console.log(`Found ${gemResults.search.total} gems:`);
      gemResults.items.result.forEach((item, index) => {
        console.log(`${index + 1}. ${item.item.typeLine}`);
        console.log(`   Price: ${item.listing.price.amount} ${item.listing.price.currency}`);
        
        // Show gem properties
        if (item.item.properties) {
          const levelProp = item.item.properties.find(p => p.name === 'Level');
          const qualityProp = item.item.properties.find(p => p.name === 'Quality');
          if (levelProp) console.log(`   Level: ${levelProp.values[0]?.[0]}`);
          if (qualityProp) console.log(`   Quality: ${qualityProp.values[0]?.[0]}`);
        }
        console.log('');
      });
    }

    // Example 4: Currency exchange search
    console.log('=== Currency Exchange ===');
    const currencyQuery = new AdvancedTradeQueryBuilder()
      .onlineOnly(true)
      .category('currency')
      .price(ENHANCED_CURRENCIES.GREATER_CHAOS, undefined, 1) // Looking for cheap currency
      .build();

    await new Promise(resolve => setTimeout(resolve, rateLimiter.getWaitTime('search')));
    
    if (rateLimiter.canMakeRequest('search')) {
      rateLimiter.recordRequest('search');
      const currencyResults = await tradeClient.searchAndFetch('Standard', currencyQuery, 5, 'poe2');
      
      console.log(`Found ${currencyResults.search.total} currency items:`);
      currencyResults.items.result.forEach((item, index) => {
        console.log(`${index + 1}. ${item.item.typeLine}`);
        console.log(`   Price: ${item.listing.price.amount} ${item.listing.price.currency}`);
        console.log(`   Stack: ${item.item.stackSize || 1}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('Enhanced Trade API Error:', error);
    
    if (error.response?.status === 403) {
      console.error('Authentication failed - check your POESESSID cookie');
    } else if (error.response?.status === 429) {
      console.error('Rate limited - the rate limiter should have prevented this');
    }
  }
}

// Example of bulk currency trading (like both tools support)
async function bulkCurrencyExample(): Promise<void> {
  const tradeClient = new TradeClient({
    poesessid: 'your-poesessid-here'
  });

  // Bulk currency exchange query
  const bulkQuery = {
    query: {
      status: { option: 'online' },
      want: [ENHANCED_CURRENCIES.GREATER_CHAOS],
      have: [ENHANCED_CURRENCIES.PERFECT_CHAOS],
      minimum: 10, // Minimum stack size
    }
  };

  try {
    // Note: This would use the bulk API endpoint (different from regular search)
    console.log('Bulk currency trading query built:', bulkQuery);
    console.log('This would require implementing the bulk trade API endpoints');
  } catch (error) {
    console.error('Bulk trade error:', error);
  }
}

// Run examples (uncomment to test)
// enhancedTradeExample().catch(console.error);
// bulkCurrencyExample().catch(console.error);
