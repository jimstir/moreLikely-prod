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
    const cached = await prisma.similarMarket.upsert({
      where: {
        marketAId_marketBId: {
          marketAId: marketA.id,
          marketBId: marketB.id
        }
      },
      update: {
        isMatch: matchResult.isMatch,
        confidence: matchResult.confidence,
        rationale: matchResult.rationale
      },
      create: {
        marketAId: marketA.id,
        marketBId: marketB.id,
        isMatch: matchResult.isMatch,
        confidence: matchResult.confidence,
        rationale: matchResult.rationale
      }
    });

    return NextResponse.json({ matchResult, cached });
  } catch (error) {
    console.error('Semantic match API error:', error);
    return NextResponse.json({ error: 'Failed to run semantic match' }, { status: 500 });
  }
}
