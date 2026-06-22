import { MarketItem } from './types';

const KALSHI_API_BASE = 'https://external-api.kalshi.com/trade-api/v2';

export async function fetchKalshiMarkets(): Promise<MarketItem[]> {
  try {
    const res = await fetch(`${KALSHI_API_BASE}/events?limit=200`, {
      headers: {
        'Accept': 'application/json'
      },
      next: { revalidate: 60 } // cache for 60 seconds
    });
    
    if (!res.ok) {
      console.error('Failed to fetch Kalshi markets:', await res.text());
      return [];
    }
    
    const data = await res.json();
    if (!data.events) return [];
    
    // Normalize data into our schema
    return data.events.map((event: any) => ({
      id: event.event_ticker,
      marketId: event.event_ticker,
      title: event.title || event.mutually_exclusive || event.event_ticker,
      subtitle: event.sub_title || event.category || 'Kalshi Event',
      rationale: "Analysis needed.",
      yesPrice: 0.5, // Kalshi trade-api v2/events doesn't return live prices directly without querying markets, defaulting to 50/50 for proxy
      noPrice: 0.5,
      liquidity: 10000, // proxy placeholder
      category: event.category,
      subCategory: [event.sub_title],
      platform: 'kalshi'
    }));
  } catch (error) {
    console.error('Error fetching Kalshi markets:', error);
    return [];
  }
}
