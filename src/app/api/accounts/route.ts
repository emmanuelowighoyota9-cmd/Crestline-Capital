import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const accounts = await prisma.account.findMany({ where: { userId: session.userId }, orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ accounts });
  } catch (error) { console.error('Get accounts error:', error); return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}
