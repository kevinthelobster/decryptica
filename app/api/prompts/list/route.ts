import { NextResponse } from 'next/server';
import { getPrompts } from '@/app/api/prompts/db';

export async function GET() {
  try {
    const prompts = getPrompts();
    return NextResponse.json({ prompts: prompts.map(p => ({ id: p.id, slug: p.slug, title: p.title, category: p.category })) });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 });
  }
}
