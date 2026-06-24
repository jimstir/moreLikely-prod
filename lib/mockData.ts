import { MarketItem } from './types';

export const mockMarkets: MarketItem[] = [
  {
    id: "mock_1",
    marketId: "mock_1",
    title: "Will the Federal Reserve cut interest rates in June 2026?",
    subtitle: "Macro Economics",
    rationale: "Given your interest in Macro events and recent interactions with inflation-based markets, this is highly relevant.",
    yesPrice: 0.65,
    noPrice: 0.35,
    liquidity: 1500000,
    category: "Economics",
    platform: "kalshi",
    dislikeOptions: ["Too long term", "Not trading macro anymore", "Low confidence"]
  },
  {
    id: "mock_2",
    marketId: "mock_2",
    title: "Will Ethereum reach $5,000 by Q3 2026?",
    subtitle: "Crypto",
    rationale: "You have a strong 0.85 interest score in Crypto events. This market has high liquidity.",
    yesPrice: 0.42,
    noPrice: 0.58,
    liquidity: 4200000,
    category: "Crypto",
    platform: "polymarket",
    dislikeOptions: ["Too volatile", "Prefer Bitcoin markets", "Already heavily exposed"]
  },
  {
    id: "mock_3",
    marketId: "mock_3",
    title: "Who will win the 2026 Midterm Elections (Senate)?",
    subtitle: "Politics",
    rationale: "A mainstream political market. You follow US elections closely.",
    yesPrice: 0.51,
    noPrice: 0.49,
    liquidity: 850000,
    category: "Politics",
    platform: "kalshi",
    dislikeOptions: ["Don't trade politics", "Too far away", "Wait for better odds"]
  }
];

export const mockProfileStats = {
  totalPredictions: 12,
  winRate: "58%",
  insightsRequested: 34,
};

export const mockSimilarMarkets = [
  {
    id: "sm1",
    marketAId: "mock_1",
    marketBId: "Will ECB cut rates before the Fed?",
    isMatch: true,
    confidence: 0.88,
    rationale: "Both markets depend directly on central bank rate policies resolving around the same timeline."
  },
  {
    id: "sm2",
    marketAId: "mock_1",
    marketBId: "US CPI inflation below 2.5% in June?",
    isMatch: true,
    confidence: 0.76,
    rationale: "Inflation data directly impacts the Fed's decision to cut rates."
  }
];
