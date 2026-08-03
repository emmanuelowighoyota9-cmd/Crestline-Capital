export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';
import { requireAuth } from '../../../lib/auth';

export async function POST(request: NextRequest, { params }: { params: { action: string } }) {
  try {
    const session = await requireAuth();
    const { action } = params;
    const { cardId } = await request.json();
    if (!cardId) return NextResponse.json({ error: 'Card ID required' }, { status: 400 });
    const card = await prisma.card.findFirst({ where: { id: cardId, userId: session.userId } });
    if (!card) return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    if (action === 'freeze') {
      await prisma.card.update({ where: { id: cardId }, data: { status: 'frozen' } });
      await prisma.securityLog.create({ data: { userId: session.userId, event: 'card_frozen', details: JSON.stringify({ cardId, lastFour: card.lastFour }), severity: 'warning' } });
      return NextResponse.json({ success: true, message: 'Card frozen successfully' });
    }
    if (action === 'unfreeze') {
      await prisma.card.update({ where: { id: cardId }, data: { status: 'active' } });
      await prisma.securityLog.create({ data: { userId: session.userId, event: 'card_unfrozen', details: JSON.stringify({ cardId, lastFour: card.lastFour }), severity: 'info' } });
      return NextResponse.json({ success: true, message: 'Card unfrozen successfully' });
    }
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) { if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); console.error('Card action error:', error); return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}
