import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { address, platform, categories, tags, customNewsSources } = await req.json();

    if (!address) {
      return NextResponse.json({ error: 'Missing address' }, { status: 400 });
    }

    try {
      const profile = await prisma.profile.upsert({
        where: { walletAddress: address.toLowerCase() },
        update: {
          categories: categories ? categories.split(',').map((s: string) => s.trim()) : [],
          tags: tags ? tags.split(',').map((s: string) => s.trim()) : [],
          customNewsSources: customNewsSources ? customNewsSources.split(',').map((s: string) => s.trim()) : [],
          // We don't have platform in Profile schema, but user stores it in localStorage usually
        },
        create: {
          walletAddress: address.toLowerCase(),
          categories: categories ? categories.split(',').map((s: string) => s.trim()) : [],
          tags: tags ? tags.split(',').map((s: string) => s.trim()) : [],
          customNewsSources: customNewsSources ? customNewsSources.split(',').map((s: string) => s.trim()) : [],
        }
      });
      return NextResponse.json({ success: true, profile });
    } catch (dbErr) {
      return NextResponse.json({ error: 'Database error while saving preferences.' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
  }
}
