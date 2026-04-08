import { Metadata } from 'next';
import Calculator from './Calculator';

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

export default function AIPriceCalculatorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
      />
      <Calculator />
    </>
  );
}
