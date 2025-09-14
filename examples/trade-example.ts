import { TradeClient, TradeQueryBuilder, ItemCategories, Currencies } from '../src';

async function tradeExample(): Promise<void> {
  // Initialize trade client with your POESESSID
  const tradeClient = new TradeClient({
    poesessid: 'your-poesessid-here', // Get this from browser cookies
    userAgent: 'MyPoEApp/1.0.0 (contact: developer@example.com)'
  });

  try {
    // Example 1: Search for rings with life and resistance
    const ringQuery = new TradeQueryBuilder()
      .onlineOnly(true)
      .category(ItemCategories.ACCESSORY_RING)
      .price(Currencies.CHAOS, 1, 50) // 1-50 chaos
      .andStats([
        { id: 'explicit.stat_3299347043', min: 70 }, // Life
        { id: 'explicit.stat_4220027924', min: 30 }, // Fire Resistance
      ])
      .build();

    console.log('Searching for rings...');
    const ringResults = await tradeClient.searchAndFetch('Standard', ringQuery, 5);
    
    console.log(`Found ${ringResults.search.total} rings, showing first 5:`);
    ringResults.items.result.forEach((item, index) => {
      console.log(`${index + 1}. ${item.item.name || item.item.typeLine}`);
      console.log(`   Price: ${item.listing.price.amount} ${item.listing.price.currency}`);
      console.log(`   Account: ${item.listing.account.name}`);
      console.log(`   Whisper: ${item.listing.whisper}`);
      console.log('');
    });

    // Example 2: Search for PoE2 items
    const poe2Query = new TradeQueryBuilder()
      .onlineOnly(true)
      .category('weapon.staff')
      .price('exalted', undefined, 10) // Max 10 exalted
      .build();

    console.log('Searching PoE2 items...');
    const poe2Results = await tradeClient.searchAndFetch('Standard', poe2Query, 3, 'poe2');
    
    console.log(`Found ${poe2Results.search.total} staves in PoE2:`);
    poe2Results.items.result.forEach((item, index) => {
      console.log(`${index + 1}. ${item.item.name || item.item.typeLine}`);
      console.log(`   iLevel: ${item.item.itemLevel}`);
      console.log(`   Price: ${item.listing.price.amount} ${item.listing.price.currency}`);
    });

    // Example 3: Complex weighted search
    const complexQuery = new TradeQueryBuilder()
      .onlineOnly(true)
      .category(ItemCategories.ARMOUR_CHEST)
      .weightedStats([
        { id: 'explicit.stat_3299347043', weight: 3 }, // Life (high weight)
        { id: 'explicit.stat_4220027924', weight: 1 }, // Fire Res
        { id: 'explicit.stat_3441501978', weight: 1 }, // Cold Res
        { id: 'explicit.stat_1671376347', weight: 1 }, // Lightning Res
      ])
      .build();

    console.log('Complex weighted search...');
    const complexResults = await tradeClient.search('Standard', complexQuery);
    console.log(`Found ${complexResults.total} items matching weighted criteria`);

  } catch (error) {
    console.error('Trade API Error:', error);
    
    if (error.response?.status === 403) {
      console.error('Authentication failed - check your POESESSID cookie');
    } else if (error.response?.status === 429) {
      console.error('Rate limited - wait before making more requests');
    }
  }
}

// Example of manual query (like the Jupyter notebook)
async function manualQueryExample(): Promise<void> {
  const tradeClient = new TradeClient({
    poesessid: 'your-poesessid-here'
  });

  // Manual query structure (like the notebook example)
  const manualQuery = {
    query: {
      stats: [
        {
          type: 'and',
          filters: [
            {
              id: 'explicit.stat_2923486259',
              value: { min: 10 },
              disabled: false
            }
          ]
        },
        {
          type: 'weight2',
          filters: [
            { id: 'explicit.stat_3372524247', value: { weight: 1 }, disabled: false },
            { id: 'explicit.stat_1671376347', value: { weight: 1 }, disabled: false },
            { id: 'explicit.stat_4220027924', value: { weight: 1 }, disabled: false },
            { id: 'explicit.stat_2901986750', value: { weight: 3 }, disabled: false }
          ]
        }
      ],
      status: { option: 'online' },
      filters: {
        type_filters: {
          filters: {
            category: { option: 'accessory.ring' }
          }
        },
        trade_filters: {
          filters: {
            price: { option: 'exalted' }
          }
        }
      }
    }
  };

  try {
    const results = await tradeClient.searchAndFetch('Standard', manualQuery, 10, 'poe2');
    console.log('Manual query results:', results);
  } catch (error) {
    console.error('Manual query failed:', error);
  }
}

// Run examples (uncomment to test)
// tradeExample().catch(console.error);
// manualQueryExample().catch(console.error);
