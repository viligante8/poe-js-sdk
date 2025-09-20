import { PoEApiClient } from '../src';

// Focused test for league-related functionality
async function testLeagues(): Promise<void> {
  const client = new PoEApiClient({
    accessToken: process.env.POE_ACCESS_TOKEN || 'your-access-token-here',
    userAgent: 'poe-js-sdk-LeagueTest/1.0.0 (contact: test@example.com)'
  });

  console.log('🏆 League Functionality Test');
  console.log('============================\n');

  try {
    // Test 1: Get all leagues (PC)
    console.log('1️⃣ Testing getLeagues() for PC...');
    const pcLeagues = await client.getLeagues();
    console.log(`✅ Found ${pcLeagues.length} PC leagues:`);
    pcLeagues.forEach(league => {
      console.log(`   - ${league.id} (${league.realm || 'pc'})`);
    });

    // Test 2: Get PoE2 leagues
    console.log('\n2️⃣ Testing getLeagues("poe2")...');
    const poe2Leagues = await client.getLeagues('poe2');
    console.log(`✅ Found ${poe2Leagues.length} PoE2 leagues:`);
    poe2Leagues.forEach(league => {
      console.log(`   - ${league.id} (${league.realm || 'poe2'})`);
    });

    // Test 3: Get Xbox leagues
    console.log('\n3️⃣ Testing getLeagues("xbox")...');
    const xboxLeagues = await client.getLeagues('xbox');
    console.log(`✅ Found ${xboxLeagues.length} Xbox leagues:`);
    xboxLeagues.forEach(league => {
      console.log(`   - ${league.id} (${league.realm || 'xbox'})`);
    });

    // Test 4: Get PlayStation leagues
    console.log('\n4️⃣ Testing getLeagues("sony")...');
    const sonyLeagues = await client.getLeagues('sony');
    console.log(`✅ Found ${sonyLeagues.length} PlayStation leagues:`);
    sonyLeagues.forEach(league => {
      console.log(`   - ${league.id} (${league.realm || 'sony'})`);
    });

    // Test 5: Get specific league details
    if (pcLeagues.length > 0) {
      const testLeague = pcLeagues[0];
      console.log(`\n5️⃣ Testing getLeague("${testLeague.id}")...`);
      const leagueDetails = await client.getLeague(testLeague.id);
      console.log(`✅ League details:`, {
        id: leagueDetails.id,
        realm: leagueDetails.realm,
        description: leagueDetails.description?.slice(0, 100) + '...',
        registerAt: leagueDetails.registerAt,
        startAt: leagueDetails.startAt,
        endAt: leagueDetails.endAt
      });

      // Test 6: Get league ladder
      console.log(`\n6️⃣ Testing getLeagueLadder("${testLeague.id}")...`);
      const ladder = await client.getLeagueLadder(testLeague.id, { limit: 5 });
      console.log(`✅ Ladder entries: ${ladder.entries?.length || 0}`);
      if (ladder.entries && ladder.entries.length > 0) {
        console.log('   Top entries:');
        ladder.entries.slice(0, 3).forEach((entry: any, index: number) => {
          console.log(`   ${index + 1}. ${entry.character?.name} (Level ${entry.character?.level})`);
        });
      }
    }

    // Test 7: Rate limit info
    console.log('\n7️⃣ Checking rate limit info...');
    const rateLimitInfo = client.getRateLimitInfo();
    console.log('✅ Rate limit info:', rateLimitInfo);

    console.log('\n🎉 All league tests completed successfully!');

  } catch (error: any) {
    console.error('\n❌ League test failed:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    console.log('\n💡 Troubleshooting tips:');
    console.log('- Verify your access token is valid');
    console.log('- Check if you have the required scopes');
    console.log('- Ensure you\'re not hitting rate limits');
    console.log('- Try with a different realm if one fails');
  }
}

// Export for use in other files
export { testLeagues };

// Run if called directly
if (require.main === module) {
  testLeagues().catch(console.error);
}
