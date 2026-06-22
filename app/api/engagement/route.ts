import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { address, marketId, action, feedbackText } = await req.json();

    if (!address || !marketId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const validActions = ['click', 'view', 'like', 'dislike'];
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const updateData: any = { [action + 's']: { increment: 1 } };
    if (feedbackText) {
      updateData.feedbackText = feedbackText;
    }

    const engagement = await prisma.userEngagement.upsert({
      where: {
        walletAddress_marketId: {
          walletAddress: address.toLowerCase(),
          marketId
        }
      },
      update: updateData,
      create: {
        walletAddress: address.toLowerCase(),
        marketId,
        [action + 's']: 1,
        feedbackText: feedbackText || null
      }
    });

    // We can update Profile Score (interest, engagement, skill) async here based on the predict-insights logic
    // ...

    return NextResponse.json({ success: true, engagement });
  } catch (error) {
    console.error('Engagement API error:', error);
    return NextResponse.json({ error: 'Failed to record engagement' }, { status: 500 });
  }
}
