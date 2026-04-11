import { NextResponse } from 'next/server';
import { getPendingSubmissions, getPrompts } from '@/app/api/prompts/db';
import { cookies } from 'next/headers';

const ADMIN_PASSWORD = process.env.PROMPTS_ADMIN_PASSWORD || 'kevin123';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('prompts_admin');

    if (adminSession?.value !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const submissions = getPendingSubmissions();
    const prompts = getPrompts();
    return NextResponse.json({ submissions, prompts });
  } catch (error) {
    console.error('GET /api/prompts/admin error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
