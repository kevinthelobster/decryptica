'use client';

import { trackEvent } from '../lib/analytics';

interface FAQ {
  question: string;
  answer: string;
}

interface TrackedFAQSectionProps {
  faqs: FAQ[];
  articleSlug?: string;
}

export default function TrackedFAQSection({ faqs, articleSlug }: TrackedFAQSectionProps) {
  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t border-zinc-800">
      <h2 className="font-display text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <span className="text-indigo-400">❓</span> Frequently Asked Questions
      </h2>
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <details
            key={i}
            className="group bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden"
            onToggle={(e) => {
              const isOpen = (e.target as HTMLElement).getAttribute('open') !== null;
              if (isOpen) {
                trackEvent({
                  type: 'faq_expand',
                  articleSlug,
                  metadata: {
                    faqIndex: i,
                    question: faq.question.slice(0, 80),
                  },
                }).catch(() => undefined);
              }
            }}
          >
            <summary className="flex items-center justify-between cursor-pointer p-5 text-white font-medium list-none hover:bg-zinc-800/30 transition-colors">
              <span>{faq.question}</span>
              <span className="text-indigo-400 group-open:rotate-45 transition-transform text-xl ml-4">
                +
              </span>
            </summary>
            <div className="px-5 pb-5 text-zinc-400 leading-relaxed">
              {faq.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
