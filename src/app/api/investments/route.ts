export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const portfolios = await prisma.investmentPortfolio.findMany({ where: { userId: session.userId }, orderBy: { createdAt: 'desc' } });
    const parsed = portfolios.map(p => ({ ...p, assetAllocation: JSON.parse(p.assetAllocation) }));
    return NextResponse.json({ portfolios: parsed });
  } catch (error) { console.error('Get investments error:', error); return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}
