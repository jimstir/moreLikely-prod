import { MarketItem } from './types';

const POLYMARKET_API_BASE = 'https://gamma-api.polymarket.com';

export async function fetchPolymarketEvents(): Promise<MarketItem[]> {
  try {
    const res = await fetch(`${POLYMARKET_API_BASE}/events?limit=200&active=true`, {
      headers: {
        'Accept': 'application/json'
      },
      next: { revalidate: 60 }
    });
    
    if (!res.ok) {
      console.error('Failed to fetch Polymarket events:', await res.text());
      return [];
    }
    
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    
    // Normalize data into our schema
    return data.map((event: any) => {
      // Find the main market
      const mainMarket = event.markets?.[0];
      const yesPrice = mainMarket?.outcomePrices?.[0] ? parseFloat(mainMarket.outcomePrices[0]) : 0.5;
      const noPrice = mainMarket?.outcomePrices?.[1] ? parseFloat(mainMarket.outcomePrices[1]) : 0.5;
      
      return {
        id: event.id,
        marketId: event.id,
        title: event.title,
        subtitle: event.category || 'Polymarket Event',
        rationale: event.description || "Analysis needed.",
        yesPrice,
        noPrice,
        liquidity: parseFloat(event.liquidity || mainMarket?.liquidity || '10000'),
        category: event.category,
        subCategory: event.tags || [],
        platform: 'polymarket'
      };
    });
  } catch (error) {
    console.error('Error fetching Polymarket markets:', error);
    return [];
  }
}
