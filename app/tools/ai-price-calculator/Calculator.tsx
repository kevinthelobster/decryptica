'use client';

import { FormEvent, useMemo, useState } from 'react';
import { trackEvent } from '@/app/lib/analytics';
import { resolveIntentContext, type IntentValue } from '@/app/lib/intent-continuity';
import { getLeadMagnetBySlug } from '@/app/data/lead-magnets';

export const PROVIDERS = [
  // OpenAI - direct API standard rates, short context where split pricing exists.
  { id: "openai-gpt-5.6-sol", name: "GPT-5.6 Sol", provider: "OpenAI", input: 5.0, output: 30.0, supports: ["text", "vision", "function", "reasoning", "coding"], contextWindow: 1000000, color: "#10a37f", link: "https://developers.openai.com/api/docs/pricing", openSource: false },
  { id: "openai-gpt-5.6-terra", name: "GPT-5.6 Terra", provider: "OpenAI", input: 2.5, output: 15.0, supports: ["text", "vision", "function", "reasoning", "coding"], contextWindow: 1000000, color: "#10a37f", link: "https://developers.openai.com/api/docs/pricing", openSource: false },
  { id: "openai-gpt-5.6-luna", name: "GPT-5.6 Luna", provider: "OpenAI", input: 1.0, output: 6.0, supports: ["text", "vision", "function", "reasoning"], contextWindow: 1000000, color: "#10a37f", link: "https://developers.openai.com/api/docs/pricing", openSource: false },
  { id: "openai-gpt-5.5", name: "GPT-5.5", provider: "OpenAI", input: 5.0, output: 30.0, supports: ["text", "vision", "function", "reasoning", "coding"], contextWindow: 1000000, color: "#10a37f", link: "https://developers.openai.com/api/docs/pricing", openSource: false },
  { id: "openai-gpt-5.5-pro", name: "GPT-5.5 Pro", provider: "OpenAI", input: 30.0, output: 180.0, supports: ["text", "vision", "function", "reasoning", "coding"], contextWindow: 1000000, color: "#10a37f", link: "https://developers.openai.com/api/docs/pricing", openSource: false },
  { id: "openai-gpt-5.4", name: "GPT-5.4", provider: "OpenAI", input: 2.5, output: 15.0, supports: ["text", "vision", "function", "reasoning", "coding"], contextWindow: 1000000, color: "#10a37f", link: "https://developers.openai.com/api/docs/pricing", openSource: false },
  { id: "openai-gpt-5.4-mini", name: "GPT-5.4 Mini", provider: "OpenAI", input: 0.75, output: 4.5, supports: ["text", "vision", "function", "reasoning"], contextWindow: 200000, color: "#10a37f", link: "https://developers.openai.com/api/docs/pricing", openSource: false },
  { id: "openai-gpt-5.4-nano", name: "GPT-5.4 Nano", provider: "OpenAI", input: 0.2, output: 1.25, supports: ["text", "function"], contextWindow: 200000, color: "#10a37f", link: "https://developers.openai.com/api/docs/pricing", openSource: false },

  // Anthropic - first-party Claude API.
  { id: "anthropic-claude-fable-5", name: "Claude Fable 5", provider: "Anthropic", input: 10.0, output: 50.0, supports: ["text", "vision", "function", "reasoning", "coding"], contextWindow: 1000000, color: "#d4a574", link: "https://platform.claude.com/docs/en/about-claude/pricing", openSource: false },
  { id: "anthropic-claude-opus-5", name: "Claude Opus 5", provider: "Anthropic", input: 5.0, output: 25.0, supports: ["text", "vision", "function", "reasoning", "coding"], contextWindow: 1000000, color: "#d4a574", link: "https://platform.claude.com/docs/en/about-claude/pricing", openSource: false },
  { id: "anthropic-claude-sonnet-5", name: "Claude Sonnet 5", provider: "Anthropic", input: 2.0, output: 10.0, supports: ["text", "vision", "function", "reasoning", "coding"], contextWindow: 1000000, color: "#d4a574", link: "https://platform.claude.com/docs/en/about-claude/pricing", openSource: false },
  { id: "anthropic-claude-haiku-4-5", name: "Claude Haiku 4.5", provider: "Anthropic", input: 1.0, output: 5.0, supports: ["text", "vision", "function"], contextWindow: 200000, color: "#d4a574", link: "https://platform.claude.com/docs/en/about-claude/pricing", openSource: false },

  // Google - Gemini API paid tier, standard rates for text/image/video inputs.
  { id: "google-gemini-3.1-pro-preview", name: "Gemini 3.1 Pro Preview", provider: "Google", input: 2.0, output: 12.0, supports: ["text", "vision", "function", "reasoning", "coding"], contextWindow: 1000000, color: "#4285f4", link: "https://ai.google.dev/gemini-api/docs/pricing", openSource: false },
  { id: "google-gemini-3-flash-preview", name: "Gemini 3 Flash Preview", provider: "Google", input: 0.5, output: 3.0, supports: ["text", "vision", "function", "reasoning"], contextWindow: 1000000, color: "#4285f4", link: "https://ai.google.dev/gemini-api/docs/pricing", openSource: false },
  { id: "google-gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "Google", input: 1.25, output: 10.0, supports: ["text", "vision", "function", "reasoning", "coding"], contextWindow: 1000000, color: "#4285f4", link: "https://ai.google.dev/gemini-api/docs/pricing", openSource: false },
  { id: "google-gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "Google", input: 0.3, output: 2.5, supports: ["text", "vision", "function", "reasoning"], contextWindow: 1000000, color: "#4285f4", link: "https://ai.google.dev/gemini-api/docs/pricing", openSource: false },
  { id: "google-gemini-2.5-flash-lite", name: "Gemini 2.5 Flash-Lite", provider: "Google", input: 0.1, output: 0.4, supports: ["text", "vision", "function"], contextWindow: 1000000, color: "#4285f4", link: "https://ai.google.dev/gemini-api/docs/pricing", openSource: false },

  // DeepSeek - official API model names; old deepseek-chat/deepseek-reasoner aliases were deprecated July 24, 2026.
  { id: "deepseek-v4-flash", name: "DeepSeek V4 Flash", provider: "DeepSeek", input: 0.14, output: 0.28, supports: ["text", "function", "reasoning", "coding"], contextWindow: 1000000, color: "#6366f1", link: "https://api-docs.deepseek.com/quick_start/pricing/", openSource: true },
  { id: "deepseek-v4-pro", name: "DeepSeek V4 Pro", provider: "DeepSeek", input: 0.435, output: 0.87, supports: ["text", "function", "reasoning", "coding"], contextWindow: 1000000, color: "#6366f1", link: "https://api-docs.deepseek.com/quick_start/pricing/", openSource: true },

  // xAI
  { id: "xai-grok-4.5", name: "Grok 4.5", provider: "xAI", input: 2.0, output: 6.0, supports: ["text", "vision", "function", "reasoning", "coding"], contextWindow: 500000, color: "#f97316", link: "https://docs.x.ai/developers/models", openSource: false },
  { id: "xai-grok-build-0.1", name: "Grok Build 0.1", provider: "xAI", input: 1.0, output: 2.0, supports: ["text", "function", "coding"], contextWindow: 256000, color: "#f97316", link: "https://docs.x.ai/developers/pricing", openSource: false },

  // Mistral - current public API lineup.
  { id: "mistral-medium-3.5", name: "Mistral Medium 3.5", provider: "Mistral", input: 1.5, output: 7.5, supports: ["text", "function", "coding"], contextWindow: 262000, color: "#cb20dd", link: "https://mistral.ai/pricing/", openSource: false },
  { id: "mistral-large-3", name: "Mistral Large 3", provider: "Mistral", input: 0.5, output: 1.5, supports: ["text", "function", "coding"], contextWindow: 128000, color: "#cb20dd", link: "https://mistral.ai/pricing/", openSource: false },
  { id: "mistral-small-4", name: "Mistral Small 4", provider: "Mistral", input: 0.15, output: 0.6, supports: ["text", "function"], contextWindow: 128000, color: "#cb20dd", link: "https://mistral.ai/pricing/", openSource: true },
  { id: "mistral-codestral", name: "Codestral", provider: "Mistral", input: 0.3, output: 0.9, supports: ["text", "function", "coding"], contextWindow: 256000, color: "#cb20dd", link: "https://mistral.ai/pricing/", openSource: false },

  // Cohere
  { id: "cohere-command-r-plus-08-2024", name: "Command R+ 08-2024", provider: "Cohere", input: 2.5, output: 10.0, supports: ["text", "function"], contextWindow: 128000, color: "#f47b5a", link: "https://cohere.com/pricing", openSource: false },
  { id: "cohere-command-r-03-2024", name: "Command R 03-2024", provider: "Cohere", input: 0.5, output: 1.5, supports: ["text", "function"], contextWindow: 128000, color: "#f47b5a", link: "https://cohere.com/pricing", openSource: false },
  { id: "cohere-aya-expanse", name: "Aya Expanse", provider: "Cohere", input: 0.5, output: 1.5, supports: ["text"], contextWindow: 128000, color: "#f47b5a", link: "https://cohere.com/pricing", openSource: false },

  // Amazon Bedrock
  { id: "amazon-nova-micro", name: "Nova Micro", provider: "Amazon", input: 0.035, output: 0.14, supports: ["text"], contextWindow: 128000, color: "#ff9900", link: "https://aws.amazon.com/bedrock/pricing/", openSource: false },
  { id: "amazon-nova-lite", name: "Nova Lite", provider: "Amazon", input: 0.06, output: 0.24, supports: ["text", "vision"], contextWindow: 300000, color: "#ff9900", link: "https://aws.amazon.com/bedrock/pricing/", openSource: false },
  { id: "amazon-nova-pro", name: "Nova Pro", provider: "Amazon", input: 0.8, output: 3.2, supports: ["text", "vision", "function"], contextWindow: 300000, color: "#ff9900", link: "https://aws.amazon.com/bedrock/pricing/", openSource: false },
];

type SortKey = 'total' | 'input' | 'output' | 'provider' | 'context';
type FilterCapability = 'all' | 'vision' | 'function' | 'reasoning' | 'coding';
type FilterProvider = 'all' | 'free' | string;
type FilterOpenSource = 'all' | 'openSource' | 'closed';

export default function AIPriceCalculator() {
  const [inputTokens, setInputTokens] = useState<string>('100000');
  const [outputTokens, setOutputTokens] = useState<string>('20000');
  const [sortKey, setSortKey] = useState<SortKey>('total');
  const [filterCapability, setFilterCapability] = useState<FilterCapability>('all');
  const [filterProvider, setFilterProvider] = useState<FilterProvider>('all');
  const [filterOpenSource, setFilterOpenSource] = useState<FilterOpenSource>('all');
  const [showFree, setShowFree] = useState<boolean>(true);
  const [quickCaptureEmail, setQuickCaptureEmail] = useState('');
  const [quickCaptureStatus, setQuickCaptureStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [quickCaptureMessage, setQuickCaptureMessage] = useState('');

  const inputNum = parseInt(inputTokens.replace(/,/g, '')) || 0;
  const outputNum = parseInt(outputTokens.replace(/,/g, '')) || 0;
  const totalTokens = inputNum + outputNum;

  const results = useMemo(() => {
    let filtered = PROVIDERS.filter(p => {
      if (filterCapability !== 'all' && !p.supports.includes(filterCapability)) return false;
      if (filterOpenSource === 'openSource' && !p.openSource) return false;
      if (filterOpenSource === 'closed' && p.openSource) return false;
      if (filterProvider !== 'all' && filterProvider !== 'free' && p.provider !== filterProvider) return false;
      if (filterProvider === 'free' && p.input !== null) return false;
      if (!showFree && p.input === null) return false;
      return true;
    });

    return filtered.map(p => {
      const inputCost = p.input !== null ? (p.input * inputNum) / 1_000_000 : null;
      const outputCost = p.output !== null ? (p.output * outputNum) / 1_000_000 : null;
      const total = inputCost !== null && outputCost !== null ? inputCost + outputCost : null;
      const per1M = total !== null && totalTokens > 0 ? total / totalTokens * 1000000 : null;
      return { ...p, inputCost, outputCost, total, per1M };
    }).sort((a, b) => {
      if (sortKey === 'total') {
        if (a.total === null && b.total === null) return 0;
        if (a.total === null) return 1;
        if (b.total === null) return -1;
        return a.total - b.total;
      }
      if (sortKey === 'input') {
        if (a.inputCost === null && b.inputCost === null) return 0;
        if (a.inputCost === null) return 1;
        if (b.inputCost === null) return -1;
        return a.inputCost - b.inputCost;
      }
      if (sortKey === 'output') {
        if (a.outputCost === null && b.outputCost === null) return 0;
        if (a.outputCost === null) return 1;
        if (b.outputCost === null) return -1;
        return a.outputCost - b.outputCost;
      }
      if (sortKey === 'provider') return a.provider.localeCompare(b.provider);
      if (sortKey === 'context') return b.contextWindow - a.contextWindow;
      return 0;
    });
  }, [inputNum, outputNum, sortKey, filterCapability, filterProvider, filterOpenSource, showFree]);

  const pricedResults = results.filter(r => r.total !== null);
  const cheapest = pricedResults[0];
  const priciest = pricedResults[pricedResults.length - 1];
  const savings = priciest && cheapest ? priciest.total! - cheapest.total! : 0;
  const savingsPct = priciest && priciest.total! > 0 ? ((savings / priciest.total!) * 100).toFixed(0) : '0';

  const uniqueProviders = useMemo(() => {
    return [...new Set(PROVIDERS.map(p => p.provider))].sort();
  }, []);

  const topThree = pricedResults.slice(0, 3);
  const pricingSheetOffer = getLeadMagnetBySlug('ai-model-pricing-sheet');

  async function handleQuickCaptureSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setQuickCaptureStatus('loading');
    setQuickCaptureMessage('');

    const intentContext = resolveIntentContext();
    const activeIntent: IntentValue = intentContext.intent || 'calculate';
    const sourceSurface = ['home_intent_router', 'topic_intent_router', 'article_conversion_strip'].includes(
      intentContext.intentSource
    )
      ? intentContext.intentSource
      : 'direct';

    trackEvent({
      type: 'quick_capture_submit',
      metadata: {
        location: 'quick_capture',
        pageType: 'calculator',
        intent: activeIntent,
        intentSource: intentContext.intentDerivedFrom === 'default' ? 'default' : intentContext.intentDerivedFrom,
        intentDerivedFrom: intentContext.intentDerivedFrom,
        sourceSurface,
        capturedIntent: activeIntent,
        offerSlug: pricingSheetOffer.slug,
        offerTitle: pricingSheetOffer.title,
      },
    }).catch(() => undefined);

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: quickCaptureEmail,
          source: 'ai_price_calculator_quick_capture',
          offerSlug: pricingSheetOffer.slug,
          offerTitle: pricingSheetOffer.title,
          category: 'ai',
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || 'Unable to save your recommendation.');
      }

      setQuickCaptureStatus('success');
      setQuickCaptureMessage('Recommendation saved. We sent your top picks and the pricing sheet to this inbox.');
      setQuickCaptureEmail('');
    } catch (error) {
      setQuickCaptureStatus('error');
      setQuickCaptureMessage(error instanceof Error ? error.message : 'Unable to save your recommendation.');
    }
  }

  return (
    <div className="min-h-screen bg-white text-stone-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-stone-950 mb-2">AI Model Price Calculator</h1>
          <p className="text-stone-600">Compare current LLM API costs across {PROVIDERS.length} production models from OpenAI, Anthropic, Google, DeepSeek, xAI, Mistral, Cohere, and Amazon.</p>
        </div>

        <div className="card-elevated p-5 mb-6 border border-stone-200">
          <h2 className="text-lg font-semibold text-stone-950 mb-3">What is this tool?</h2>
          <p className="text-stone-600 text-sm leading-relaxed mb-3">
            When you use AI APIs like GPT-5.6, Claude, or Gemini, you pay per token — roughly a few cents to tens of dollars per 1M tokens depending on the model. A token is about 4 characters or 3/4 of a word. This calculator helps you estimate exactly how much your AI usage will cost before you write a single line of code.
          </p>
          <p className="text-stone-600 text-sm leading-relaxed mb-3">
            Whether you are building an app, running a business, or just exploring AI costs — enter your expected input and output tokens above, and instantly compare prices across {PROVIDERS.length} models from every major provider.
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-xs px-2 py-1 rounded-md bg-stone-100 text-stone-600">&#x1F4B0; API pricing is per 1M tokens</span>
            <span className="text-xs px-2 py-1 rounded-md bg-stone-100 text-stone-600">&#x1F4DD; 1M tokens &#x2248; 750K words</span>
            <span className="text-xs px-2 py-1 rounded-md bg-stone-100 text-stone-600">&#x26A1; Input = your prompts &#xb7; Output = AI responses</span>
          </div>
        </div>

        <div id="calculator-inputs" className="card-elevated p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-2">Input Tokens</label>
              <input type="text" value={inputTokens} onChange={e => setInputTokens(e.target.value.replace(/[^0-9,]/g, ''))} className="w-full bg-white border border-stone-300  px-4 py-3 text-stone-950 focus:outline-none focus:border-red-900 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-2">Output Tokens</label>
              <input type="text" value={outputTokens} onChange={e => setOutputTokens(e.target.value.replace(/[^0-9,]/g, ''))} className="w-full bg-white border border-stone-300  px-4 py-3 text-stone-950 focus:outline-none focus:border-red-900 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-2">Sort By</label>
              <select value={sortKey} onChange={e => setSortKey(e.target.value as SortKey)} className="w-full bg-white border border-stone-300  px-4 py-3 text-stone-950 focus:outline-none focus:border-red-900 transition-colors">
                <option value="total">Total Cost</option>
                <option value="input">Input Cost</option>
                <option value="output">Output Cost</option>
                <option value="provider">Provider</option>
                <option value="context">Context Window</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-2">Capability</label>
              <select value={filterCapability} onChange={e => setFilterCapability(e.target.value as FilterCapability)} className="w-full bg-white border border-stone-300  px-4 py-3 text-stone-950 focus:outline-none focus:border-red-900 transition-colors">
                <option value="all">All Capabilities</option>
                <option value="vision">Vision Support</option>
                <option value="function">Function Calling</option>
                <option value="reasoning">Reasoning</option>
                <option value="coding">Coding</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-2">Provider</label>
              <select value={filterProvider} onChange={e => setFilterProvider(e.target.value as FilterProvider)} className="w-full bg-white border border-stone-300  px-4 py-3 text-stone-950 focus:outline-none focus:border-red-900 transition-colors">
                <option value="all">All Providers</option>
                <option value="free">Free Models Only</option>
                {uniqueProviders.map(p => (<option key={p} value={p}>{p}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-2">Pricing</label>
              <select value={filterOpenSource} onChange={e => setFilterOpenSource(e.target.value as FilterOpenSource)} className="w-full bg-white border border-stone-300  px-4 py-3 text-stone-950 focus:outline-none focus:border-red-900 transition-colors">
                <option value="all">All Models</option>
                <option value="openSource">Open Source Only</option>
                <option value="closed">Commercial Only</option>
              </select>
            </div>
            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={showFree} onChange={e => setShowFree(e.target.checked)} className="w-4 h-4 rounded bg-white border-stone-300 text-red-900 focus:ring-red-900" />
                <span className="text-sm text-stone-700">Show free models</span>
              </label>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <span className="text-sm text-stone-500">{results.length} models shown</span>
            </div>
          </div>
        </div>

        {totalTokens > 0 && pricedResults.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="card-elevated p-4">
              <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Total Tokens</p>
              <p className="text-2xl font-bold text-stone-950">{(totalTokens / 1000).toFixed(0)}K</p>
            </div>
            {cheapest && (
              <div className="card-elevated p-4">
                <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Cheapest</p>
                <p className="text-lg font-bold text-emerald-700 truncate">{cheapest.name}</p>
                <p className="text-sm text-stone-600">${cheapest.total!.toFixed(4)}</p>
              </div>
            )}
            {priciest && (
              <div className="card-elevated p-4">
                <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Most Expensive</p>
                <p className="text-lg font-bold text-red-800 truncate">{priciest.name}</p>
                <p className="text-sm text-stone-600">${priciest.total!.toFixed(4)}</p>
              </div>
            )}
            {priciest && cheapest && savings > 0 && (
              <div className="card-elevated p-4 border border-emerald-500/20">
                <p className="text-xs text-emerald-700 uppercase tracking-wider mb-1">Potential Savings</p>
                <p className="text-2xl font-bold text-emerald-700">-{savingsPct}%</p>
                <p className="text-sm text-stone-600">vs most expensive</p>
              </div>
            )}
          </div>
        )}

        {totalTokens > 0 && pricedResults.length > 0 && (
          <section id="save-recommendation" className="card-elevated mb-6 border border-red-900/30 bg-red-900/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-red-700">Pricing sheet</p>
            <h2 className="mt-2 text-lg font-semibold text-stone-950">Email my top 3 picks and pricing worksheet</h2>
            <p className="mt-1 text-sm text-stone-700">
              Keep your shortlist handy with the Decryptica cost worksheet for later budget reviews.
            </p>
            {topThree.length > 0 && (
              <p className="mt-2 text-xs text-stone-600">
                Current top picks: {topThree.map((item) => item.name).join(', ')}.
              </p>
            )}
            <form className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center" onSubmit={handleQuickCaptureSubmit}>
              <input
                type="email"
                required
                value={quickCaptureEmail}
                onChange={(event) => setQuickCaptureEmail(event.target.value)}
                disabled={quickCaptureStatus === 'loading' || quickCaptureStatus === 'success'}
                placeholder="you@company.com"
                className="h-11 w-full  border border-stone-300 bg-white px-4 text-sm text-stone-950 placeholder:text-stone-500 focus:border-red-900 focus:outline-none sm:flex-1"
              />
              <button
                type="submit"
                disabled={quickCaptureStatus === 'loading' || quickCaptureStatus === 'success'}
                className="btn-primary h-11 justify-center"
              >
                {quickCaptureStatus === 'loading' ? 'Sending...' : quickCaptureStatus === 'success' ? 'Sent' : 'Send Worksheet'}
              </button>
            </form>
            {quickCaptureMessage && (
              <p className={`mt-3 text-sm ${quickCaptureStatus === 'error' ? 'text-red-300' : 'text-emerald-300'}`}>
                {quickCaptureMessage}
              </p>
            )}
          </section>
        )}

        <div id="calculator-results" className="card-elevated overflow-hidden">
          <div className="hidden md:grid grid-cols-7 gap-4 px-6 py-3 bg-white border-b border-stone-200 text-xs font-medium text-stone-500 uppercase tracking-wider">
            <div className="col-span-2">Provider</div>
            <div className="text-right">Input</div>
            <div className="text-right">Output</div>
            <div className="text-right">Total</div>
            <div className="text-right">per 1M</div>
            <div className="text-right">Context</div>
          </div>

          <div className="divide-y divide-stone-200">
            {results.map((p) => {
              const isWinner = cheapest?.id === p.id;
              const isFree = p.input === null;
              return (
                <a key={p.id} href={p.link} target="_blank" rel="noopener noreferrer" className={`grid grid-cols-2 md:grid-cols-7 gap-2 md:gap-4 px-6 py-4 hover:bg-neutral-50 transition-colors group ${isWinner ? 'bg-emerald-50' : ''} ${isFree ? 'opacity-70' : ''}`}>
                  <div className="md:col-span-2 flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8  flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ backgroundColor: p.color + '33', color: p.color }}>{p.provider[0]}</div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-stone-950 group-hover:text-red-800 transition-colors truncate">{p.name}</span>
                        {isWinner && <span className="text-xs font-medium text-emerald-700 bg-emerald-400/10 px-2 py-0.5  flex-shrink-0">Best value</span>}
                        {isFree && <span className="text-xs font-medium text-stone-600 bg-stone-200/50 px-2 py-0.5  flex-shrink-0">Free</span>}
                        {p.openSource && !isFree && <span className="text-xs font-medium text-red-800 bg-blue-400/10 px-2 py-0.5  flex-shrink-0">Open Source</span>}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-xs text-stone-500">{p.provider}</span>
                        <span className="text-xs text-stone-500">&#xb7;</span>
                        <span className="text-xs text-stone-500 capitalize">{p.supports.filter(s => ['vision','function','reasoning','coding'].includes(s)).join(', ')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right"><span className="md:hidden text-xs text-stone-500 mr-2">Input:</span><span className={`text-sm ${p.inputCost !== null ? 'text-stone-700' : 'text-stone-500'}`}>{p.inputCost !== null ? `$${p.inputCost.toFixed(4)}` : 'Free'}</span></div>
                  <div className="text-right"><span className="md:hidden text-xs text-stone-500 mr-2">Output:</span><span className={`text-sm ${p.outputCost !== null ? 'text-stone-700' : 'text-stone-500'}`}>{p.outputCost !== null ? `$${p.outputCost.toFixed(4)}` : 'Free'}</span></div>
                  <div className="text-right"><span className="md:hidden text-xs text-stone-500 mr-2">Total:</span><span className={`text-lg font-semibold ${isWinner ? 'text-emerald-700' : p.total !== null ? 'text-stone-950' : 'text-stone-500'}`}>{p.total !== null ? `$${p.total.toFixed(4)}` : 'Free'}</span></div>
                  <div className="text-right"><span className="md:hidden text-xs text-stone-500 mr-2">per 1M:</span><span className="text-sm text-stone-600">{p.per1M !== null ? `$${p.per1M.toFixed(2)}` : '—'}</span></div>
                  <div className="text-right flex items-center justify-end gap-1">
                    <span className="text-sm text-stone-600">{formatContext(p.contextWindow)}</span>
                    <svg className="w-3 h-3 text-stone-500 group-hover:text-red-800 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-stone-500 mt-4 text-center">Prices use standard API token rates and may vary by tier, region, context length, caching, batch, or priority mode. Data checked July 25, 2026.</p>
      </div>
    </div>
  );
}

function formatContext(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return n.toString();
}
