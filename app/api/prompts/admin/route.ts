import { NextResponse } from 'next/server';
import { getPendingSubmissions, getPrompts } from '@/app/api/prompts/db';
import { cookies } from 'next/headers';
import { MissingSecretError, requireSecret } from '@/app/lib/server-secrets';

export async function GET(request: Request) {
  try {
    const adminPassword = requireSecret('PROMPTS_ADMIN_PASSWORD');
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('prompts_admin');

    if (adminSession?.value !== adminPassword) {
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
    if (error instanceof MissingSecretError) {
      return NextResponse.json({ error: 'Admin auth is not configured' }, { status: 503 });
    }
    console.error('GET /api/prompts/admin error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
