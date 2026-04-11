import { NextResponse } from 'next/server';
import { addSubmission, notifyNewSubmission } from '@/app/api/prompts/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title, category, description, prompt_text, tools, setup_steps, trigger, alert,
      is_change_idea, original_prompt_id, proposed_change
    } = body;

    const ip = request.headers.get('x-forwarded-for') || 'anonymous';

    // Validate based on type
    if (is_change_idea) {
      if (!original_prompt_id || !proposed_change) {
        return NextResponse.json({ error: 'original_prompt_id and proposed_change are required for change ideas' }, { status: 400 });
      }
    } else {
      if (!title || !category || !prompt_text) {
        return NextResponse.json({ error: 'title, category, and prompt_text are required' }, { status: 400 });
      }
    }

    const submission = addSubmission({
      title, category, description, prompt_text, tools, setup_steps, trigger, alert,
      submitter_ip: ip,
      is_change_idea: is_change_idea || false,
      original_prompt_id: original_prompt_id || null,
      proposed_change: proposed_change || '',
    });

    // Fire Telegram notification async (don't block the response)
    notifyNewSubmission(submission).catch(() => {});

    if (is_change_idea) {
      return NextResponse.json({ message: 'Change idea submitted! Kevin will review it shortly.', id: submission.id });
    }
    return NextResponse.json({ message: 'Submitted! Kevin will review it shortly.', id: submission.id });
  } catch (error) {
    console.error('POST /api/prompts/submit error:', error);
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 });
  }
}
