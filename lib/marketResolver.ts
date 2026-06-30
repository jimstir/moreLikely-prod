import { MarketItem } from "./types";

/**
 * Extracts a slug or ticker from a given URL or raw string.
 * Returns an object with the platform and the identifier.
 */
export function extractIdentifier(query: string): { platform: 'polymarket' | 'kalshi' | 'unknown', id: string } {
  const cleanQuery = query.trim();
  
  try {
    const url = new URL(cleanQuery);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    
    // https://kalshi.com/markets/kxhighny or https://kalshi.com/markets/.../.../?op_market_ticker=...
    if (url.hostname.includes('kalshi.com') && pathSegments[0] === 'markets' && pathSegments[1]) {
      const explicitTicker = url.searchParams.get('op_market_ticker');
      if (explicitTicker) {
        return { platform: 'kalshi', id: explicitTicker.toUpperCase() };
      }
      // If no query param, the ticker is typically the last segment
      return { platform: 'kalshi', id: pathSegments[pathSegments.length - 1].toUpperCase() };
    }
    
    // https://polymarket.com/event/will-donald-trump-win-the-2024-us-presidential-election
    // OR https://polymarket.com/sports/world-cup/fifwc-rsa-can-2026-06-28
    if (url.hostname.includes('polymarket.com') && pathSegments.length > 0) {
      return { platform: 'polymarket', id: pathSegments[pathSegments.length - 1] };
    }
  } catch (e) {
    // Not a valid URL, treat as raw ticker/slug
    // Kalshi tickers usually have dashes and uppercase letters (e.g. INX-24, KXHIGHNY)
    if (cleanQuery.toUpperCase() === cleanQuery && cleanQuery.length < 20) {
      return { platform: 'kalshi', id: cleanQuery };
    }
    // Polymarket slugs are usually lowercase with dashes
    if (cleanQuery.includes('-') && cleanQuery.toLowerCase() === cleanQuery) {
      return { platform: 'polymarket', id: cleanQuery };
    }
    
    // Fallback guess
    return { platform: 'unknown', id: cleanQuery };
  }
  
  return { platform: 'unknown', id: cleanQuery };
}

/**
 * Fetches data from the appropriate API and normalizes it to a MarketItem
 */
export async function resolveMarket(query: string): Promise<MarketItem | null> {
  const { platform, id } = extractIdentifier(query);
  
  if (platform === 'polymarket' || platform === 'unknown') {
    try {
      const res = await fetch(`https://gamma-api.polymarket.com/events?slug=${id}`, {
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const pmEvent = data[0];
          // Determine prices from markets array if available, else default
          let yesPrice = 0.5;
          let noPrice = 0.5;
          if (pmEvent.markets && pmEvent.markets[0] && pmEvent.markets[0].outcomePrices) {
            try {
              const prices = JSON.parse(pmEvent.markets[0].outcomePrices);
              yesPrice = parseFloat(prices[0]);
              noPrice = parseFloat(prices[1]);
            } catch (e) {}
          }
          
          return {
            id: pmEvent.id || id,
            title: pmEvent.title || pmEvent.question || id,
            category: pmEvent.category || "Crypto",
            volume: pmEvent.volume || 0,
            liquidity: pmEvent.liquidity || 0,
            yesPrice: yesPrice,
            noPrice: noPrice,
            imageUrl: pmEvent.image || "https://polymarket.com/images/default-token.png",
            platform: "Polymarket"
          };
        }
      }
    } catch (e) {
      console.error("Polymarket resolve error:", e);
    }
  }
  
  if (platform === 'kalshi' || platform === 'unknown') {
    try {
      // First try fetching as a direct market ticker
      let res = await fetch(`https://external-api.kalshi.com/trade-api/v2/markets/${id}`, {
        headers: { 'Accept': 'application/json' }
      });
      
      let kMarket = null;
      
      if (res.ok) {
        const data = await res.json();
        kMarket = data.market;
      } else {
        // Fallback to treating the ID as an event ticker
        res = await fetch(`https://external-api.kalshi.com/trade-api/v2/events/${id}`, {
          headers: { 'Accept': 'application/json' }
        });
        
        if (res.ok) {
          const data = await res.json();
          // An event contains multiple markets at the root level alongside the event object
          if (data.event && data.markets && data.markets.length > 0) {
            kMarket = data.markets[0];
            kMarket.title = kMarket.title || data.event.title || data.event.event_ticker;
            kMarket.category = kMarket.category || data.event.category;
          }
        }
      }

      if (kMarket) {
        // Handle variations between v1 (cents) and v2 (dollars as strings) of Kalshi API
        const volume = parseFloat(kMarket.volume_fp || kMarket.volume || "0");
        const liquidity = parseFloat(kMarket.liquidity_dollars || kMarket.liquidity || kMarket.liquidity_fp || "0");
        
        let yesPrice = 0.5;
        let noPrice = 0.5;
        if (kMarket.yes_ask_dollars) { yesPrice = parseFloat(kMarket.yes_ask_dollars); }
        else if (kMarket.yes_ask) { yesPrice = kMarket.yes_ask / 100; }
        
        if (kMarket.no_ask_dollars) { noPrice = parseFloat(kMarket.no_ask_dollars); }
        else if (kMarket.no_ask) { noPrice = kMarket.no_ask / 100; }

        return {
          id: kMarket.ticker,
          title: kMarket.title || kMarket.ticker,
          category: kMarket.category || "Economics",
          volume: volume,
          liquidity: liquidity,
          yesPrice: yesPrice,
          noPrice: noPrice,
          imageUrl: kMarket.image_url || "/kalshi-default.png",
          platform: "Kalshi"
        };
      }
    } catch (e) {
      console.error("Kalshi resolve error:", e);
    }
  }

  return null;
}
