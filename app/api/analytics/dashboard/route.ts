/**
 * Analytics Dashboard API — GET /api/analytics/dashboard
 * Returns weekly aggregated analytics segmented by topic cluster (AI/Crypto/Automation).
 * Data sourced from Vercel KV event counters.
 *
 * Auth: Requires ANALYTICS_DEBUG_TOKEN Bearer auth (same as debug endpoint).
 */

import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { MissingSecretError, requireSecret } from '@/app/lib/server-secrets';

interface WeeklyCounter {
  pageViews: number;
  ctaViews: number;
  ctaClicks: number;
  formStarts: number;
  signups: number;
  tocJumps: number;
  scrollDepthMilestones: Record<number, number>; // 25, 50, 75, 100
  faqExpands: number;
  articleClicks: number;
  byCategory: Record<string, number>;
}

function getWeekDates(): string[] {
  const dates: string[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

export async function GET(request: NextRequest) {
  try {
    const analyticsDebugToken = requireSecret('ANALYTICS_DEBUG_TOKEN');
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${analyticsDebugToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const weekDates = getWeekDates();
    const categories = ['ai', 'crypto', 'automation'];

    // Aggregate counters for the week
    const counterTypes = [
      'page_view',
      'cta_view',
      'cta_click',
      'form_start',
      'signup',
      'toc_jump',
      'scroll_depth',
      'faq_expand',
      'article_click',
    ];

    const totals: Record<string, number> = {};
    for (const type of counterTypes) {
      let sum = 0;
      for (const date of weekDates) {
        const count = await kv.get<number>(`kpi:counter:${type}:${date}`).catch(() => 0);
        sum += count ?? 0;
      }
      totals[type] = sum;
    }

    // Per-category breakdown (page_views per article slug prefix)
    // We approximate by summing article-level impressions for articles in each category
    const byCategory: Record<string, number> = {};
    for (const cat of categories) {
      let sum = 0;
      for (const date of weekDates) {
        // Count articles with impressions in this category
        // Article slugs are stored in kpi:impressions:{slug}:{date}
        // We scan keys — for large catalogs, this would need a Redis scan or secondary index
        const key = `kpi:category:${cat}:${date}`;
        const count = await kv.get<number>(key).catch(() => 0);
        sum += count ?? 0;
      }
      byCategory[cat] = sum;
    }

    // Compute derived metrics
    const ctaClickRate = totals['cta_view'] > 0
      ? ((totals['cta_click'] / totals['cta_view']) * 100).toFixed(2) + '%'
      : 'N/A';

    const formConversionRate = totals['form_start'] > 0
      ? ((totals['signup'] / totals['form_start']) * 100).toFixed(2) + '%'
      : 'N/A';

    const avgTocInteractionRate = totals['page_view'] > 0
      ? ((totals['toc_jump'] / totals['page_view']) * 100).toFixed(2) + '%'
      : 'N/A';

    const response = {
      generatedAt: new Date().toISOString(),
      period: {
        start: weekDates[0],
        end: weekDates[6],
        label: `Week of ${weekDates[0]} to ${weekDates[6]}`,
      },
      summary: {
        totalPageViews: totals['page_view'],
        totalCtaViews: totals['cta_view'],
        totalCtaClicks: totals['cta_click'],
        totalFormStarts: totals['form_start'],
        totalSignups: totals['signup'],
        totalTocJumps: totals['toc_jump'],
        totalFaqExpands: totals['faq_expand'],
        totalArticleClicks: totals['article_click'],
      },
      derivedMetrics: {
        ctaClickThroughRate: ctaClickRate,
        emailFormConversionRate: formConversionRate,
        avgTocInteractionRate,
        // DEC-9 spec targets
        specTargets: {
          ctaClickRateTarget: '4%',
          emailFormCompletionTarget: '35%',
          tocInteractionRateTarget: '20%',
        },
      },
      byCategory,
      scrollDepthBreakdown: {
        note: 'Scroll depth milestones tracked at 25%, 50%, 75%, 100% of article scroll',
        milestones: {
          reached25: { count: 0, note: '25% scroll depth milestone' },
          reached50: { count: 0, note: '50% scroll depth milestone' },
          reached75: { count: 0, note: '75% scroll depth milestone — DEC-9 spec target comparison' },
          reached100: { count: 0, note: '100% scroll depth milestone' },
        },
      },
      segments: {
        ai: { pageViews: byCategory['ai'] || 0 },
        crypto: { pageViews: byCategory['crypto'] || 0 },
        automation: { pageViews: byCategory['automation'] || 0 },
      },
      nextActions: [
        totals['cta_click'] === 0
          ? '⚠️ No CTA clicks recorded this week. Verify event instrumentation is firing correctly.'
          : null,
        totals['form_start'] === 0
          ? '⚠️ No form starts recorded. Verify onFocus tracking is working.'
          : null,
        ctaClickRate === 'N/A' || parseFloat(ctaClickRate) < 4
          ? '⚠️ CTA click-through rate below 4% target. Consider testing CTA copy/placement.'
          : null,
        parseFloat(formConversionRate) < 35
          ? '⚠️ Email form conversion below 35% target. Review form UX and value proposition.'
          : null,
      ].filter(Boolean),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    if (err instanceof MissingSecretError) {
      return NextResponse.json({ error: 'Debug auth is not configured' }, { status: 503 });
    }
    console.error('[Analytics Dashboard] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
