import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const marketId = searchParams.get('marketId');

  if (!marketId) {
    return NextResponse.json({ error: 'marketId required' }, { status: 400 });
  }

  try {
    const similar = await prisma.similarMarket.findMany({
      where: {
        OR: [
          { marketIId: marketId },
          { marketJId: marketId }
        ],
        confidence: { gte: 0.7 }
      },
      orderBy: { confidence: 'desc' }
    });

    return NextResponse.json({ similar });
  } catch (error) {
    console.error('Similar markets API error:', error);
    return NextResponse.json({ error: 'Failed to fetch similar markets' }, { status: 500 });
  }
}
