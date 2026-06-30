import { extractIdentifier, resolveMarket } from '../lib/marketResolver';

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Market Resolver Utils', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('extractIdentifier()', () => {
    it('correctly parses a Polymarket URL', () => {
      const result = extractIdentifier('https://polymarket.com/event/will-donald-trump-win-the-2024-us-presidential-election');
      expect(result.platform).toBe('polymarket');
      expect(result.id).toBe('will-donald-trump-win-the-2024-us-presidential-election');
    });

    it('correctly parses a Kalshi URL', () => {
      const result = extractIdentifier('https://kalshi.com/markets/kxhighny');
      expect(result.platform).toBe('kalshi');
      expect(result.id).toBe('KXHIGHNY'); // Ensure it uppercases Kalshi tickers
    });

    it('correctly parses a raw Kalshi ticker', () => {
      const result = extractIdentifier('INX-24');
      expect(result.platform).toBe('kalshi');
      expect(result.id).toBe('INX-24');
    });

    it('correctly parses a raw Polymarket slug', () => {
      const result = extractIdentifier('some-event-slug');
      expect(result.platform).toBe('polymarket');
      expect(result.id).toBe('some-event-slug');
    });
  });

  describe('resolveMarket()', () => {
    it('successfully fetches and normalizes a Polymarket event', async () => {
      const mockPolyResponse = [
        {
          id: '12345',
          title: 'Will Trump win?',
          category: 'Politics',
          volume: 1000000,
          image: 'https://img.com/trump.png',
          markets: [
            { outcomePrices: '["0.60", "0.40"]' }
          ]
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPolyResponse,
      });

      const market = await resolveMarket('https://polymarket.com/event/will-trump-win');
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://gamma-api.polymarket.com/events?slug=will-trump-win',
        expect.any(Object)
      );
      
      expect(market).not.toBeNull();
      expect(market?.platform).toBe('Polymarket');
      expect(market?.title).toBe('Will Trump win?');
      expect(market?.yesPrice).toBe(0.60);
      expect(market?.noPrice).toBe(0.40);
    });

    it('successfully fetches and normalizes a Kalshi event', async () => {
      const mockKalshiResponse = {
        market: {
          ticker: 'KXHIGHNY',
          title: 'High temperature in NY?',
          category: 'Weather',
          volume: 5000,
          yes_ask: 45, // cents
          no_ask: 55, // cents
          image_url: '/weather.png'
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockKalshiResponse,
      });

      const market = await resolveMarket('https://kalshi.com/markets/kxhighny');
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://external-api.kalshi.com/trade-api/v2/margin/markets/KXHIGHNY',
        expect.any(Object)
      );
      
      expect(market).not.toBeNull();
      expect(market?.platform).toBe('Kalshi');
      expect(market?.title).toBe('High temperature in NY?');
      expect(market?.yesPrice).toBe(0.45); // Should convert cents to float
      expect(market?.noPrice).toBe(0.55);
    });

    it('returns null if the API returns a 404 or fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      const market = await resolveMarket('invalid-ticker-123');
      expect(market).toBeNull();
    });
  });
});
