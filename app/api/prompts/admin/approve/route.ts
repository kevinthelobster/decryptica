import { NextResponse } from 'next/server';
import { approveSubmission } from '@/app/api/prompts/db';
import { cookies } from 'next/headers';
import { MissingSecretError, requireSecret } from '@/app/lib/server-secrets';

export async function POST(request: Request) {
  try {
    const adminPassword = requireSecret('PROMPTS_ADMIN_PASSWORD');
    const cookieStore = await cookies();
    if (cookieStore.get('prompts_admin')?.value !== adminPassword) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { submission_id } = await request.json();
    if (!submission_id) {
      return NextResponse.json({ error: 'submission_id required' }, { status: 400 });
    }

    const slug = approveSubmission(submission_id);
    if (!slug) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, slug });
  } catch (error) {
    if (error instanceof MissingSecretError) {
      return NextResponse.json({ error: 'Admin auth is not configured' }, { status: 503 });
    }
    console.error('POST /api/prompts/admin/approve error:', error);
    return NextResponse.json({ error: 'Failed to approve' }, { status: 500 });
  }
}
