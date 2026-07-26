'use client';

import { useEffect, useMemo, useState } from 'react';
import LeadMagnetCapture from './LeadMagnetCapture';
import { getLeadMagnetBySlug, getLeadMagnetForCategory } from '../data/lead-magnets';
import { getRecommendedTool } from '../data/tools';
import { resolveIntentContext } from '../lib/intent-continuity';

interface MidArticleLeadCaptureProps {
  articleSlug: string;
  category: string;
  title?: string;
  tags?: string[];
  primaryConversionHref?: string;
}

export default function MidArticleLeadCapture({
  articleSlug,
  category,
  title,
  tags,
  primaryConversionHref,
}: MidArticleLeadCaptureProps) {
  const [context, setContext] = useState(() => resolveIntentContext());

  useEffect(() => {
    setContext(resolveIntentContext());
  }, []);

  const offer = useMemo(() => {
    if (context.intent === 'calculate') {
      const tool = getRecommendedTool({
        category,
        title,
        slug: articleSlug,
        tags,
        primaryConversionHref,
      });
      return getLeadMagnetBySlug(tool.leadMagnetSlug);
    }

    if (context.intent === 'implement') {
      return category === 'ai'
        ? getLeadMagnetBySlug('ai-workflow-risk-register')
        : getLeadMagnetBySlug('automation-sop-template');
    }

    return getLeadMagnetForCategory(category);
  }, [articleSlug, category, context.intent, primaryConversionHref, tags, title]);

  return (
    <div className="my-10">
      <LeadMagnetCapture
        offer={offer}
        location="article_mid_capture"
        articleSlug={articleSlug}
        category={category}
      />
    </div>
  );
}
