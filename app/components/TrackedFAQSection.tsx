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
    <section className="mt-12 border-t border-stone-200 pt-8">
      <h2 className="mb-6 flex items-center gap-2 font-display text-2xl font-bold text-stone-950">
        Frequently Asked Questions
      </h2>
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <details
            key={i}
            className="group overflow-hidden border border-stone-200 bg-white"
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
            <summary className="flex cursor-pointer list-none items-center justify-between p-5 font-medium text-stone-950 transition-colors hover:bg-neutral-50">
              <span>{faq.question}</span>
              <span className="ml-4 text-xl text-red-900 transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <div className="px-5 pb-5 leading-relaxed text-stone-700">
              {faq.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
