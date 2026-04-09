import { NextResponse } from 'next/server';
import { toggleVote } from '@/app/api/prompts/db';

export async function POST(request: Request) {
  try {
    const { prompt_id } = await request.json();
    if (!prompt_id) {
      return NextResponse.json({ error: 'prompt_id required' }, { status: 400 });
    }

    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const result = toggleVote(prompt_id, ip);
    return NextResponse.json(result);
  } catch (error) {
    console.error('POST /api/prompts/vote error:', error);
    return NextResponse.json({ error: 'Failed to vote' }, { status: 500 });
  }
}
