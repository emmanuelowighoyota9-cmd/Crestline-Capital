import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const cards = await prisma.card.findMany({ where: { userId: session.userId }, orderBy: { createdAt: 'desc' } });
    const safeCards = cards.map(card => ({ ...card, cardNumber: `.... .... .... ${card.lastFour}`, cvv: '...', pinHash: undefined }));
    return NextResponse.json({ cards: safeCards });
  } catch (error) { console.error('Get cards error:', error); return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}
