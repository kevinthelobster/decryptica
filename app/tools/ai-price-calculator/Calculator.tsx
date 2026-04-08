'use client';

import { useState, useMemo } from 'react';

// Provider data (prices as of April 2026)
const PROVIDERS = [
  {
    id: 'openai-gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    input: 0.0025,   // per 1K tokens
    output: 0.01,
    supports: ['text', 'vision', 'function'],
    color: '#10a37f',
    link: 'https://openai.com/api/pricing',
    affiliate: false,
  },
  {
    id: 'openai-gpt-4o-mini',
    name: 'GPT-4o mini',
    provider: 'OpenAI',
    input: 0.00015,
    output: 0.0006,
    supports: ['text', 'vision', 'function'],
    color: '#10a37f',
    link: 'https://openai.com/api/pricing',
    affiliate: false,
  },
  {
    id: 'anthropic-sonnet-4',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    input: 0.003,
    output: 0.015,
    supports: ['text', 'vision', 'function', 'extended'],
    color: '#d4a574',
    link: 'https://www.anthropic.com/api/pricing',
    affiliate: false,
  },
  {
    id: 'anthropic-haiku-3',
    name: 'Claude 3.5 Haiku',
    provider: 'Anthropic',
    input: 0.0008,
    output: 0.004,
    supports: ['text', 'vision', 'function'],
    color: '#d4a574',
    link: 'https://www.anthropic.com/api/pricing',
    affiliate: false,
  },
  {
    id: 'anthropic-opus-4',
    name: 'Claude Opus 4.6',
    provider: 'Anthropic',
    input: 0.005,
    output: 0.025,
    supports: ['text', 'vision', 'function', 'extended'],
    color: '#d4a574',
    link: 'https://www.anthropic.com/api/pricing',
    affiliate: false,
  },
  {
    id: 'minimax-m2.7',
    name: 'MiniMax M2.7',
    provider: 'MiniMax',
    input: 0.0003,
    output: 0.0012,
    supports: ['text', 'function'],
    color: '#00d474',
    link: 'https://platform.minimax.io/docs/pricing/overview',
    affiliate: false,
  },
  {
    id: 'minimax-m2.5',
    name: 'MiniMax M2.5',
    provider: 'MiniMax',
    input: 0.0003,
    output: 0.0012,
    supports: ['text', 'function'],
    color: '#00d474',
    link: 'https://platform.minimax.io/docs/pricing/overview',
    affiliate: false,
  },
  {
    id: 'google-gemini-2-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    input: 0.0001,
    output: 0.0004,
    supports: ['text', 'vision', 'function'],
    color: '#4285f4',
    link: 'https://ai.google.dev/pricing',
    affiliate: false,
  },
  {
    id: 'google-gemini-1-5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'Google',
    input: 0.000075,
    output: 0.0003,
    supports: ['text', 'vision', 'function'],
    color: '#4285f4',
    link: 'https://ai.google.dev/pricing',
    affiliate: false,
  },
  {
    id: 'xai-grok-2',
    name: 'Grok 2',
    provider: 'xAI',
    input: 0.002,
    output: 0.008,
    supports: ['text', 'function'],
    color: '#f97316',
    link: 'https://x.ai/api',
    affiliate: false,
  },
  {
    id: 'mistral-large',
    name: 'Mistral Large',
    provider: 'Mistral',
    input: 0.002,
    output: 0.006,
    supports: ['text', 'function'],
    color: '#cb20dd',
    link: 'https://mistral.ai/technology',
    affiliate: false,
  },
  {
    id: 'cohere-command-r',
    name: 'Command R+',
    provider: 'Cohere',
    input: 0.003,
    output: 0.015,
    supports: ['text', 'vision', 'function'],
    color: '#f47b5a',
    link: 'https://cohere.com/api',
    affiliate: false,
  },
];

function formatCost(cents: number): string {
  if (cents < 0.01) return `$${cents.toFixed(4)}`;
  if (cents < 1) return `$${cents.toFixed(3)}`;
  return `$${cents.toFixed(2)}`;
}

function formatLargeNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

type SortKey = 'total' | 'input' | 'output';

export default function AIPriceCalculator() {
  const [inputTokens, setInputTokens] = useState<string>('100000');
  const [outputTokens, setOutputTokens] = useState<string>('20000');
  const [sortKey, setSortKey] = useState<SortKey>('total');
  const [filter, setFilter] = useState<string>('all');

  const inputNum = parseInt(inputTokens.replace(/,/g, '')) || 0;
  const outputNum = parseInt(outputTokens.replace(/,/g, '')) || 0;

  const results = useMemo(() => {
    return PROVIDERS
      .filter(p => filter === 'all' || p.supports.includes(filter))
      .map(p => {
        const inputCost = (p.input * inputNum) / 1000;
        const outputCost = (p.output * outputNum) / 1000;
        const total = inputCost + outputCost;
        const per1M = total / (inputNum + outputNum) * 1_000_000;
        return { ...p, inputCost, outputCost, total, per1M };
      })
      .sort((a, b) => {
        if (sortKey === 'total') return a.total - b.total;
        if (sortKey === 'input') return a.inputCost - b.inputCost;
        return a.outputCost - b.outputCost;
      });
  }, [inputNum, outputNum, sortKey, filter]);

  const cheapest = results[0];
  const priciest = results[results.length - 1];
  const savings = priciest.total - cheapest.total;
  const savingsPct = priciest.total > 0 ? ((savings / priciest.total) * 100).toFixed(0) : '0';

  const totalTokens = inputNum + outputNum;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Controls */}
        <div className="card-elevated p-6 mb-6">
          <div className="grid md:grid-cols-4 gap-4 md:gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Input Tokens</label>
              <input
                type="text"
                value={inputTokens}
                onChange={e => setInputTokens(e.target.value.replace(/[^0-9,]/g, ''))}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <p className="text-xs text-zinc-500 mt-1">Prompts, system messages</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Output Tokens</label>
              <input
                type="text"
                value={outputTokens}
                onChange={e => setOutputTokens(e.target.value.replace(/[^0-9,]/g, ''))}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <p className="text-xs text-zinc-500 mt-1">Responses generated</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Sort By</label>
              <select
                value={sortKey}
                onChange={e => setSortKey(e.target.value as SortKey)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="total">Total Cost</option>
                <option value="input">Input Cost</option>
                <option value="output">Output Cost</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Filter</label>
              <select
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="all">All Providers</option>
                <option value="vision">Vision Support</option>
                <option value="function">Function Calling</option>
              </select>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {totalTokens > 0 && (
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="card-elevated p-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Total Tokens</p>
              <p className="text-2xl font-bold text-white">{formatLargeNumber(totalTokens)}</p>
            </div>
            <div className="card-elevated p-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Cheapest</p>
              <p className="text-2xl font-bold text-emerald-400">{cheapest.name}</p>
              <p className="text-sm text-zinc-400">{formatCost(cheapest.total)}</p>
            </div>
            <div className="card-elevated p-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Most Expensive</p>
              <p className="text-2xl font-bold text-red-400">{priciest.name}</p>
              <p className="text-sm text-zinc-400">{formatCost(priciest.total)}</p>
            </div>
            <div className="card-elevated p-4 border border-emerald-500/20">
              <p className="text-xs text-emerald-400 uppercase tracking-wider mb-1">Potential Savings</p>
              <p className="text-2xl font-bold text-emerald-400">-{savingsPct}%</p>
              <p className="text-sm text-zinc-400">vs priciest option</p>
            </div>
          </div>
        )}

        {/* Results Table */}
        <div className="card-elevated overflow-hidden">
          {/* Header */}
          <div className="hidden md:grid grid-cols-6 gap-4 px-6 py-3 bg-zinc-900/50 border-b border-zinc-800 text-xs font-medium text-zinc-500 uppercase tracking-wider">
            <div className="col-span-2">Provider</div>
            <div className="text-right">Input</div>
            <div className="text-right">Output</div>
            <div className="text-right">Total</div>
            <div className="text-right">per 1M tokens</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-zinc-800/50">
            {results.map((p, i) => {
              const isWinner = i === 0 && totalTokens > 0;
              return (
                <a
                  key={p.id}
                  href={p.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`grid md:grid-cols-6 gap-2 md:gap-4 px-6 py-4 hover:bg-zinc-900/50 transition-colors group ${isWinner ? 'bg-emerald-950/20' : ''}`}
                >
                  {/* Provider info */}
                  <div className="md:col-span-2 flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: p.color + '33', color: p.color }}
                    >
                      {p.provider[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white group-hover:text-indigo-400 transition-colors">
                          {p.name}
                        </span>
                        {isWinner && (
                          <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                            Best value
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-zinc-500">{p.provider}</span>
                    </div>
                  </div>

                  {/* Input cost */}
                  <div className="md:text-right">
                    <span className="md:hidden text-xs text-zinc-500 mr-2">Input:</span>
                    <span className="text-sm text-zinc-300">${p.inputCost.toFixed(4)}</span>
                    <span className="text-xs text-zinc-500 ml-1">/ {formatLargeNumber(inputNum)}</span>
                  </div>

                  {/* Output cost */}
                  <div className="md:text-right">
                    <span className="md:hidden text-xs text-zinc-500 mr-2">Output:</span>
                    <span className="text-sm text-zinc-300">${p.outputCost.toFixed(4)}</span>
                    <span className="text-xs text-zinc-500 ml-1">/ {formatLargeNumber(outputNum)}</span>
                  </div>

                  {/* Total */}
                  <div className="md:text-right">
                    <span className="md:hidden text-xs text-zinc-500 mr-2">Total:</span>
                    <span className={`text-lg font-semibold ${isWinner ? 'text-emerald-400' : 'text-white'}`}>
                      {formatCost(p.total)}
                    </span>
                  </div>

                  {/* Per 1M */}
                  <div className="md:text-right flex items-center md:justify-end gap-1">
                    <span className="text-sm text-zinc-400">${p.per1M.toFixed(2)}</span>
                    <svg className="w-3 h-3 text-zinc-600 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-xs text-zinc-600 mt-4 text-center">
          Prices are indicative and may vary. Data as of April 2026. Always check provider pricing pages for latest rates.
        </p>
      </div>
    </div>
  );
}
