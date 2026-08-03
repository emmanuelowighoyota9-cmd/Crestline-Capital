export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/db';
import { requireAuth } from '../../lib/auth';

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { firstName, lastName, phone, currentPassword, newPassword } = await request.json();
    if (currentPassword && newPassword) {
      const user = await prisma.user.findUnique({ where: { id: session.userId } });
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
      const valid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      if (newPassword.length < 8) return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });
      const newHash = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({ where: { id: session.userId }, data: { passwordHash: newHash } });
      await prisma.securityLog.create({ data: { userId: session.userId, event: 'password_changed', severity: 'warning' } });
      return NextResponse.json({ success: true, message: 'Password updated' });
    }
    const data: Record<string, string> = {};
    if (firstName) data.firstName = firstName;
    if (lastName) data.lastName = lastName;
    if (phone !== undefined) data.phone = phone;
    if (Object.keys(data).length > 0) await prisma.user.update({ where: { id: session.userId }, data });
    return NextResponse.json({ success: true, message: 'Profile updated' });
  } catch (error: any) { if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); console.error('Update user error:', error); return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}
