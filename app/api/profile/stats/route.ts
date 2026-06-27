import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'Address required' }, { status: 400 });
  }

  try {
    const wallet = await prisma.wallet.findUnique({
      where: { address: address.toLowerCase() },
      include: {
        engagements: true,
        savedMarkets: true
      }
    });

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    const totalClicks = wallet.engagements.reduce((sum, e) => sum + e.clickCount, 0);
    const totalInsights = wallet.engagements.reduce((sum, e) => sum + e.insightsCount, 0);
    const watchlisted = wallet.savedMarkets.length;

    return NextResponse.json({
      success: true,
      stats: {
        totalClicks,
        totalInsights,
        watchlisted
      }
    });
  } catch (error) {
    console.error('Profile stats API error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
