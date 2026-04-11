import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireSecret } from '@/app/lib/server-secrets';

export async function POST(request: Request) {
  try {
    const boardSecret = requireSecret('BOARD_SECRET');
    const { password } = await request.json();

    if (password !== boardSecret) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const cookieStore = await cookies();
    cookieStore.set('board_session', boardSecret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/seo/board-login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}