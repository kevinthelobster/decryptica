import { Metadata } from 'next';
import Link from 'next/link';
import Calculator from './Calculator';
import SubscribeForm from '../../components/SubscribeForm';
import DestinationConfidenceLayer from '../../components/DestinationConfidenceLayer';

// ─── SEO Copy Framework: Meta Title/Description Variants (CTR Tests) ─────────
//
// Primary (A): Feature-led — emphasizes breadth and coverage
// Variant (B): Benefit-led — emphasizes savings and ease of use

export const metadata: Metadata = {
  title: 'AI Model Price Calculator — Compare LLM API Costs (2026)',
  description: 'Free AI model price calculator to compare GPT-5.6, Claude, Gemini, DeepSeek, Grok, Mistral and more. Find the cheapest AI provider for your use case. Updated July 2026.',
  keywords: ['AI model price calculator', 'LLM API pricing', 'AI API cost comparison', 'GPT-5.6 price', 'Claude API cost', 'Gemini API pricing', 'AI provider comparison', 'token cost calculator', 'AI cheapest option'],
  openGraph: {
    title: 'AI Model Price Calculator — Latest Models Compared',
    description: 'Compare AI API costs across OpenAI, Anthropic, Google, DeepSeek, xAI, Mistral, and more. Updated July 2026.',
    type: 'website',
  },
};

// Variant B metadata for A/B CTR testing (not a Next.js Page export — internal only)
const META_VARIANT_B = {
  title: 'AI API Cost Calculator — Find the Cheapest LLM | Decryptica',
  description: 'Stop overpaying for AI. Compare GPT-5.6, Claude, Gemini pricing side-by-side and calculate your exact API spend. 100% free, no signup required.',
};

const faqData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How much does the GPT-5.6 Sol API cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "GPT-5.6 Sol costs $5.00 per 1M input tokens and $30.00 per 1M output tokens on standard short-context OpenAI API pricing as of July 2026."
      }
    },
    {
      "@type": "Question",
      "name": "What is the cheapest AI API provider?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The cheapest listed production APIs are typically small routing models like Amazon Nova Micro, Gemini 2.5 Flash-Lite, DeepSeek V4 Flash, and Mistral Small 4. The best choice depends on quality needs, context length, and provider fit."
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
        "text": "Open-weight models like DeepSeek and Mistral publish model weights that can be self-hosted, but managed API usage is still billed by the provider. Closed commercial models like GPT-5.6 and Claude are API products with managed infrastructure and provider-hosted availability."
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
    <div className="p-5 bg-white border border-stone-200 ">
      <h3 className="font-display text-sm font-semibold text-red-800 uppercase tracking-wider mb-2">Explore</h3>
      <p className="text-stone-950 font-medium mb-1">New to AI model selection?</p>
      <p className="text-stone-600 text-sm mb-3">Read our expert comparisons before you pick a model.</p>
      <Link
        href="/topic/ai/tooling"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-red-800 hover:text-red-700 transition-colors"
      >
        Browse AI Tool Comparisons →
      </Link>
    </div>
  );
}

function ToolCTACompare() {
  return (
    <div className="p-5 bg-white border border-stone-200 ">
      <h3 className="font-display text-sm font-semibold text-red-800 uppercase tracking-wider mb-2">Compare</h3>
      <p className="text-stone-950 font-medium mb-1">Ready to pick a model?</p>
      <p className="text-stone-600 text-sm mb-3">Enter your token volumes above to see exactly how much each provider costs.</p>
      <p className="text-xs text-stone-500">Current production models across major API providers — updated July 2026</p>
    </div>
  );
}

function ToolCTAStart() {
  return (
    <div className="p-5 bg-white border border-stone-200 ">
      <h3 className="font-display text-sm font-semibold text-red-800 uppercase tracking-wider mb-2">Get Started</h3>
      <p className="text-stone-950 font-medium mb-1">Want updates when models change price?</p>
      <p className="text-stone-600 text-sm mb-3">New models launch every month. Get notified when we update the calculator.</p>
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
      <DestinationConfidenceLayer pageType="calculator" />
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
