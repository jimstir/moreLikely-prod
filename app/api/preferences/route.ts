import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { address, platform, categories, tags, customNewsSources } = await req.json();

    if (!address) {
      return NextResponse.json({ error: 'Missing address' }, { status: 400 });
    }

    const wallet = await prisma.wallet.findUnique({
      where: { address: address.toLowerCase() }
    });

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    try {
      const profile = await prisma.profile.upsert({
        where: { walletId: wallet.id },
        update: {
          categories: categories || '',
          tags: tags || '',
          customNewsSources: customNewsSources || ''
        },
        create: {
          walletId: wallet.id,
          categories: categories || '',
          tags: tags || '',
          customNewsSources: customNewsSources || ''
        }
      });
      return NextResponse.json({ success: true, profile });
    } catch (dbErr) {
      console.error(dbErr);
      return NextResponse.json({ error: 'Database error while saving preferences.' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
  }
}
