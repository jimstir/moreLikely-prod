import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { walletAddress, marketId, marketDetails } = await req.json();

    if (!walletAddress || !marketId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Lookup wallet
    const wallet = await prisma.wallet.findUnique({
      where: { address: walletAddress.toLowerCase() }
    });

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    // Dynamic Upsert Check (Always upsert if explicitly bookmarking)
    let marketRecord = await prisma.market.findUnique({ where: { externalId: marketId } });
    if (!marketRecord && marketDetails) {
      marketRecord = await prisma.market.create({
        data: {
          externalId: marketId,
          platform: marketDetails.platform || 'Unknown',
          title: marketDetails.title || 'Unknown Title',
          subtitle: marketDetails.subtitle || null,
          url: marketDetails.url || null,
        }
      });
    } else if (!marketRecord && !marketDetails) {
      return NextResponse.json({ error: 'Market not found and no details provided to create it' }, { status: 400 });
    }

    try {
      const saved = await prisma.savedMarket.create({
        data: {
          walletId: wallet.id,
          marketId: marketRecord!.id,
        }
      });
      return NextResponse.json({ success: true, saved });
    } catch (dbErr) {
      // It might fail on unique constraint if already saved
      return NextResponse.json({ error: 'Market is already bookmarked.' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to bookmark market' }, { status: 500 });
  }
}
