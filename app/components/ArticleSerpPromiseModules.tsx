'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { trackEvent } from '../lib/analytics';
import { resolveIntentContext, upsertIntent, type IntentValue } from '../lib/intent-continuity';

type IntentSource = 'url' | 'session' | 'default';

interface ArticleSerpPromiseModulesProps {
  articleSlug: string;
  category: string;
  title: string;
  excerpt: string;
}

type OutcomeOption = {
  id: 'compare_options' | 'get_implementation_help' | 'keep_learning';
  label: string;
  intent: IntentValue;
};

const OUTCOME_OPTIONS: OutcomeOption[] = [
  { id: 'compare_options', label: 'Compare options', intent: 'calculate' },
  { id: 'get_implementation_help', label: 'Get implementation help', intent: 'implement' },
  { id: 'keep_learning', label: 'Keep learning', intent: 'learn' },
];

const OUTCOME_STORAGE_KEY = 'dc_article_outcome_selector';
const SOURCE_SURFACE = 'article';

function inferIntentFromTitle(title: string): IntentValue {
  const lower = title.toLowerCase();
  if (lower.includes('best') || lower.includes('vs') || lower.includes('compare')) {
    return 'calculate';
  }
  if (lower.includes('how to') || lower.includes('setup') || lower.includes('guide')) {
    return 'implement';
  }
  return 'learn';
}

function sanitizeIntentSource(raw: string): IntentSource {
  if (raw === 'url' || raw === 'session') {
    return raw;
  }
  return 'default';
}

function buildIntentCopy(intent: IntentValue, excerpt: string) {
  const firstSentence = excerpt.split(/(?<=[.!?])\s+/)[0] || excerpt;

  const quickAnswerByIntent: Record<IntentValue, string> = {
    learn: firstSentence,
    calculate: `Fast comparison takeaway: ${firstSentence}`,
    implement: `Execution takeaway: ${firstSentence}`,
  };

  const checklistByIntent: Record<IntentValue, string[]> = {
    learn: [
      'Understand the core tradeoff before you choose a path.',
      'Pin the highest-risk assumption to verify today.',
      'Save a next-step resource matched to your use case.',
    ],
    calculate: [
      'Compare two practical options with one decision rule.',
      'Estimate likely ROI with concrete assumptions.',
      'Choose the best fit and queue implementation.',
    ],
    implement: [
      'Capture the implementation pattern that fits your stack.',
      'Identify one blocker and one immediate workaround.',
      'Commit a first execution step for this week.',
    ],
  };

  return {
    quickAnswer: quickAnswerByIntent[intent],
    checklist: checklistByIntent[intent],
  };
}

function bestForChips(category: string): string[] {
  const map: Record<string, string[]> = {
    ai: ['Ops leaders', 'Technical founders', 'Product teams'],
    crypto: ['Active traders', 'Research analysts', 'DeFi builders'],
    automation: ['RevOps teams', 'Solo operators', 'Implementation leads'],
  };

  return map[category] || ['Technical readers', 'Decision makers', 'Builders'];
}

function actionTargets(category: string) {
  const toolHref = category === 'crypto' ? '/articles' : '/tools/ai-price-calculator';

  return {
    keepReading: '#article-content',
    runTool: toolHref,
    implement: '/services/ai-automation-consulting',
  };
}

function baseMetadata(args: {
  intent: IntentValue;
  intentSource: IntentSource;
  location: 'serp_promise_card' | 'article_action_path_row' | 'article_milestone_strip' | 'article_outcome_selector';
  articleSlug: string;
  category: string;
}) {
  return {
    intent: args.intent,
    intentSource: args.intentSource,
    location: args.location,
    articleSlug: args.articleSlug,
    category: args.category,
    sourceSurface: SOURCE_SURFACE,
  };
}

export function ArticleMilestoneStrip({
  articleSlug,
  category,
}: {
  articleSlug: string;
  category: string;
}) {
  const [activeId, setActiveId] = useState('overview');
  const reachedRef = useRef<Set<string>>(new Set());
  const context = useMemo(() => resolveIntentContext(), []);

  const milestones = [
    { id: 'overview', label: 'Quick Answer' },
    { id: 'key-questions', label: 'Core Comparison' },
    { id: 'tools-comparisons', label: 'Decision' },
    { id: 'next-step', label: 'Next Step' },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const sectionId = entry.target.id;
          setActiveId(sectionId);

          if (reachedRef.current.has(sectionId)) {
            return;
          }

          reachedRef.current.add(sectionId);
          trackEvent({
            type: 'article_milestone_reached',
            articleSlug,
            metadata: {
              ...baseMetadata({
                intent: context.intent || 'learn',
                intentSource: sanitizeIntentSource(context.intentDerivedFrom),
                location: 'article_milestone_strip',
                articleSlug,
                category,
              }),
              milestone: sectionId,
            },
          }).catch(() => undefined);
        });
      },
      {
        rootMargin: '-35% 0px -45% 0px',
        threshold: [0.2, 0.4],
      }
    );

    milestones.forEach((milestone) => {
      const element = document.getElementById(milestone.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [articleSlug, category, context.intent, context.intentDerivedFrom]);

  return (
    <section className="mb-6 border border-stone-200 bg-white p-3" aria-label="Reading milestones">
      <ul className="flex flex-wrap gap-2">
        {milestones.map((milestone) => (
          <li key={milestone.id}>
            <a
              href={`#${milestone.id}`}
              className={`inline-flex border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-900 focus-visible:ring-offset-2 ${
                activeId === milestone.id
                  ? 'border-red-900 bg-red-50 text-red-900'
                  : 'border-stone-300 bg-white text-stone-600 hover:border-stone-950 hover:text-stone-950'
              }`}
            >
              {milestone.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ArticleSerpPromiseModules({
  articleSlug,
  category,
  title,
  excerpt,
}: ArticleSerpPromiseModulesProps) {
  const [context, setContext] = useState(() => resolveIntentContext());
  const [selectedOutcome, setSelectedOutcome] = useState<OutcomeOption['id'] | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const impressionTrackedRef = useRef(false);

  const inferredIntent = inferIntentFromTitle(title);
  const intent = context.intent || inferredIntent;
  const intentSource = sanitizeIntentSource(context.intentDerivedFrom);
  const copy = useMemo(() => buildIntentCopy(intent, excerpt), [intent, excerpt]);
  const targets = useMemo(() => actionTargets(category), [category]);
  const chips = useMemo(() => bestForChips(category), [category]);

  useEffect(() => {
    const stored = window.sessionStorage.getItem(OUTCOME_STORAGE_KEY);
    if (stored === 'compare_options' || stored === 'get_implementation_help' || stored === 'keep_learning') {
      setSelectedOutcome(stored);
    }
    setContext(resolveIntentContext());
  }, []);

  useEffect(() => {
    if (!cardRef.current || impressionTrackedRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry.isIntersecting || impressionTrackedRef.current) {
          return;
        }

        impressionTrackedRef.current = true;
        trackEvent({
          type: 'serp_promise_impression',
          articleSlug,
          metadata: baseMetadata({
            intent,
            intentSource,
            location: 'serp_promise_card',
            articleSlug,
            category,
          }),
        }).catch(() => undefined);
      },
      { threshold: 0.45 }
    );

    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [articleSlug, category, intent, intentSource]);

  const handleActionClick = (action: 'keep_reading' | 'run_tool' | 'implement_this', href: string) => {
    trackEvent({
      type: 'serp_promise_action_click',
      articleSlug,
      metadata: {
        ...baseMetadata({
          intent,
          intentSource,
          location: 'article_action_path_row',
          articleSlug,
          category,
        }),
        action,
        href,
      },
    }).catch(() => undefined);
  };

  const handleOutcomeSelect = (option: OutcomeOption) => {
    if (selectedOutcome === option.id) {
      return;
    }

    const previousOutcome = selectedOutcome;
    setSelectedOutcome(option.id);
    window.sessionStorage.setItem(OUTCOME_STORAGE_KEY, option.id);
    upsertIntent(option.intent, 'article_outcome_selector', category);
    window.dispatchEvent(new CustomEvent('dc:intent-updated'));
    setContext(resolveIntentContext());

    trackEvent({
      type: 'article_outcome_selected',
      articleSlug,
      metadata: {
        ...baseMetadata({
          intent: option.intent,
          intentSource: 'session',
          location: 'article_outcome_selector',
          articleSlug,
          category,
        }),
        selectedOutcome: option.id,
        previousOutcome: previousOutcome || 'none',
      },
    }).catch(() => undefined);
  };

  return (
    <section className="mb-8 space-y-4" aria-label="Search intent promise and next action">
      <div ref={cardRef} className="border border-stone-200 bg-neutral-50 p-5 md:p-6">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-red-900">Quick answer</p>
        <p className="text-sm leading-relaxed text-stone-700">{copy.quickAnswer}</p>

        <div className="mt-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-500">Best for</p>
          <div className="flex flex-wrap gap-2">
            {chips.slice(0, 3).map((chip) => (
              <span key={chip} className="border border-stone-300 bg-white px-2.5 py-1 text-xs text-stone-700">
                {chip}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-500">What you can do in 5 minutes</p>
          <ul className="space-y-1.5">
            {copy.checklist.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-stone-700">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-900" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <nav
        className="grid gap-2 border border-stone-200 bg-white p-3 sm:grid-cols-3"
        aria-label="Article action path"
      >
        <Link
          href={targets.keepReading}
          onClick={() => handleActionClick('keep_reading', targets.keepReading)}
          className={`border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-900 focus-visible:ring-offset-2 ${
            intent === 'learn'
              ? 'border-red-900 bg-red-50 text-red-900'
              : 'border-stone-300 bg-white text-stone-700 hover:border-stone-950 hover:text-stone-950'
          }`}
        >
          Keep Reading
        </Link>
        <Link
          href={targets.runTool}
          onClick={() => handleActionClick('run_tool', targets.runTool)}
          className={`border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-900 focus-visible:ring-offset-2 ${
            intent === 'calculate'
              ? 'border-red-900 bg-red-50 text-red-900'
              : 'border-stone-300 bg-white text-stone-700 hover:border-stone-950 hover:text-stone-950'
          }`}
        >
          Run the Tool
        </Link>
        <Link
          href={targets.implement}
          onClick={() => handleActionClick('implement_this', targets.implement)}
          className={`border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-900 focus-visible:ring-offset-2 ${
            intent === 'implement'
              ? 'border-red-900 bg-red-50 text-red-900'
              : 'border-stone-300 bg-white text-stone-700 hover:border-stone-950 hover:text-stone-950'
          }`}
        >
          Implement This
        </Link>
      </nav>

      <div className="border border-stone-200 bg-white p-4">
        <p className="mb-3 text-sm font-medium text-stone-950">What are you trying to do next?</p>
        <div className="flex flex-wrap gap-2">
          {OUTCOME_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => handleOutcomeSelect(option)}
              className={`border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-900 focus-visible:ring-offset-2 ${
                selectedOutcome === option.id
                  ? 'border-red-900 bg-red-50 text-red-900'
                  : 'border-stone-300 bg-white text-stone-700 hover:border-stone-950 hover:text-stone-950'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
