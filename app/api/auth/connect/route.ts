import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { address, email } = await req.json();

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    const walletAddress = address.toLowerCase();

    // Upsert wallet
    const wallet = await prisma.wallet.upsert({
      where: { address: walletAddress },
      update: {
        // Only update email if provided and not currently set (or allow override)
        ...(email ? { email } : {})
      },
      create: {
        address: walletAddress,
        email: email || null,
        tier: 'free' // Default tier
      }
    });

    // Ensure profile exists
    let profile = await prisma.profile.findUnique({
      where: { walletId: wallet.id }
    });

    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          walletId: wallet.id,
        }
      });
    }

    return NextResponse.json({ success: true, wallet, profile });
  } catch (error) {
    console.error('Wallet connection API error:', error);
    return NextResponse.json({ error: 'Failed to connect wallet' }, { status: 500 });
  }
}
