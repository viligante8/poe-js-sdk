#!/usr/bin/env tsx

import { ComprehensiveTest } from './comprehensive-test';

// Simple test runner with environment variable support
async function runTests(): Promise<void> {
  console.log('🔧 PoE SDK Test Runner');
  console.log('======================\n');

  // Check for required environment variables
  const requiredEnvVars = {
    POE_ACCESS_TOKEN: process.env.POE_ACCESS_TOKEN,
    POE_SESSION_ID: process.env.POE_SESSION_ID
  };

  const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key, _]) => key);

  if (missingVars.length > 0) {
    console.log('⚠️  Missing environment variables:');
    missingVars.forEach(varName => {
      console.log(`   - ${varName}`);
    });
    console.log('\n💡 Set these variables or update CONFIG in comprehensive-test.ts');
    console.log('   Example: export POE_ACCESS_TOKEN="your-token-here"');
    console.log('   Example: export POE_SESSION_ID="your-session-id-here"\n');
  }

  const tester = new ComprehensiveTest();
  await tester.runAllTests();
}

runTests().catch(console.error);
