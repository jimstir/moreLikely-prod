import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { walletAddress, marketId, type, feedbackText, marketDetails } = body;

    if (!walletAddress || !marketId || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const validActions = ['click', 'view', 'like', 'dislike'];
    if (!validActions.includes(type)) {
      return NextResponse.json({ error: 'Invalid interaction type' }, { status: 400 });
    }

    // Lookup wallet
    const wallet = await prisma.wallet.findUnique({
      where: { address: walletAddress.toLowerCase() }
    });

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    // Dynamic Upsert Check
    // If marketDetails are provided, we check if market is Open.
    // If it's Closed AND user is not bookmarking, we don't save the market.
    // Wait, engagement API doesn't handle bookmarks (that's /api/bookmark or similar).
    // So for clicks/likes/dislikes, if closed, we skip DB write unless market already exists.
    let marketRecord = await prisma.market.findUnique({ where: { externalId: marketId } });
    
    if (!marketRecord && marketDetails) {
      const isClosed = new Date(marketDetails.endDate) < new Date();
      if (!isClosed) {
        // Upsert Market
        marketRecord = await prisma.market.create({
          data: {
            externalId: marketId,
            platform: marketDetails.platform || 'Unknown',
            title: marketDetails.title || 'Unknown Title',
            subtitle: marketDetails.subtitle || null,
            url: marketDetails.url || null,
          }
        });
      } else {
        // Closed and not bookmarked (since it's engagement), don't save
        return NextResponse.json({ success: true, message: 'Skipped closed market engagement' });
      }
    } else if (!marketRecord && !marketDetails) {
      // Cannot create market without details
      return NextResponse.json({ error: 'Market not found and no details provided' }, { status: 400 });
    }

    const updateData: any = {
      interactionType: type,
      lastInteraction: new Date(),
    };
    if (type === 'click' || type === 'view') {
      updateData.clickCount = { increment: 1 };
    }
    if (feedbackText) {
      updateData.feedbackText = feedbackText;
    }

    const engagement = await prisma.userEngagement.upsert({
      where: {
        walletId_marketId: {
          walletId: wallet.id,
          marketId: marketRecord!.id
        }
      },
      update: updateData,
      create: {
        walletId: wallet.id,
        marketId: marketRecord!.id,
        clickCount: (type === 'click' || type === 'view') ? 1 : 0,
        interactionType: type,
        feedbackText: feedbackText || null
      }
    });

    return NextResponse.json({ success: true, engagement });
  } catch (error) {
    console.error('Engagement API error:', error);
    return NextResponse.json({ error: 'Failed to record engagement' }, { status: 500 });
  }
}
