import { NextResponse } from 'next/server';
import { getPrompts, getCategories } from '@/app/api/prompts/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get('sort') || 'recent';
    const category = searchParams.get('category') || '';
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';

    const prompts = getPrompts(sort, category, ip);
    const categories = getCategories();

    return NextResponse.json({ prompts, categories });
  } catch (error) {
    console.error('GET /api/prompts error:', error);
    return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 });
  }
}
