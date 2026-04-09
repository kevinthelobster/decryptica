import { NextResponse } from 'next/server';
import { approveSubmission } from '@/app/api/prompts/db';
import { cookies } from 'next/headers';

const ADMIN_PASSWORD = process.env.PROMpts_ADMIN_PASSWORD || 'kevin123';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    if (cookieStore.get('prompts_admin')?.value !== ADMIN_PASSWORD) {
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
    console.error('POST /api/prompts/admin/approve error:', error);
    return NextResponse.json({ error: 'Failed to approve' }, { status: 500 });
  }
}
