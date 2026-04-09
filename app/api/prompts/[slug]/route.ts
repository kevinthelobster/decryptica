import { NextResponse } from 'next/server';
import { getPromptBySlug } from '@/app/api/prompts/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const prompt = getPromptBySlug(slug, ip);

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    return NextResponse.json(prompt);
  } catch (error) {
    console.error('GET /api/prompts/[slug] error:', error);
    return NextResponse.json({ error: 'Failed to fetch prompt' }, { status: 500 });
  }
}
