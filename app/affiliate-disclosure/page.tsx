import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Affiliate Disclosure | Decryptica',
  description: 'Affiliate disclosure policy for Decryptica.',
};

export default function AffiliateDisclosurePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="card-elevated p-8 md:p-12">
        <h1 className="section-heading mb-6">Affiliate Disclosure</h1>
        <p className="text-zinc-400 text-sm mb-8">Effective: April 13, 2026 | Last updated: April 13, 2026</p>
        
        <div className="prose prose-invert prose-zinc space-y-6">
          <p className="text-zinc-300 leading-relaxed">
            Decryptica is a participant in various affiliate marketing programs. This means we may earn commissions from qualifying purchases or sign-ups made through links on our site. This page explains how affiliate relationships work on Decryptica and how we maintain transparency with our readers.
          </p>
          
          <div className="p-6 bg-indigo-900/20 border border-indigo-500/30 rounded-xl">
            <p className="text-indigo-200 font-medium leading-relaxed">
              <strong>FTC Disclosure:</strong> The Federal Trade Commission requires us to disclose that we may earn an affiliate commission at no additional cost to you when you click certain links on our site and make a purchase or sign up for a service. We only recommend products, services, and tools we believe deliver genuine value.
            </p>
          </div>
          
          <h2 className="font-display text-xl font-semibold text-white mt-8 mb-3">How Affiliate Marketing Works</h2>
          <p className="text-zinc-300 leading-relaxed">
            When you click an affiliate link on Decryptica and complete a purchase or sign-up, the affiliate program operator typically pays us a small commission. These commissions help support Decryptica's operations and content creation. The price you pay is not affected by our use of affiliate links—you pay the same price whether you use our link or go directly to the merchant.
          </p>
          
          <h2 className="font-display text-xl font-semibold text-white mt-8 mb-3">What We Affiliate Promote</h2>
          <p className="text-zinc-300 leading-relaxed">
            We may promote products and services related to our content areas, including but not limited to:
          </p>
          <ul className="space-y-2 text-zinc-300 list-disc list-inside">
            <li>AI tools and platforms</li>
            <li>Crypto exchanges, wallets, and DeFi protocols</li>
            <li>Automation and productivity software</li>
            <li>Learning platforms and educational resources</li>
            <li>Hosting and developer tools</li>
          </ul>
          
          <h2 className="font-display text-xl font-semibold text-white mt-8 mb-3">How We Choose What to Promote</h2>
          <p className="text-zinc-300 leading-relaxed">
            We only promote products, services, and tools that we have personally evaluated or believe genuinely deliver value to our readers. We do not accept payment in exchange for reviews or recommendations. Our affiliate relationships do not influence our editorial decisions or the content we produce.
          </p>
          
          <h2 className="font-display text-xl font-semibold text-white mt-8 mb-3">Our Promise to You</h2>
          <p className="text-zinc-300 leading-relaxed">
            Decryptica is committed to editorial independence. Our affiliate relationships are disclosed clearly on this page and throughout the site. If you have questions about specific affiliate relationships, please contact us at <a href="mailto:brian@renegadereels.com" className="text-indigo-400 hover:text-indigo-300">brian@renegadereels.com</a>.
          </p>
          
          <h2 className="font-display text-xl font-semibold text-white mt-8 mb-3">Updates to This Disclosure</h2>
          <p className="text-zinc-300 leading-relaxed">
            This affiliate disclosure may be updated at any time to reflect new programs or changes to our promotional practices. Any material changes will be noted with an updated effective date.
          </p>
          
          <h2 className="font-display text-xl font-semibold text-white mt-8 mb-3">Business Information</h2>
          <div className="p-6 bg-zinc-800/30 rounded-xl space-y-2 text-zinc-300">
            <p><strong className="text-white">Legal Entity:</strong> Renegade Reels LLC</p>
            <p><strong className="text-white">Business Contact:</strong> <a href="mailto:brian@renegadereels.com" className="text-indigo-400 hover:text-indigo-300">brian@renegadereels.com</a></p>
            <p><strong className="text-white">Website:</strong> decryptica.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
