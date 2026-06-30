import { resolveMarket } from '../lib/marketResolver';

async function main() {
  const query = process.argv[2];

  if (!query) {
    console.log("❌ Error: Please provide a URL or ticker.");
    console.log("Usage: npx ts-node scripts/test-resolve.ts <URL_OR_TICKER>");
    console.log("Example: npx ts-node scripts/test-resolve.ts https://kalshi.com/markets/kxhighny");
    process.exit(1);
  }

  console.log(`\n🔍 Resolving market for query: "${query}"\n`);

  try {
    const market = await resolveMarket(query);

    if (market) {
      console.log("✅ Market Successfully Resolved!");
      console.log("--------------------------------------------------");
      console.log(`Platform: ${market.platform}`);
      console.log(`ID/Ticker: ${market.id}`);
      console.log(`Title: ${market.title}`);
      console.log(`Category: ${market.category}`);
      console.log(`Volume: $${(market as any).volume?.toLocaleString()}`);
      console.log(`Yes Odds: ${(market.yesPrice * 100).toFixed(1)}%`);
      console.log(`No Odds: ${(market.noPrice * 100).toFixed(1)}%`);
      console.log("--------------------------------------------------\n");
    } else {
      console.log("❌ Failed to resolve market. The URL or ticker might be invalid, or the market doesn't exist.");
    }
  } catch (error) {
    console.error("🚨 An error occurred during resolution:", error);
  }
}

main();
