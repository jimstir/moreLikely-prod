import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { walletAddress, marketId, query, marketDetails } = await req.json();

    if (!walletAddress || !marketId) {
      return NextResponse.json({ error: 'Missing walletAddress or marketId' }, { status: 400 });
    }

    // Lookup wallet
    const wallet = await prisma.wallet.findUnique({
      where: { address: walletAddress.toLowerCase() }
    });

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    // Save to InsightMemory
    // In full implementation, llmSummary comes from 0G response
    await prisma.insightMemory.create({
      data: {
        walletId: wallet.id,
        marketId,
        userQuestion: query || 'Unknown Query',
        llmSummary: 'Placeholder summary from LLM'
      }
    });

    // Dynamic Upsert Check for Market and UserEngagement
    let marketRecord = await prisma.market.findUnique({ where: { externalId: marketId } });
    if (!marketRecord && marketDetails) {
      const isClosed = new Date(marketDetails.endDate) < new Date();
      if (!isClosed) {
        marketRecord = await prisma.market.create({
          data: {
            externalId: marketId,
            platform: marketDetails.platform || 'Unknown',
            title: marketDetails.title || 'Unknown Title',
            subtitle: marketDetails.subtitle || null,
            url: marketDetails.url || null,
          }
        });
      }
    }

    // Only update UserEngagement if Market exists
    if (marketRecord) {
      await prisma.userEngagement.upsert({
        where: {
          walletId_marketId: {
            walletId: wallet.id,
            marketId: marketRecord.id
          }
        },
        update: {
          insightsCount: { increment: 1 },
          lastInteraction: new Date(),
        },
        create: {
          walletId: wallet.id,
          marketId: marketRecord.id,
          insightsCount: 1,
          interactionType: 'insight'
        }
      });
    }

    // In a full implementation, we'd invoke 0g-compute-ts-sdk here.
    return NextResponse.json({
      success: true,
      message: `Interaction logged for ${marketId}. 0G Inference processing query: "${query}"`
    });
  } catch (error) {
    console.error('Insights API error:', error);
    return NextResponse.json({ error: 'Failed to log insight interaction' }, { status: 500 });
  }
}
