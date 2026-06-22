import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { address, marketId, query } = await req.json();

    if (!address || !marketId) {
      return NextResponse.json({ error: 'Missing address or marketId' }, { status: 400 });
    }

    // Log the interaction
    await prisma.userEngagement.upsert({
      where: {
        walletAddress_marketId: {
          walletAddress: address.toLowerCase(),
          marketId
        }
      },
      update: {
        insightsCount: { increment: 1 }
      },
      create: {
        walletAddress: address.toLowerCase(),
        marketId,
        insightsCount: 1
      }
    });

    // In a full implementation, we'd invoke 0g-compute-ts-sdk here.
    // For now, return a placeholder response indicating successful log.
    return NextResponse.json({
      success: true,
      message: `Interaction logged for ${marketId}. 0G Inference processing query: "${query}"`
    });
  } catch (error) {
    console.error('Insights API error:', error);
    return NextResponse.json({ error: 'Failed to log insight interaction' }, { status: 500 });
  }
}
