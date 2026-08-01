import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession, requireAuth } from '@/lib/auth';
import { generateReference } from '@/lib/utils';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const accounts = await prisma.account.findMany({ where: { userId: session.userId }, select: { id: true } });
    const accountIds = accounts.map(a => a.id);
    const transactions = await prisma.transaction.findMany({ where: { OR: [{ fromAccountId: { in: accountIds } }, { toAccountId: { in: accountIds } }] }, include: { fromAccount: { select: { accountNumber: true, accountType: true } }, toAccount: { select: { accountNumber: true, accountType: true } } }, orderBy: { createdAt: 'desc' }, take: 50 });
    return NextResponse.json({ transactions });
  } catch (error) { console.error('Get transactions error:', error); return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { fromAccountId, toAccountNumber, amount, description } = await request.json();
    if (!fromAccountId || !toAccountNumber || !amount) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    if (amount <= 0) return NextResponse.json({ error: 'Amount must be positive' }, { status: 400 });
    const sourceAccount = await prisma.account.findFirst({ where: { id: fromAccountId, userId: session.userId, status: 'active' } });
    if (!sourceAccount) return NextResponse.json({ error: 'Source account not found or inactive' }, { status: 404 });
    if (sourceAccount.balance < amount) return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 });
    const destAccount = await prisma.account.findFirst({ where: { accountNumber: toAccountNumber, status: 'active' }, include: { user: { select: { firstName: true, lastName: true } } } });
    if (!destAccount) return NextResponse.json({ error: 'Destination account not found' }, { status: 404 });
    if (destAccount.id === fromAccountId) return NextResponse.json({ error: 'Cannot transfer to the same account' }, { status: 400 });
    const reference = generateReference();
    await prisma.$transaction(async (tx) => {
      await tx.account.update({ where: { id: fromAccountId }, data: { balance: { decrement: amount } } });
      await tx.account.update({ where: { id: destAccount.id }, data: { balance: { increment: amount } } });
      await tx.transaction.create({ data: { fromAccountId, toAccountId: destAccount.id, type: 'transfer', amount, description: description || `Transfer to ${destAccount.user.firstName}`, reference, status: 'completed' } });
    });
    return NextResponse.json({ success: true, reference }, { status: 201 });
  } catch (error: any) { if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); console.error('Transfer error:', error); return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}
