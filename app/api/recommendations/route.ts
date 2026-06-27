import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchKalshiMarkets } from '@/lib/kalshi';
import { fetchPolymarketEvents } from '@/lib/polymarket';
import { curateRecommendations } from '@/lib/agent';

export async function POST(req: Request) {
  try {
    const { walletAddress, platform, queueNumber } = await req.json();

    if (!walletAddress) {
      return NextResponse.json({ error: 'Missing walletAddress' }, { status: 400 });
    }

    // Lookup wallet
    const wallet = await prisma.wallet.findUnique({
      where: { address: walletAddress.toLowerCase() },
      include: { profile: true }
    });

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    // Security Check: Enforce Premium Tier for Recommendations
    if (wallet.tier === 'free') {
      return NextResponse.json({ error: 'Unauthorized. Premium tier required for AI recommendations.' }, { status: 403 });
    }

    // 1. Fetch raw markets based on platform
    let allMarkets = [];
    if (platform === 'polymarket') {
      allMarkets = await fetchPolymarketEvents();
    } else if (platform === 'kalshi') {
      allMarkets = await fetchKalshiMarkets();
    } else {
      const kalshiMarkets = await fetchKalshiMarkets();
      const polyMarkets = await fetchPolymarketEvents();
      allMarkets = [...kalshiMarkets, ...polyMarkets];
    }

    const profile = wallet.profile;

    // Cold Start Check
    const hasPreferences = profile && (profile.categories !== '' || profile.tags !== '');
    if (!hasPreferences) {
      // First Request (Cold Start): Bypass AI, load Popular/Trending directly
      return NextResponse.json({
        recommendations: allMarkets.slice(0, 10).map((m: any) => ({
          marketId: m.id || m.ticker,
          title: m.title || m.question,
          rationale: "Popular market. Add preferences to personalize your list.",
          dislikeOptions: ["Not interested", "Too broad", "Seen it"]
        })),
        suggestedPreferences: ["Politics", "Crypto", "Pop Culture"],
        nextQueueNumber: (queueNumber || 0) + 10
      });
    }

    // 3. AI Curation
    const sliceStart = queueNumber || 0;
    const sliceEnd = sliceStart + 15;
    const candidates = allMarkets.slice(sliceStart, sliceEnd);

    // Provide previous dislikes to LLM (for negative feedback filtering)
    const dislikes = await prisma.userEngagement.findMany({
      where: { walletId: wallet.id, interactionType: 'dislike', feedbackText: { not: null } },
      select: { feedbackText: true }
    });
    const negativeFeedback = dislikes.map(d => d.feedbackText);

    // Call Agent
    const result = await curateRecommendations({
      candidates,
      preferences: profile,
      negativeFeedback
    });

    // Handle Mock agent response gracefully
    const recommendations = Array.isArray(result) ? result : (result.recommendations || []);

    return NextResponse.json({
      recommendations,
      nextQueueNumber: sliceEnd
    });
  } catch (error) {
    console.error('Recommendations API error:', error);
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
  }
}
