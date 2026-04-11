/**
 * SEO Dashboard API — GET /api/seo/dashboard
 * Returns current SEO dashboard state for board/internal review.
 */

import { NextRequest, NextResponse } from 'next/server';
import { buildSeoDashboard } from '@/app/lib/seo-dashboard';
import { MissingSecretError, requireSecret } from '@/app/lib/server-secrets';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const expectedToken = requireSecret('ANALYTICS_DEBUG_TOKEN');
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dashboard = await buildSeoDashboard();
    return NextResponse.json(dashboard, { status: 200 });
  } catch (err) {
    if (err instanceof MissingSecretError) {
      return NextResponse.json({ error: 'Debug auth is not configured' }, { status: 503 });
    }
    console.error('[Dashboard API] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
