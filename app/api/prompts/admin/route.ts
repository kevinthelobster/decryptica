import { NextResponse } from 'next/server';
import { getPendingSubmissions, getPrompts } from '@/app/api/prompts/db';
import { cookies } from 'next/headers';

const ADMIN_PASSWORD = process.env.PROMPTS_ADMIN_PASSWORD || 'kevin123';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('prompts_admin');

    if (adminSession?.value !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }


    const { searchParams } = new URL(request.url);
    const approveId = searchParams.get('approve');

    if (approveId) {
      const { approveSubmission } = await import('@/app/api/prompts/db');
      const result = approveSubmission(Number(approveId));
      if (!result) {
        return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, result });
    }

    const submissions = getPendingSubmissions();
    const prompts = getPrompts();
    return NextResponse.json({ submissions, prompts });
  } catch (error) {
    console.error('GET /api/prompts/admin error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
