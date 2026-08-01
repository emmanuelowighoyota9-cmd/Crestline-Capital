import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { createToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, phone } = await request.json();
    if (!email || !password || !firstName || !lastName) return NextResponse.json({ error: 'All required fields must be provided' }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { email, passwordHash, firstName, lastName, phone: phone || null, role: 'user', status: 'active', kycStatus: 'pending' } });
    const accountNumber = Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join('');
    await prisma.account.create({ data: { userId: user.id, accountNumber, accountType: 'checking', balance: 0, currency: 'USD', status: 'active' } });
    const payload = { userId: user.id, email: user.email, role: user.role };
    const token = await createToken(payload);
    await prisma.session.create({ data: { userId: user.id, token, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) } });
    const response = NextResponse.json({ user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, status: user.status, kycStatus: user.kycStatus, twoFactorEnabled: user.twoFactorEnabled } }, { status: 201 });
    response.cookies.set('crestline_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 24 * 60 * 60, path: '/' });
    return response;
  } catch (error) { console.error('Register error:', error); return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}
