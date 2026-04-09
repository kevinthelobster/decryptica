import { NextResponse } from 'next/server';
import { getPendingSubmissions } from '@/app/api/prompts/db';
import { cookies } from 'next/headers';

const ADMIN_PASSWORD = process.env.PROMpts_ADMIN_PASSWORD || 'kevin123';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('prompts_admin');

    if (adminSession?.value !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const submissions = getPendingSubmissions();
    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('GET /api/prompts/admin error:', error);
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
  }
}
