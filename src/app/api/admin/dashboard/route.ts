export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';
import { requireAdmin } from '../../../lib/auth';

export async function GET() {
  try {
    await requireAdmin();
    const [totalUsers, activeUsers, suspendedUsers, totalAccounts, totalDeposits, recentTransactions, kycPending, totalCards] = await Promise.all([
      prisma.user.count(), prisma.user.count({ where: { status: 'active' } }), prisma.user.count({ where: { status: 'suspended' } }),
      prisma.account.count(), prisma.account.aggregate({ _sum: { balance: true } }),
      prisma.transaction.count({ where: { createdAt: { gte: new Date(Date.now() - 7*24*60*60*1000) } } }),
      prisma.user.count({ where: { kycStatus: 'pending' } }), prisma.card.count()
    ]);
    const metrics = { totalUsers, activeUsers, suspendedUsers, kycPending, totalAccounts, totalCards, totalDeposits: totalDeposits._sum.balance || 0, weeklyTransactions: recentTransactions };
    return NextResponse.json({ metrics });
  } catch (error: any) { if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); console.error('Admin dashboard error:', error); return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}
