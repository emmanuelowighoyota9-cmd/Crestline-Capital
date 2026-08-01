import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { generateReference } from '@/lib/utils';

export async function GET() {
  try {
    await requireAdmin();
    const transactions = await prisma.transaction.findMany({ include: { fromAccount: { select: { accountNumber: true, user: { select: { email: true, firstName: true, lastName: true } } } }, toAccount: { select: { accountNumber: true, user: { select: { email: true, firstName: true, lastName: true } } } } }, orderBy: { createdAt: 'desc' }, take: 100 });
    return NextResponse.json({ transactions });
  } catch (error: any) { if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); console.error('Admin transactions error:', error); return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const { action, accountId, amount, description } = await request.json();
    if (!accountId || !amount || !action) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    const account = await prisma.account.findUnique({ where: { id: accountId } });
    if (!account) return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    const reference = generateReference();
    if (action === 'credit') {
      await prisma.$transaction(async (tx) => { await tx.account.update({ where: { id: accountId }, data: { balance: { increment: amount } } }); await tx.transaction.create({ data: { toAccountId: accountId, type: 'admin_credit', amount, description: description || 'Admin credit', reference, status: 'completed', performedBy: admin.userId } }); });
      await prisma.auditLog.create({ data: { adminId: admin.userId, action: 'credit_account', targetAccountId: accountId, details: JSON.stringify({ amount, reference }) } });
    } else if (action === 'debit') {
      if (account.balance < amount) return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 });
      await prisma.$transaction(async (tx) => { await tx.account.update({ where: { id: accountId }, data: { balance: { decrement: amount } } }); await tx.transaction.create({ data: { fromAccountId: accountId, type: 'admin_debit', amount, description: description || 'Admin debit', reference, status: 'completed', performedBy: admin.userId } }); });
      await prisma.auditLog.create({ data: { adminId: admin.userId, action: 'debit_account', targetAccountId: accountId, details: JSON.stringify({ amount, reference }) } });
    } else return NextResponse.json({ error: 'Invalid action. Use credit or debit' }, { status: 400 });
    return NextResponse.json({ success: true, reference });
  } catch (error: any) { if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); console.error('Admin transaction error:', error); return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}
