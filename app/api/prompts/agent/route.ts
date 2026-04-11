import { NextResponse } from 'next/server';
import { getPendingSubmissions, approveSubmission, rejectSubmission, getPromptById } from '@/app/api/prompts/db';

// Authorized agent IDs (Kevin OpenClaw agent)
const AUTHORIZED_AGENTS = ['main', 'Kevin', 'kevin'];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agent') || '';
    const action = searchParams.get('action');
    const submissionId = searchParams.get('id');

    // Auth check - in production, verify agent signature/token
    // For now, allow if agent param is present
    if (!AUTHORIZED_AGENTS.includes(agentId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (action === 'pending') {
      const submissions = getPendingSubmissions();
      // Enrich with original prompt data for change ideas
      const enriched = submissions.map(sub => {
        if (sub.is_change_idea && sub.original_prompt_id) {
          const original = getPromptById(sub.original_prompt_id);
          return { ...sub, original_prompt: original };
        }
        return sub;
      });
      return NextResponse.json({ submissions: enriched });
    }

    if (action === 'approve' && submissionId) {
      const result = approveSubmission(Number(submissionId));
      if (!result) {
        return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, result });
    }

    if (action === 'reject' && submissionId) {
      rejectSubmission(Number(submissionId));
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action. Use ?action=pending|approve&id=<id>|reject&id=<id>&agent=Kevin' });
  } catch (error) {
    console.error('GET /api/prompts/agent error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
