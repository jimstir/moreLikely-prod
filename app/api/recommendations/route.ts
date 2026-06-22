import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchKalshiMarkets } from '@/lib/kalshi';
import { fetchPolymarketEvents } from '@/lib/polymarket';
import { curateRecommendations } from '@/lib/agent';

export async function POST(req: Request) {
  try {
    const { address } = await req.json();

    // 1. Fetch raw markets
    const kalshiMarkets = await fetchKalshiMarkets();
    const polyMarkets = await fetchPolymarketEvents();
    const allMarkets = [...kalshiMarkets, ...polyMarkets];

    // 2. Fetch User Profile
    let profile = null;
    if (address) {
      try {
        profile = await prisma.profile.findUnique({
          where: { walletAddress: address.toLowerCase() }
        });
      } catch (dbErr) {
        console.warn("Database connection failed, using default profile.");
      }
    }

    // Default profile if not connected or not found
    if (!profile) {
      profile = { explicitInterests: { politics: 1, crypto: 1, macro: 1 }, marketSettings: {} };
    }

    // 3. AI Curation
    const recommendations = await curateRecommendations(allMarkets.slice(0, 50), profile); // Limit to top 50 for cost/speed

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('Recommendations API error:', error);
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
  }
}
