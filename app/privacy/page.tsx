import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | Decryptica',
  description: 'How Decryptica collects, uses, protects, and discloses reader data.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="card-elevated p-8 md:p-12">
        <h1 className="section-heading mb-6">Privacy Policy</h1>
        
        <div className="prose prose-invert prose-zinc space-y-6">
          <p className="text-stone-600 text-sm mb-8">
            Effective: July 25, 2026 | Last updated: July 25, 2026
          </p>
          
          <p className="text-stone-700 leading-relaxed mb-6">
            Decryptica is operated by Renegade Reels LLC ("we," "us," or "our"). This Privacy Policy explains what information we collect, how we use it, and the choices you have when you use decryptica.com.
          </p>
          
          <h2 className="font-display text-xl font-semibold text-stone-950 mt-8 mb-4">Information We Collect</h2>
          <ul className="space-y-2 text-stone-700 mb-6 list-disc list-inside">
            <li><strong className="text-stone-950">Newsletter information:</strong> If you subscribe, we collect your email address and store subscription details so we can send Decryptica updates.</li>
            <li><strong className="text-stone-950">Usage analytics:</strong> We collect basic site activity such as page views, article clicks, button clicks, scroll depth, referring pages, device/browser information, and approximate location derived from network data.</li>
            <li><strong className="text-stone-950">Affiliate and conversion events:</strong> If you click an outbound affiliate or partner link, we may record the page, link destination, campaign, and anonymous session details so we can measure performance.</li>
            <li><strong className="text-stone-950">Voluntary messages:</strong> If you contact us, submit a form, or send a partnership inquiry, we collect the information you choose to provide.</li>
          </ul>
          
          <h2 className="font-display text-xl font-semibold text-stone-950 mt-8 mb-4">How We Use Information</h2>
          <ul className="space-y-2 text-stone-700 mb-6 list-disc list-inside">
            <li>Send newsletter updates and manage unsubscribe requests.</li>
            <li>Measure traffic, article performance, subscriptions, and affiliate link activity.</li>
            <li>Improve Decryptica content, tools, site speed, and reader experience.</li>
            <li>Detect spam, abuse, security issues, and technical failures.</li>
            <li>Respond to reader, business, sponsorship, and partnership inquiries.</li>
          </ul>

          <h2 className="font-display text-xl font-semibold text-stone-950 mt-8 mb-4">Cookies and Tracking</h2>
          <p className="text-stone-700 leading-relaxed mb-6">
            Decryptica may use cookies, local storage, analytics pixels, and similar technologies to operate the site, remember basic preferences, measure performance, and understand how readers move through the site. Third-party services may also set cookies or collect limited technical data when their tools are loaded.
          </p>
          <p className="text-stone-700 leading-relaxed mb-6">
            You can block or delete cookies in your browser settings. Some site features may not work as expected if cookies or local storage are disabled.
          </p>

          <h2 className="font-display text-xl font-semibold text-stone-950 mt-8 mb-4">Third-Party Services</h2>
          <p className="text-stone-700 leading-relaxed mb-6">
            We use service providers to operate and improve Decryptica, including hosting, analytics, email delivery, database storage, and performance monitoring providers. These may include Vercel Analytics, Vercel Speed Insights, Vercel KV, Buttondown, and similar tools we add for site operations.
          </p>
          <p className="text-stone-700 leading-relaxed mb-6">
            We may also link to third-party products, tools, exchanges, wallets, software services, and affiliate partners. Once you leave Decryptica, the destination site's privacy policy controls its own data practices.
          </p>

          <h2 className="font-display text-xl font-semibold text-stone-950 mt-8 mb-4">Advertising and Affiliate Links</h2>
          <p className="text-stone-700 leading-relaxed mb-6">
            Decryptica may display ads, participate in affiliate programs, or receive compensation when readers click certain links or sign up for partner services. Affiliate links do not change the price you pay. For more detail, read our <Link href="/affiliate-disclosure" className="text-red-800 hover:text-red-700">Affiliate Disclosure</Link>.
          </p>

          <h2 className="font-display text-xl font-semibold text-stone-950 mt-8 mb-4">How We Share Information</h2>
          <p className="text-stone-700 leading-relaxed mb-6">
            We do not sell your personal information. We share information only with service providers that help us operate Decryptica, when needed to comply with law, to protect the site and our rights, or as part of a business transfer involving Renegade Reels LLC or Decryptica.
          </p>

          <h2 className="font-display text-xl font-semibold text-stone-950 mt-8 mb-4">Data Retention</h2>
          <p className="text-stone-700 leading-relaxed mb-6">
            We keep newsletter subscriber information until you unsubscribe or ask us to delete it. Analytics and KPI events are generally retained for up to 90 days unless we need a longer period for security, debugging, legal, or business record purposes.
          </p>
          
          <h2 className="font-display text-xl font-semibold text-stone-950 mt-8 mb-4">Your Choices and Rights</h2>
          <p className="text-stone-700 leading-relaxed mb-6">
            You can unsubscribe from our newsletter using the unsubscribe link in any email. You can also ask us to access, correct, or delete information associated with your email address. Depending on where you live, you may have additional privacy rights under state, national, or regional law.
          </p>

          <h2 className="font-display text-xl font-semibold text-stone-950 mt-8 mb-4">Children's Privacy</h2>
          <p className="text-stone-700 leading-relaxed mb-6">
            Decryptica is not directed to children under 13, and we do not knowingly collect personal information from children under 13.
          </p>

          <h2 className="font-display text-xl font-semibold text-stone-950 mt-8 mb-4">Changes to This Policy</h2>
          <p className="text-stone-700 leading-relaxed mb-6">
            We may update this Privacy Policy as Decryptica changes. When we make material updates, we will revise the date at the top of this page.
          </p>
          
          <h2 className="font-display text-xl font-semibold text-stone-950 mt-8 mb-4">Contact</h2>
          <p className="text-stone-700 leading-relaxed">
            Questions or privacy requests? Contact Renegade Reels LLC at <a href="mailto:brian@renegadereels.com" className="text-red-800 hover:text-red-700">brian@renegadereels.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
