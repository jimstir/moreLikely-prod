import { NextResponse } from 'next/server';
import { getMarketSemanticMatches } from '@/lib/agent';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { marketA, marketB } = await req.json();

    if (!marketA || !marketB) {
      return NextResponse.json({ error: 'Two markets required' }, { status: 400 });
    }

    // 1. Ask Gemini to classify
    const matchResult = await getMarketSemanticMatches(marketA, marketB);

    // 2. Cache result
    let cached = await prisma.similarMarket.findFirst({
      where: {
        marketIId: marketA.id,
        marketJId: marketB.id
      }
    });

    if (cached) {
      cached = await prisma.similarMarket.update({
        where: { id: cached.id },
        data: {
          confidence: matchResult.confidence,
          rationale: matchResult.rationale
        }
      });
    } else {
      cached = await prisma.similarMarket.create({
        data: {
          marketIId: marketA.id,
          marketJId: marketB.id,
          confidence: matchResult.confidence,
          rationale: matchResult.rationale
        }
      });
    }

    return NextResponse.json({ matchResult, cached });
  } catch (error) {
    console.error('Semantic match API error:', error);
    return NextResponse.json({ error: 'Failed to run semantic match' }, { status: 500 });
  }
}
