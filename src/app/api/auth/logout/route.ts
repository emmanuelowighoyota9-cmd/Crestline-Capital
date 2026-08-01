export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const token = cookies().get('crestline_token')?.value;
    if (token) await prisma.session.deleteMany({ where: { token } });
    const response = NextResponse.json({ success: true });
    response.cookies.delete('crestline_token');
    return response;
  } catch (error) { console.error('Logout error:', error); return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}
