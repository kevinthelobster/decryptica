import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { MissingSecretError, requireSecret } from '@/app/lib/server-secrets';

// Simple in-memory rate limiter
// For Vercel serverless: this resets on each cold start, so it's a best-effort demo
// For real production, use Vercel Edge Config or KV store
const RATE_LIMIT_STORE = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

function isLocked(ip: string): boolean {
  const record = RATE_LIMIT_STORE.get(ip);
  if (!record) return false;
  if (Date.now() > record.resetAt) {
    RATE_LIMIT_STORE.delete(ip);
    return false;
  }
  return true;
}

function recordFailure(ip: string): void {
  const record = RATE_LIMIT_STORE.get(ip);
  if (record) {
    record.count++;
  } else {
    RATE_LIMIT_STORE.set(ip, { count: 1, resetAt: Date.now() + LOCKOUT_MS });
  }
}

function recordSuccess(ip: string): void {
  RATE_LIMIT_STORE.delete(ip);
}

export async function POST(request: Request) {
  try {
    const adminPassword = requireSecret('PROMPTS_ADMIN_PASSWORD');
    const ip = request.headers.get('x-forwarded-for') || 
                request.headers.get('x-real-ip') || 
                'anonymous';

    if (isLocked(ip)) {
      return NextResponse.json(
        { error: 'Too many failed attempts. Please try again in 15 minutes.' },
        { status: 429 }
      );
    }

    const { password } = await request.json();

    if (password !== adminPassword) {
      recordFailure(ip);
      const record = RATE_LIMIT_STORE.get(ip);
      const remaining = record ? MAX_ATTEMPTS - record.count : MAX_ATTEMPTS;
      return NextResponse.json(
        { error: 'Invalid password', remaining: Math.max(0, remaining) },
        { status: 401 }
      );
    }

    recordSuccess(ip);

    const cookieStore = await cookies();
    cookieStore.set('prompts_admin', adminPassword, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof MissingSecretError) {
      return NextResponse.json({ error: 'Admin auth is not configured' }, { status: 503 });
    }
    console.error('POST /api/prompts/admin/login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
