import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About | Decryptica',
  description: 'About Decryptica - Technical intelligence for the curious mind.',
};

import Link from "next/link";
import { absoluteUrl, getBreadcrumbSchema, jsonLdScript } from '../lib/schema';

export default function AboutPage() {
  const aboutPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About Decryptica',
    description: 'About Decryptica - Technical intelligence for the curious mind.',
    url: absoluteUrl('/about'),
    isPartOf: { '@id': `${absoluteUrl()}/#website` },
    about: { '@id': `${absoluteUrl()}/#organization` },
  };

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(aboutPageSchema)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumbSchema)} />
      <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="card-elevated p-8 md:p-12">
        <h1 className="section-heading mb-6">About Decryptica</h1>
        
        <div className="prose prose-invert prose-zinc">
          <p className="text-stone-700 text-lg leading-relaxed mb-6">
            Decryptica was born from a simple frustration: the internet is flooded with shallow content that recycles the same surface-level takes. We wanted something different.
          </p>
          
          <p className="text-stone-700 leading-relaxed mb-6">
            We decode the complex world of crypto, AI, and automation into actionable insights. No fluff. No hype. Just real technical depth for people who want to understand what's actually happening.
          </p>
          
          <h2 className="font-display text-xl font-semibold text-stone-950 mt-8 mb-4">Our Mission</h2>
          <p className="text-stone-700 leading-relaxed mb-6">
            To equip developers, traders, and technologists with the technical intelligence they need to stay ahead of the curve. We believe in proof over promises—and we back that up with code.
          </p>
          
          <h2 className="font-display text-xl font-semibold text-stone-950 mt-8 mb-4">What We Cover</h2>
          <ul className="space-y-2 text-stone-700 mb-6">
            <li>• <strong className="text-stone-950">Crypto & DeFi</strong> — Blockchain protocols, trading strategies, market analysis</li>
            <li>• <strong className="text-stone-950">Artificial Intelligence</strong> — LLMs, AI agents, local AI, prompt engineering</li>
            <li>• <strong className="text-stone-950">Automation</strong> — Workflows, n8n, scripting, productivity systems</li>
          </ul>
          
          <h2 className="font-display text-xl font-semibold text-stone-950 mt-8 mb-4">Built By</h2>
          <p className="text-stone-700 leading-relaxed">
            Decryptica is built by the team at <strong className="text-stone-950">Renegade Reels</strong>—a company dedicated to building tools and content that help people understand emerging technology.
          </p>
          
          <h2 className="font-display text-xl font-semibold text-stone-950 mt-8 mb-4">Business Identity</h2>
          <div className="p-6 bg-stone-50  space-y-2 text-stone-700">
            <p><strong className="text-stone-950">Legal Entity Name:</strong> Renegade Reels LLC</p>
            <p><strong className="text-stone-950">State of Registration:</strong> Ohio, United States</p>
            <p><strong className="text-stone-950">Business Contact:</strong> <a href="mailto:brian@renegadereels.com" className="text-red-800 hover:text-red-700">brian@renegadereels.com</a></p>
            <p><strong className="text-stone-950">Website:</strong> decryptica.com</p>
          </div>
          
          <h2 className="font-display text-xl font-semibold text-stone-950 mt-8 mb-4">Legal</h2>
          <ul className="space-y-2 text-stone-700">
            <li><Link href="/terms" className="text-red-800 hover:text-red-700">Terms of Service</Link></li>
            <li><Link href="/affiliate-disclosure" className="text-red-800 hover:text-red-700">Affiliate Disclosure</Link></li>
            <li><Link href="/privacy" className="text-red-800 hover:text-red-700">Privacy Policy</Link></li>
          </ul>
        </div>
      </div>
    </div>
    </>
  );
}
