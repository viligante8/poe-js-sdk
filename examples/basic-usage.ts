import { PoEApiClient, OAuthHelper } from '../src';

async function basicExample(): Promise<void> {
  // Example OAuth flow
  const oauthConfig = {
    clientId: 'your-client-id',
    redirectUri: 'http://localhost:8080/callback',
    scopes: ['account:profile', 'account:characters', 'account:stashes']
  };

  // Generate PKCE for security (async universal)
  const pkce = await OAuthHelper.generatePKCE();
  
  // Build auth URL (redirect user here)
  const authUrl = OAuthHelper.buildAuthUrl(oauthConfig, 'random-state', pkce);
  console.log('Redirect user to:', authUrl);

  // After user authorizes and you get the code, exchange it for tokens
  // const tokens = await OAuthHelper.exchangeCodeForToken(
  //   oauthConfig,
  //   'authorization-code-from-callback',
  //   pkce.codeVerifier
  // );

  // Initialize client with access token
  const client = new PoEApiClient({
    accessToken: 'your-access-token-here',
    userAgent: 'MyPoEApp/1.0.0 (contact: developer@example.com)'
  });

  try {
    // Get user profile
    const profile = await client.getProfile();
    console.log('Profile:', profile);

    // Get all leagues
    const leagues = await client.getLeagues();
    console.log('Available leagues:', leagues.map(l => l.id));

    // Get characters
    const characters = await client.getCharacters();
    console.log('Characters:', characters.map(c => `${c.name} (${c.class}, Level ${c.level})`));

    // Get character details
    if (characters.length > 0) {
      const character = await client.getCharacter(characters[0]!.name);
      console.log('Character details:', {
        name: character.name,
        level: character.level,
        class: character.class,
        equipmentCount: character.equipment?.length || 0,
        inventoryCount: character.inventory?.length || 0
      });
    }

    // Get stashes for a league (PoE1 only)
    const currentLeague = leagues.find(l => l.id === 'Affliction');
    if (currentLeague) {
      const stashes = await client.getStashes(currentLeague.id);
      console.log('Stash tabs:', stashes.map(s => s.name));
    }

    // Check rate limit info
    const rateLimitInfo = client.getRateLimitInfo();
    console.log('Rate limit info:', rateLimitInfo);

  } catch (error) {
    console.error('API Error:', error);
  }
}

// Example of handling different realms
async function realmExample(): Promise<void> {
  const client = new PoEApiClient({
    accessToken: 'your-access-token',
    userAgent: 'MyPoEApp/1.0.0 (contact: developer@example.com)'
  });

  // Get PoE2 leagues
  const poe2Leagues = await client.getLeagues('poe2');
  console.log('PoE2 leagues:', poe2Leagues);

  // Get Xbox characters
  const xboxCharacters = await client.getCharacters('xbox');
  console.log('Xbox characters:', xboxCharacters);

  // Get PlayStation leagues
  const psLeagues = await client.getLeagues('sony');
  console.log('PlayStation leagues:', psLeagues);
}

// Example of working with items
async function itemExample(): Promise<void> {
  const client = new PoEApiClient({
    accessToken: 'your-access-token',
    userAgent: 'MyPoEApp/1.0.0 (contact: developer@example.com)'
  });

  const characters = await client.getCharacters();
  if (characters.length === 0) return;

  const character = await client.getCharacter(characters[0]!.name);
  
  // Analyze equipment
  character.equipment?.forEach(item => {
    console.log(`${item.name || item.typeLine}:`);
    console.log(`  Base: ${item.baseType}`);
    console.log(`  Level: ${item.ilvl}`);
    
    if (item.sockets && item.sockets.length > 0) {
      console.log(`  Sockets: ${item.sockets.map(s => s.sColour).join('-')}`);
    }
    
    if (item.explicitMods && item.explicitMods.length > 0) {
      console.log(`  Mods: ${item.explicitMods.join(', ')}`);
    }
  });
}

// Run examples (uncomment to test)
// basicExample().catch(console.error);
// realmExample().catch(console.error);
// itemExample().catch(console.error);
