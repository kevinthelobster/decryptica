/**
 * SEO Dashboard API — GET /api/seo/dashboard
 * Returns current SEO dashboard state for board/internal review.
 */

import { NextRequest, NextResponse } from 'next/server';
import { buildSeoDashboard } from '@/app/lib/seo-dashboard';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.ANALYTICS_DEBUG_TOKEN || 'decryptica-debug';
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dashboard = await buildSeoDashboard();
    return NextResponse.json(dashboard, { status: 200 });
  } catch (err) {
    console.error('[Dashboard API] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
