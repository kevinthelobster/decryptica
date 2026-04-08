'use client';

import { useState, useMemo } from 'react';

export const PROVIDERS = [
  // OpenAI
  { id: "openai-gpt-4o", name: "GPT-4o", provider: "OpenAI", input: 2.5, output: 10.0, supports: ["text", "vision", "function"], contextWindow: 128000, color: "#10a37f", link: "https://openai.com/api/pricing", openSource: false },
  { id: "openai-gpt-4o-mini", name: "GPT-4o mini", provider: "OpenAI", input: 0.15, output: 0.6, supports: ["text", "vision", "function"], contextWindow: 128000, color: "#10a37f", link: "https://openai.com/api/pricing", openSource: false },
  { id: "openai-gpt-4.1", name: "GPT-4.1", provider: "OpenAI", input: 2.0, output: 8.0, supports: ["text", "function"], contextWindow: 1000000, color: "#10a37f", link: "https://openai.com/api/pricing", openSource: false },
  { id: "openai-gpt-4.1-mini", name: "GPT-4.1 mini", provider: "OpenAI", input: 0.4, output: 1.6, supports: ["text", "function"], contextWindow: 1000000, color: "#10a37f", link: "https://openai.com/api/pricing", openSource: false },
  { id: "openai-gpt-4.1-nano", name: "GPT-4.1 nano", provider: "OpenAI", input: 0.1, output: 0.4, supports: ["text", "function"], contextWindow: 1000000, color: "#10a37f", link: "https://openai.com/api/pricing", openSource: false },
  { id: "openai-o1", name: "o1", provider: "OpenAI", input: 15.0, output: 60.0, supports: ["text", "reasoning"], contextWindow: 200000, color: "#10a37f", link: "https://openai.com/api/pricing", openSource: false },
  { id: "openai-o3", name: "o3", provider: "OpenAI", input: 10.0, output: 40.0, supports: ["text", "reasoning"], contextWindow: 200000, color: "#10a37f", link: "https://openai.com/api/pricing", openSource: false },
  { id: "openai-o4-mini", name: "o4-mini", provider: "OpenAI", input: 1.1, output: 4.4, supports: ["text", "reasoning"], contextWindow: 200000, color: "#10a37f", link: "https://openai.com/api/pricing", openSource: false },
  { id: "openai-o3-mini", name: "o3-mini", provider: "OpenAI", input: 1.1, output: 4.4, supports: ["text", "reasoning"], contextWindow: 200000, color: "#10a37f", link: "https://openai.com/api/pricing", openSource: false },

  // Anthropic
  { id: "anthropic-sonnet-3-5", name: "Claude 3.5 Sonnet", provider: "Anthropic", input: 3.0, output: 15.0, supports: ["text", "vision", "function", "extended"], contextWindow: 200000, color: "#d4a574", link: "https://www.anthropic.com/api/pricing", openSource: false },
  { id: "anthropic-haiku-3-5", name: "Claude 3.5 Haiku", provider: "Anthropic", input: 0.8, output: 4.0, supports: ["text", "vision", "function"], contextWindow: 200000, color: "#d4a574", link: "https://www.anthropic.com/api/pricing", openSource: false },
  { id: "anthropic-sonnet-4", name: "Claude Sonnet 4.6", provider: "Anthropic", input: 3.0, output: 15.0, supports: ["text", "vision", "function", "extended"], contextWindow: 200000, color: "#d4a574", link: "https://www.anthropic.com/api/pricing", openSource: false },
  { id: "anthropic-haiku-4", name: "Claude Haiku 4.5", provider: "Anthropic", input: 1.0, output: 5.0, supports: ["text", "vision", "function"], contextWindow: 200000, color: "#d4a574", link: "https://www.anthropic.com/api/pricing", openSource: false },
  { id: "anthropic-opus-4", name: "Claude Opus 4.6", provider: "Anthropic", input: 5.0, output: 25.0, supports: ["text", "vision", "function", "extended"], contextWindow: 1000000, color: "#d4a574", link: "https://www.anthropic.com/api/pricing", openSource: false },

  // Google
  { id: "google-gemini-2-0-flash", name: "Gemini 2.0 Flash", provider: "Google", input: 0.1, output: 0.4, supports: ["text", "vision", "function"], contextWindow: 1000000, color: "#4285f4", link: "https://ai.google.dev/pricing", openSource: false },
  { id: "google-gemini-2-5-flash", name: "Gemini 2.5 Flash", provider: "Google", input: 0.35, output: 1.5, supports: ["text", "vision", "function"], contextWindow: 1000000, color: "#4285f4", link: "https://ai.google.dev/pricing", openSource: false },
  { id: "google-gemini-2-5-pro", name: "Gemini 2.5 Pro", provider: "Google", input: 1.25, output: 5.0, supports: ["text", "vision", "function"], contextWindow: 1000000, color: "#4285f4", link: "https://ai.google.dev/pricing", openSource: false },
  { id: "google-gemini-1-5-pro", name: "Gemini 1.5 Pro", provider: "Google", input: 1.25, output: 5.0, supports: ["text", "vision", "function"], contextWindow: 2000000, color: "#4285f4", link: "https://ai.google.dev/pricing", openSource: false },
  { id: "google-gemini-1-5-flash", name: "Gemini 1.5 Flash", provider: "Google", input: 0.075, output: 0.3, supports: ["text", "vision", "function"], contextWindow: 1000000, color: "#4285f4", link: "https://ai.google.dev/pricing", openSource: false },
  { id: "google-gemma-3-27b", name: "Gemma 3 27B", provider: "Google", input: 0.08, output: 0.16, supports: ["text"], contextWindow: 128000, color: "#4285f4", link: "https://ai.google.dev/pricing", openSource: true },

  // DeepSeek
  { id: "deepseek-chat", name: "DeepSeek Chat V3", provider: "DeepSeek", input: 0.28, output: 1.1, supports: ["text", "vision", "function"], contextWindow: 164000, color: "#6366f1", link: "https://www.deepseek.com", openSource: true },
  { id: "deepseek-r1", name: "DeepSeek R1", provider: "DeepSeek", input: 0.55, output: 2.19, supports: ["text", "reasoning"], contextWindow: 128000, color: "#6366f1", link: "https://www.deepseek.com", openSource: true },
  { id: "deepseek-coder-2", name: "DeepSeek Coder 2.0", provider: "DeepSeek", input: 0.27, output: 1.1, supports: ["text", "coding"], contextWindow: 128000, color: "#6366f1", link: "https://www.deepseek.com", openSource: true },

  // Mistral
  { id: "mistral-large-3", name: "Mistral Large 3", provider: "Mistral", input: 2.0, output: 6.0, supports: ["text", "function"], contextWindow: 128000, color: "#cb20dd", link: "https://mistral.ai/technology", openSource: false },
  { id: "mistral-small-3-1-24b", name: "Mistral Small 3.1 24B", provider: "Mistral", input: 0.2, output: 0.6, supports: ["text", "function"], contextWindow: 128000, color: "#cb20dd", link: "https://mistral.ai/technology", openSource: true },

  // xAI
  { id: "xai-grok-2", name: "Grok 2", provider: "xAI", input: 2.0, output: 8.0, supports: ["text", "function"], contextWindow: 131000, color: "#f97316", link: "https://x.ai/api", openSource: false },

  // Meta (Llama via API)
  { id: "meta-llama-4-scout", name: "Llama 4 Scout", provider: "Meta", input: 0.08, output: 0.3, supports: ["text"], contextWindow: 328000, color: "#8000ff", link: "https://llama.meta.com", openSource: true },
  { id: "meta-llama-3-2-11b-vision", name: "Llama 3.2 11B Vision", provider: "Meta", input: 0.049, output: 0.049, supports: ["text", "vision"], contextWindow: 131000, color: "#8000ff", link: "https://llama.meta.com", openSource: true },
  { id: "meta-llama-3-2-3b", name: "Llama 3.2 3B", provider: "Meta", input: 0.03, output: 0.05, supports: ["text"], contextWindow: 80000, color: "#8000ff", link: "https://llama.meta.com", openSource: true },

  // Cohere
  { id: "cohere-command-r-plus", name: "Command R+", provider: "Cohere", input: 3.0, output: 15.0, supports: ["text", "vision", "function"], contextWindow: 128000, color: "#f47b5a", link: "https://cohere.com/api", openSource: false },
  { id: "cohere-command-r7b", name: "Command R7B", provider: "Cohere", input: 0.035, output: 0.15, supports: ["text", "function"], contextWindow: 128000, color: "#f47b5a", link: "https://cohere.com/api", openSource: false },

  // Microsoft
  { id: "microsoft-phi-4", name: "Phi-4", provider: "Microsoft", input: 0.065, output: 0.14, supports: ["text"], contextWindow: 16000, color: "#00a4ef", link: "https://azure.microsoft.com/en-us/products/ai-services/phi", openSource: true },

  // Amazon Bedrock
  { id: "amazon-nova-micro", name: "Nova Micro", provider: "Amazon", input: 0.035, output: 0.14, supports: ["text"], contextWindow: 128000, color: "#ff9900", link: "https://aws.amazon.com/bedrock/pricing", openSource: false },
  { id: "amazon-nova-lite", name: "Nova Lite", provider: "Amazon", input: 0.06, output: 0.24, supports: ["text", "vision"], contextWindow: 300000, color: "#ff9900", link: "https://aws.amazon.com/bedrock/pricing", openSource: false },

  // MiniMax
  { id: "minimax-m2.7", name: "MiniMax M2.7", provider: "MiniMax", input: 0.3, output: 1.2, supports: ["text", "vision", "function"], contextWindow: 200000, color: "#00d474", link: "https://platform.minimax.io/docs/pricing/overview", openSource: false },
  { id: "minimax-m2.5", name: "MiniMax M2.5", provider: "MiniMax", input: 0.3, output: 1.2, supports: ["text", "vision", "function"], contextWindow: 128000, color: "#00d474", link: "https://platform.minimax.io/docs/pricing/overview", openSource: false },
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

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">AI Model Price Calculator</h1>
          <p className="text-zinc-400">Compare LLM API costs across {PROVIDERS.length} models from OpenAI, Anthropic, Google, Meta, DeepSeek, and more.</p>
        </div>

        <div className="card-elevated p-5 mb-6 border border-zinc-800">
          <h2 className="text-lg font-semibold text-white mb-3">What is this tool?</h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-3">
            When you use AI APIs like GPT-4o, Claude, or Gemini, you pay per token — roughly $0.001–$15 per 1,000 tokens depending on the model. A token is about 4 characters or 3/4 of a word. This calculator helps you estimate exactly how much your AI usage will cost before you write a single line of code.
          </p>
          <p className="text-zinc-400 text-sm leading-relaxed mb-3">
            Whether you are building an app, running a business, or just exploring AI costs — enter your expected input and output tokens above, and instantly compare prices across {PROVIDERS.length} models from every major provider.
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-xs px-2 py-1 rounded-md bg-zinc-800 text-zinc-400">&#x1F4B0; API pricing is per 1M tokens</span>
            <span className="text-xs px-2 py-1 rounded-md bg-zinc-800 text-zinc-400">&#x1F4DD; 1M tokens &#x2248; 750K words</span>
            <span className="text-xs px-2 py-1 rounded-md bg-zinc-800 text-zinc-400">&#x26A1; Input = your prompts &#xb7; Output = AI responses</span>
          </div>
        </div>

        <div className="card-elevated p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Input Tokens</label>
              <input type="text" value={inputTokens} onChange={e => setInputTokens(e.target.value.replace(/[^0-9,]/g, ''))} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Output Tokens</label>
              <input type="text" value={outputTokens} onChange={e => setOutputTokens(e.target.value.replace(/[^0-9,]/g, ''))} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Sort By</label>
              <select value={sortKey} onChange={e => setSortKey(e.target.value as SortKey)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors">
                <option value="total">Total Cost</option>
                <option value="input">Input Cost</option>
                <option value="output">Output Cost</option>
                <option value="provider">Provider</option>
                <option value="context">Context Window</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Capability</label>
              <select value={filterCapability} onChange={e => setFilterCapability(e.target.value as FilterCapability)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors">
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
              <label className="block text-sm font-medium text-zinc-400 mb-2">Provider</label>
              <select value={filterProvider} onChange={e => setFilterProvider(e.target.value as FilterProvider)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors">
                <option value="all">All Providers</option>
                <option value="free">Free Models Only</option>
                {uniqueProviders.map(p => (<option key={p} value={p}>{p}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Pricing</label>
              <select value={filterOpenSource} onChange={e => setFilterOpenSource(e.target.value as FilterOpenSource)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors">
                <option value="all">All Models</option>
                <option value="openSource">Open Source Only</option>
                <option value="closed">Commercial Only</option>
              </select>
            </div>
            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={showFree} onChange={e => setShowFree(e.target.checked)} className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-indigo-500 focus:ring-indigo-500" />
                <span className="text-sm text-zinc-300">Show free models</span>
              </label>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <span className="text-sm text-zinc-500">{results.length} models shown</span>
            </div>
          </div>
        </div>

        {totalTokens > 0 && pricedResults.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="card-elevated p-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Total Tokens</p>
              <p className="text-2xl font-bold text-white">{(totalTokens / 1000).toFixed(0)}K</p>
            </div>
            {cheapest && (
              <div className="card-elevated p-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Cheapest</p>
                <p className="text-lg font-bold text-emerald-400 truncate">{cheapest.name}</p>
                <p className="text-sm text-zinc-400">${cheapest.total!.toFixed(4)}</p>
              </div>
            )}
            {priciest && (
              <div className="card-elevated p-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Most Expensive</p>
                <p className="text-lg font-bold text-red-400 truncate">{priciest.name}</p>
                <p className="text-sm text-zinc-400">${priciest.total!.toFixed(4)}</p>
              </div>
            )}
            {priciest && cheapest && savings > 0 && (
              <div className="card-elevated p-4 border border-emerald-500/20">
                <p className="text-xs text-emerald-400 uppercase tracking-wider mb-1">Potential Savings</p>
                <p className="text-2xl font-bold text-emerald-400">-{savingsPct}%</p>
                <p className="text-sm text-zinc-400">vs most expensive</p>
              </div>
            )}
          </div>
        )}

        <div className="card-elevated overflow-hidden">
          <div className="hidden md:grid grid-cols-7 gap-4 px-6 py-3 bg-zinc-900/50 border-b border-zinc-800 text-xs font-medium text-zinc-500 uppercase tracking-wider">
            <div className="col-span-2">Provider</div>
            <div className="text-right">Input</div>
            <div className="text-right">Output</div>
            <div className="text-right">Total</div>
            <div className="text-right">per 1M</div>
            <div className="text-right">Context</div>
          </div>

          <div className="divide-y divide-zinc-800/50">
            {results.map((p) => {
              const isWinner = cheapest?.id === p.id;
              const isFree = p.input === null;
              return (
                <a key={p.id} href={p.link} target="_blank" rel="noopener noreferrer" className={`grid grid-cols-2 md:grid-cols-7 gap-2 md:gap-4 px-6 py-4 hover:bg-zinc-900/50 transition-colors group ${isWinner ? 'bg-emerald-950/20' : ''} ${isFree ? 'opacity-70' : ''}`}>
                  <div className="md:col-span-2 flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ backgroundColor: p.color + '33', color: p.color }}>{p.provider[0]}</div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-white group-hover:text-indigo-400 transition-colors truncate">{p.name}</span>
                        {isWinner && <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full flex-shrink-0">Best value</span>}
                        {isFree && <span className="text-xs font-medium text-zinc-400 bg-zinc-700/50 px-2 py-0.5 rounded-full flex-shrink-0">Free</span>}
                        {p.openSource && !isFree && <span className="text-xs font-medium text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full flex-shrink-0">Open Source</span>}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-xs text-zinc-500">{p.provider}</span>
                        <span className="text-xs text-zinc-600">&#xb7;</span>
                        <span className="text-xs text-zinc-600 capitalize">{p.supports.filter(s => ['vision','function','reasoning','coding'].includes(s)).join(', ')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right"><span className="md:hidden text-xs text-zinc-500 mr-2">Input:</span><span className={`text-sm ${p.inputCost !== null ? 'text-zinc-300' : 'text-zinc-600'}`}>{p.inputCost !== null ? `$${p.inputCost.toFixed(4)}` : 'Free'}</span></div>
                  <div className="text-right"><span className="md:hidden text-xs text-zinc-500 mr-2">Output:</span><span className={`text-sm ${p.outputCost !== null ? 'text-zinc-300' : 'text-zinc-600'}`}>{p.outputCost !== null ? `$${p.outputCost.toFixed(4)}` : 'Free'}</span></div>
                  <div className="text-right"><span className="md:hidden text-xs text-zinc-500 mr-2">Total:</span><span className={`text-lg font-semibold ${isWinner ? 'text-emerald-400' : p.total !== null ? 'text-white' : 'text-zinc-600'}`}>{p.total !== null ? `$${p.total.toFixed(4)}` : 'Free'}</span></div>
                  <div className="text-right"><span className="md:hidden text-xs text-zinc-500 mr-2">per 1M:</span><span className="text-sm text-zinc-400">{p.per1M !== null ? `$${p.per1M.toFixed(2)}` : '—'}</span></div>
                  <div className="text-right flex items-center justify-end gap-1">
                    <span className="text-sm text-zinc-400">{formatContext(p.contextWindow)}</span>
                    <svg className="w-3 h-3 text-zinc-600 group-hover:text-indigo-400 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-zinc-600 mt-4 text-center">Prices are indicative and may vary. Data as of April 2026. Always check provider pricing pages for latest rates.</p>
      </div>
    </div>
  );
}

function formatContext(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return n.toString();
}
