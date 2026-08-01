import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await requireAdmin();
    const users = await prisma.user.findMany({ select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true, status: true, kycStatus: true, twoFactorEnabled: true, createdAt: true, _count: { select: { accounts: true, cards: true } } }, orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ users });
  } catch (error: any) { if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); console.error('Admin users error:', error); return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const { userId, action } = await request.json();
    if (!userId || !action) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (action === 'suspend') { await prisma.user.update({ where: { id: userId }, data: { status: 'suspended' } }); await prisma.auditLog.create({ data: { adminId: admin.userId, action: 'suspend_user', targetUserId: userId } }); }
    else if (action === 'reactivate') { await prisma.user.update({ where: { id: userId }, data: { status: 'active' } }); await prisma.auditLog.create({ data: { adminId: admin.userId, action: 'reactivate_user', targetUserId: userId } }); }
    else if (action === 'kyc_approve') { await prisma.user.update({ where: { id: userId }, data: { kycStatus: 'verified' } }); await prisma.auditLog.create({ data: { adminId: admin.userId, action: 'kyc_approve', targetUserId: userId } }); }
    else if (action === 'kyc_reject') { await prisma.user.update({ where: { id: userId }, data: { kycStatus: 'rejected' } }); await prisma.auditLog.create({ data: { adminId: admin.userId, action: 'kyc_reject', targetUserId: userId } }); }
    else return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (error: any) { if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); console.error('Admin user action error:', error); return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}
