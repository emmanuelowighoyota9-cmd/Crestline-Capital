import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await requireAdmin();
    const [securityLogs, auditLogs] = await Promise.all([
      prisma.securityLog.findMany({ include: { user: { select: { email: true, firstName: true, lastName: true } } }, orderBy: { createdAt: 'desc' }, take: 100 }),
      prisma.auditLog.findMany({ include: { admin: { select: { email: true, firstName: true, lastName: true } } }, orderBy: { createdAt: 'desc' }, take: 100 })
    ]);
    const failedLogins = await prisma.securityLog.count({ where: { event: 'login_failed', createdAt: { gte: new Date(Date.now() - 24*60*60*1000) } } });
    return NextResponse.json({ securityLogs, auditLogs, failedLogins24h: failedLogins });
  } catch (error: any) { if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); console.error('Admin security error:', error); return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}
