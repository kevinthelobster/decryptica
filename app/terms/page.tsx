import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Decryptica',
  description: 'Terms of service for Decryptica.',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="card-elevated p-8 md:p-12">
        <h1 className="section-heading mb-6">Terms of Service</h1>
        <p className="text-zinc-400 text-sm mb-8">Effective: April 13, 2026 | Last updated: April 13, 2026</p>
        
        <div className="prose prose-invert prose-zinc space-y-6">
          <p className="text-zinc-300 leading-relaxed">
            Welcome to Decryptica. These Terms of Service ("Terms") govern your access to and use of the Decryptica website, content, and services (collectively, the "Services") operated by Renegade Reels LLC ("we," "us," or "our").
          </p>
          
          <h2 className="font-display text-xl font-semibold text-white mt-8 mb-3">1. Acceptance of Terms</h2>
          <p className="text-zinc-300 leading-relaxed">
            By accessing or using our Services, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Services.
          </p>
          
          <h2 className="font-display text-xl font-semibold text-white mt-8 mb-3">2. Description of Services</h2>
          <p className="text-zinc-300 leading-relaxed">
            Decryptica provides technical intelligence content related to cryptocurrency, artificial intelligence, and automation. This includes articles, tools, guides, and other informational resources.
          </p>
          
          <h2 className="font-display text-xl font-semibold text-white mt-8 mb-3">3. No Financial Advice</h2>
          <p className="text-zinc-300 leading-relaxed">
            The content published on Decryptica is for informational and educational purposes only. Nothing on this site constitutes financial, investment, legal, or tax advice. You should consult a qualified professional before making any financial decisions. We are not responsible for any losses incurred as a result of actions taken based on content from this site.
          </p>
          
          <h2 className="font-display text-xl font-semibold text-white mt-8 mb-3">4. Affiliate Disclosure</h2>
          <p className="text-zinc-300 leading-relaxed">
            Decryptica may participate in affiliate marketing programs. This means we may receive commissions when you click certain links on our site and make a purchase or sign up for a service. We are transparent about these relationships. For full details, see our <a href="/affiliate-disclosure" className="text-indigo-400 hover:text-indigo-300">Affiliate Disclosure</a> page.
          </p>
          
          <h2 className="font-display text-xl font-semibold text-white mt-8 mb-3">5. Intellectual Property</h2>
          <p className="text-zinc-300 leading-relaxed">
            All content on this site—including text, graphics, logos, and software—is the property of Renegade Reels LLC or its content suppliers and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.
          </p>
          
          <h2 className="font-display text-xl font-semibold text-white mt-8 mb-3">6. User Conduct</h2>
          <p className="text-zinc-300 leading-relaxed">
            You agree not to use the Services for any unlawful purpose or in any way that could damage, disable, or impair the Services. You may not attempt to gain unauthorized access to any part of the site.
          </p>
          
          <h2 className="font-display text-xl font-semibold text-white mt-8 mb-3">7. Disclaimer of Warranties</h2>
          <p className="text-zinc-300 leading-relaxed">
            THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICES WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
          </p>
          
          <h2 className="font-display text-xl font-semibold text-white mt-8 mb-3">8. Limitation of Liability</h2>
          <p className="text-zinc-300 leading-relaxed">
            To the fullest extent permitted by law, Renegade Reels LLC shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the Services.
          </p>
          
          <h2 className="font-display text-xl font-semibold text-white mt-8 mb-3">9. Privacy</h2>
          <p className="text-zinc-300 leading-relaxed">
            Your privacy is important to us. Please review our <a href="/privacy" className="text-indigo-400 hover:text-indigo-300">Privacy Policy</a> to understand how we collect, use, and safeguard your information.
          </p>
          
          <h2 className="font-display text-xl font-semibold text-white mt-8 mb-3">10. Changes to These Terms</h2>
          <p className="text-zinc-300 leading-relaxed">
            We reserve the right to modify these Terms at any time. Any changes will be effective immediately upon posting on this page. Your continued use of the Services after any changes constitutes acceptance of the updated Terms.
          </p>
          
          <h2 className="font-display text-xl font-semibold text-white mt-8 mb-3">11. Governing Law</h2>
          <p className="text-zinc-300 leading-relaxed">
            These Terms shall be governed by and construed in accordance with the laws of the State of Ohio, United States, without regard to its conflict of law provisions.
          </p>
          
          <h2 className="font-display text-xl font-semibold text-white mt-8 mb-3">12. Contact</h2>
          <p className="text-zinc-300 leading-relaxed">
            If you have any questions about these Terms, please contact us at <a href="mailto:brian@renegadereels.com" className="text-indigo-400 hover:text-indigo-300">brian@renegadereels.com</a>.
          </p>
          
          <h2 className="font-display text-xl font-semibold text-white mt-8 mb-3">13. Business Information</h2>
          <div className="p-6 bg-zinc-800/30 rounded-xl space-y-2 text-zinc-300">
            <p><strong className="text-white">Legal Entity Name:</strong> Renegade Reels LLC</p>
            <p><strong className="text-white">State of Registration:</strong> Ohio, United States</p>
            <p><strong className="text-white">Business Contact:</strong> <a href="mailto:brian@renegadereels.com" className="text-indigo-400 hover:text-indigo-300">brian@renegadereels.com</a></p>
            <p><strong className="text-white">Website:</strong> decryptica.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
