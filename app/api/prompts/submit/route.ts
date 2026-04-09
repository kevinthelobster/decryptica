import { NextResponse } from 'next/server';
import { addSubmission } from '@/app/api/prompts/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, category, description, prompt_text, tools, setup_steps, trigger, alert } = body;

    if (!title || !category || !prompt_text) {
      return NextResponse.json({ error: 'title, category, and prompt_text are required' }, { status: 400 });
    }

    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const submission = addSubmission({ title, category, description, prompt_text, tools, setup_steps, trigger, alert, submitter_ip: ip });

    return NextResponse.json({ message: 'Submitted! Brian will review it shortly.', id: submission.id });
  } catch (error) {
    console.error('POST /api/prompts/submit error:', error);
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 });
  }
}
