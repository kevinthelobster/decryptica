'use client';

import { useEffect, useMemo, useState } from 'react';
import LeadMagnetCapture from './LeadMagnetCapture';
import { getLeadMagnetBySlug, getLeadMagnetForCategory } from '../data/lead-magnets';
import { resolveIntentContext } from '../lib/intent-continuity';

interface MidArticleLeadCaptureProps {
  articleSlug: string;
  category: string;
}

export default function MidArticleLeadCapture({ articleSlug, category }: MidArticleLeadCaptureProps) {
  const [context, setContext] = useState(() => resolveIntentContext());

  useEffect(() => {
    setContext(resolveIntentContext());
  }, []);

  const offer = useMemo(() => {
    if (context.intent === 'calculate') {
      return getLeadMagnetBySlug('ai-model-pricing-sheet');
    }

    if (context.intent === 'implement') {
      return category === 'ai'
        ? getLeadMagnetBySlug('ai-workflow-risk-register')
        : getLeadMagnetBySlug('automation-sop-template');
    }

    return getLeadMagnetForCategory(category);
  }, [category, context.intent]);

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
