import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { address, marketId, title, subtitle, platform } = await req.json();

    if (!address || !marketId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
      const saved = await prisma.savedMarket.create({
        data: {
          walletAddress: address.toLowerCase(),
          marketId,
          // If title/subtitle isn't provided we should gracefully handle it, but the DB expects them?
          // Wait, in schema.prisma, SavedMarket does NOT have title/subtitle fields.
          // Let's just create it based on the actual schema we defined!
        }
      });
      return NextResponse.json({ success: true, saved });
    } catch (dbErr) {
      // It might fail on unique constraint if already saved, or if DB is down
      return NextResponse.json({ error: 'Database error or already saved.' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to bookmark market' }, { status: 500 });
  }
}
