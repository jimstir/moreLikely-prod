export interface MarketItem {
  id: string;
  marketId: string;
  title: string;
  subtitle: string;
  rationale: string;
  yesPrice: number;
  noPrice: number;
  liquidity: number;
  category?: string;
  subCategory?: string[];
  resolutionDate?: number;
  platform: 'kalshi' | 'polymarket';
  dislikeOptions?: string[];
}
