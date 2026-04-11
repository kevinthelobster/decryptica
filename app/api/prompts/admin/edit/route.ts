import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { updatePrompt, toggleStaffPick, getPromptById } from '@/app/api/prompts/db';

const ADMIN_PASSWORD = process.env.PROMPTS_ADMIN_PASSWORD || 'kevin123';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    if (cookieStore.get('prompts_admin')?.value !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '0');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const prompt = getPromptById(id);
    if (!prompt) return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });

    return NextResponse.json({ prompt });
  } catch (error) {
    console.error('GET /api/prompts/admin/edit error:', error);
    return NextResponse.json({ error: 'Failed to fetch prompt' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    if (cookieStore.get('prompts_admin')?.value !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, updates } = await request.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const updated = updatePrompt(id, updates);
    if (!updated) return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });

    return NextResponse.json({ success: true, prompt: updated });
  } catch (error) {
    console.error('PUT /api/prompts/admin/edit error:', error);
    return NextResponse.json({ error: 'Failed to update prompt' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    if (cookieStore.get('prompts_admin')?.value !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, action } = await request.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    if (action === 'toggle_staff_pick') {
      const updated = toggleStaffPick(id);
      if (!updated) return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
      return NextResponse.json({ success: true, prompt: updated });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('POST /api/prompts/admin/edit error:', error);
    return NextResponse.json({ error: 'Failed to perform action' }, { status: 500 });
  }
}
