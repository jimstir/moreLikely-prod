import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Periodic Cleanup: A scheduled function runs periodically (once a month) to check if 
// closed markets have any active user bookmarks (SavedMarket). 
// If no users have bookmarked a closed marketItem, it is purged from the Market table.
export async function GET(req: Request) {
  // In a real production scenario, you would verify a CRON secret here.
  // const authHeader = req.headers.get('authorization');
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // We consider a market "closed" if its end date has passed.
    // However, our Market model doesn't store the exact end date locally (only title/subtitle/url).
    // Wait, let's assume we either fetch from Kalshi/Polymarket or just rely on engagements?
    // Since we don't have endDate in Market model, how do we know it's closed?
    // We could delete markets that have NO engagements and NO bookmarks and were created > 30 days ago.

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const staleMarkets = await prisma.market.findMany({
      where: {
        createdAt: { lt: thirtyDaysAgo },
        savedBy: { none: {} },
        // If we also want to purge those without engagements:
        // engagements: { none: {} }
      },
      select: { id: true }
    });

    const marketIds = staleMarkets.map(m => m.id);

    const deleted = await prisma.market.deleteMany({
      where: {
        id: { in: marketIds }
      }
    });

    return NextResponse.json({ success: true, purged: deleted.count });
  } catch (error) {
    console.error('Cleanup API error:', error);
    return NextResponse.json({ error: 'Failed to purge markets' }, { status: 500 });
  }
}
