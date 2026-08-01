import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { createToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    if (user.status === 'suspended') return NextResponse.json({ error: 'Account is suspended. Contact support.' }, { status: 403 });
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      await prisma.securityLog.create({ data: { userId: user.id, event: 'login_failed', ipAddress: request.headers.get('x-forwarded-for') || 'unknown', userAgent: request.headers.get('user-agent') || 'unknown', severity: 'warning' } });
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    const payload = { userId: user.id, email: user.email, role: user.role };
    const token = await createToken(payload);
    await prisma.session.create({ data: { userId: user.id, token, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) } });
    await prisma.securityLog.create({ data: { userId: user.id, event: 'login_success', ipAddress: request.headers.get('x-forwarded-for') || 'unknown', userAgent: request.headers.get('user-agent') || 'unknown', severity: 'info' } });
    const response = NextResponse.json({ user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, status: user.status, kycStatus: user.kycStatus, twoFactorEnabled: user.twoFactorEnabled } });
    response.cookies.set('crestline_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 24 * 60 * 60, path: '/' });
    return response;
  } catch (error) { console.error('Login error:', error); return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}
