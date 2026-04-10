import { Metadata } from 'next';
import Link from 'next/link';
import Calculator from './Calculator';
import SubscribeForm from '../../components/SubscribeForm';

// ─── SEO Copy Framework: Meta Title/Description Variants (CTR Tests) ─────────
//
// Primary (A): Feature-led — emphasizes breadth and coverage
// Variant (B): Benefit-led — emphasizes savings and ease of use

export const metadata: Metadata = {
  title: 'AI Model Price Calculator — Compare LLM API Costs (2026)',
  description: 'Free AI model price calculator to compare GPT-4o, Claude, Gemini, Llama, DeepSeek and 75+ LLM API costs. Find the cheapest AI provider for your use case. Updated April 2026.',
  keywords: ['AI model price calculator', 'LLM API pricing', 'AI API cost comparison', 'GPT-4o price', 'Claude API cost', 'Gemini API pricing', 'AI provider comparison', 'token cost calculator', 'AI cheapest option'],
  openGraph: {
    title: 'AI Model Price Calculator — 75+ Models Compared',
    description: 'Compare AI API costs across OpenAI, Anthropic, Google, Meta, DeepSeek, and more. Updated April 2026.',
    type: 'website',
  },
};

// Variant B metadata for A/B CTR testing (not a Next.js Page export — internal only)
const META_VARIANT_B = {
  title: 'AI API Cost Calculator — Find the Cheapest LLM (75+ Models) | Decryptica',
  description: 'Stop overpaying for AI. Compare GPT-4o, Claude, Gemini pricing side-by-side and calculate your exact API spend. 100% free, no signup required.',
};

const faqData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How much does the GPT-4o API cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "GPT-4o costs $2.50 per 1M input tokens and $10.00 per 1M output tokens as of April 2026."
      }
    },
    {
      "@type": "Question",
      "name": "What is the cheapest AI API provider?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The cheapest AI API providers are typically open-source models like DeepSeek V3, Llama 3.1 8B, and Mistral Small 3.1 24B, which are free or cost fractions of a cent per 1M tokens."
      }
    },
    {
      "@type": "Question",
      "name": "How is AI API pricing calculated?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "AI API pricing is typically charged per 1,000 tokens (1K tokens ≈ 750 words). Input tokens (your prompts) and output tokens (the AI's responses) usually have different rates."
      }
    },
    {
      "@type": "Question",
      "name": "What is the difference between open source and commercial AI models?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Open source AI models like Llama and Mistral are free to use and can be self-hosted. Commercial models like GPT-4o and Claude require API payment but offer managed infrastructure and often higher quality."
      }
    }
  ]
};

// ─── SEO Copy Framework: Funnel-Stage CTA Blocks ────────────────────────────
// EXPLORE: Top of funnel — browse related AI content
// COMPARE: Mid funnel — use the calculator (primary action)
// START: Bottom of funnel — subscribe for updates when new models launch

function ToolCTAExplore() {
  return (
    <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-xl">
      <h3 className="font-display text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-2">Explore</h3>
      <p className="text-white font-medium mb-1">New to AI model selection?</p>
      <p className="text-zinc-400 text-sm mb-3">Read our expert comparisons before you pick a model.</p>
      <Link
        href="/topic/ai"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
      >
        Browse AI Tool Comparisons →
      </Link>
    </div>
  );
}

function ToolCTACompare() {
  return (
    <div className="p-5 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 border border-indigo-500/30 rounded-xl">
      <h3 className="font-display text-sm font-semibold text-blue-400 uppercase tracking-wider mb-2">Compare</h3>
      <p className="text-white font-medium mb-1">Ready to pick a model?</p>
      <p className="text-zinc-400 text-sm mb-3">Enter your token volumes above to see exactly how much each provider costs.</p>
      <p className="text-xs text-zinc-500">75+ models across 11 providers — updated April 2026</p>
    </div>
  );
}

function ToolCTAStart() {
  return (
    <div className="p-5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl">
      <h3 className="font-display text-sm font-semibold text-purple-400 uppercase tracking-wider mb-2">Get Started</h3>
      <p className="text-white font-medium mb-1">Want updates when models change price?</p>
      <p className="text-zinc-400 text-sm mb-3">New models launch every month. Get notified when we update the calculator.</p>
      <SubscribeForm />
    </div>
  );
}

export default function AIPriceCalculatorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
      />
      {/* SEO Copy Framework: Meta variant data for CTR testing */}
      <meta name="decryptica:meta:variant:a" content="feature-led" />
      <div>
        <Calculator />
      </div>
      {/* Funnel-Stage CTA Blocks */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12">
        <div className="grid md:grid-cols-3 gap-4 mt-0">
          <ToolCTAExplore />
          <ToolCTACompare />
          <ToolCTAStart />
        </div>
      </div>
    </>
  );
}
