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
    <section
      className="mb-6 rounded-xl border border-zinc-800 bg-zinc-950/70 p-3"
      aria-label="Reading milestones"
    >
      <ul className="flex flex-wrap gap-2">
        {milestones.map((milestone) => (
          <li key={milestone.id}>
            <a
              href={`#${milestone.id}`}
              className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 ${
                activeId === milestone.id
                  ? 'border-indigo-400/50 bg-indigo-500/20 text-indigo-100'
                  : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500 hover:text-white'
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
      <div ref={cardRef} className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-5 md:p-6">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-indigo-300">Quick answer</p>
        <p className="text-sm leading-relaxed text-zinc-200">{copy.quickAnswer}</p>

        <div className="mt-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">Best for</p>
          <div className="flex flex-wrap gap-2">
            {chips.slice(0, 3).map((chip) => (
              <span key={chip} className="rounded-full border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-200">
                {chip}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">What you can do in 5 minutes</p>
          <ul className="space-y-1.5">
            {copy.checklist.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-zinc-300">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-300" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <nav
        className="grid gap-2 rounded-xl border border-zinc-800 bg-zinc-950/75 p-3 sm:grid-cols-3"
        aria-label="Article action path"
      >
        <Link
          href={targets.keepReading}
          onClick={() => handleActionClick('keep_reading', targets.keepReading)}
          className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 ${
            intent === 'learn'
              ? 'border-indigo-400/60 bg-indigo-500/20 text-indigo-100'
              : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500 hover:text-white'
          }`}
        >
          Keep Reading
        </Link>
        <Link
          href={targets.runTool}
          onClick={() => handleActionClick('run_tool', targets.runTool)}
          className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 ${
            intent === 'calculate'
              ? 'border-blue-400/60 bg-blue-500/20 text-blue-100'
              : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500 hover:text-white'
          }`}
        >
          Run the Tool
        </Link>
        <Link
          href={targets.implement}
          onClick={() => handleActionClick('implement_this', targets.implement)}
          className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 ${
            intent === 'implement'
              ? 'border-emerald-400/60 bg-emerald-500/20 text-emerald-100'
              : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500 hover:text-white'
          }`}
        >
          Implement This
        </Link>
      </nav>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950/75 p-4">
        <p className="mb-3 text-sm font-medium text-zinc-100">What are you trying to do next?</p>
        <div className="flex flex-wrap gap-2">
          {OUTCOME_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => handleOutcomeSelect(option)}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 ${
                selectedOutcome === option.id
                  ? 'border-indigo-400/70 bg-indigo-500/20 text-indigo-100'
                  : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500 hover:text-white'
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
