import { Metadata } from 'next';
import Link from 'next/link';
import { absoluteUrl, getBreadcrumbSchema, jsonLdScript } from '../lib/schema';

export const metadata: Metadata = {
  title: 'Contact | Decryptica',
  description: 'Get in touch with Decryptica for editorial questions, partnerships, and business inquiries.',
};

export default function ContactPage() {
  const contactPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact Decryptica',
    description: 'Get in touch with Decryptica for editorial questions, partnerships, and business inquiries.',
    url: absoluteUrl('/contact'),
    isPartOf: { '@id': `${absoluteUrl()}/#website` },
  };

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Contact', path: '/contact' },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(contactPageSchema)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumbSchema)} />
      <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="card-elevated p-8 md:p-12">
        <h1 className="section-heading mb-6">Get in Touch</h1>

        <p className="text-stone-700 text-lg leading-relaxed mb-8">
          Have a question, a partnership idea, or feedback on something we published? We&apos;d love to hear from you.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="p-6 bg-stone-50 ">
            <h2 className="font-display font-semibold text-stone-950 mb-2">General Contact</h2>
            <p className="text-stone-700 mb-3">
              For reader questions, feedback, corrections, and general inquiries.
            </p>
            <a href="mailto:hello@decryptica.com" className="text-red-800 hover:text-red-700">
              hello@decryptica.com
            </a>
          </div>

          <div className="p-6 bg-stone-50 ">
            <h2 className="font-display font-semibold text-stone-950 mb-2">Business Inquiries</h2>
            <p className="text-stone-700 mb-3">
              For partnerships, media, sponsorships, and commercial opportunities.
            </p>
            <a href="mailto:brian@renegadereels.com" className="text-red-800 hover:text-red-700">
              brian@renegadereels.com
            </a>
          </div>
        </div>

        <div className="mt-6 p-6 bg-stone-50 ">
          <h2 className="font-display font-semibold text-stone-950 mb-3">What helps us reply faster</h2>
          <ul className="space-y-2 text-stone-700">
            <li>• Use a clear subject line that explains your request.</li>
            <li>• Include relevant links, screenshots, or article URLs when reporting an issue.</li>
            <li>• If you&apos;re reaching out about a partnership, include your company name and goals.</li>
          </ul>
        </div>

        <div className="mt-6 p-6 bg-stone-50 ">
          <h2 className="font-display font-semibold text-stone-950 mb-3">Response expectations</h2>
          <p className="text-stone-700 leading-relaxed">
            We aim to respond to legitimate inquiries within 2 to 3 business days. Messages that are incomplete, promotional, or unrelated to Decryptica may not receive a reply.
          </p>
        </div>

        <div className="mt-6 p-6 bg-stone-50 ">
          <h2 className="font-display font-semibold text-stone-950 mb-3">Legal and privacy requests</h2>
          <p className="text-stone-700 leading-relaxed mb-3">
            For privacy-related questions, data requests, or policy details, you can also review our legal pages before contacting us.
          </p>
          <div className="flex flex-wrap gap-4 text-sm">
            <Link href="/privacy" className="text-red-800 hover:text-red-700">Privacy Policy</Link>
            <Link href="/terms" className="text-red-800 hover:text-red-700">Terms of Service</Link>
            <Link href="/affiliate-disclosure" className="text-red-800 hover:text-red-700">Affiliate Disclosure</Link>
          </div>
        </div>

        <div className="mt-6 p-6 bg-stone-50 ">
          <h2 className="font-display font-semibold text-stone-950 mb-2">Business Identity</h2>
          <p className="text-stone-700 leading-relaxed">
            <strong className="text-stone-950">Legal Entity:</strong> Renegade Reels LLC<br />
            <strong className="text-stone-950">State of Registration:</strong> Ohio, United States<br />
            <strong className="text-stone-950">Website:</strong> decryptica.com
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
