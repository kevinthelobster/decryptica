import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Decryptica',
  description: 'Decryptica privacy policy.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="card-elevated p-8 md:p-12">
        <h1 className="section-heading mb-6">Privacy Policy</h1>
        
        <div className="prose prose-invert prose-zinc">
          <p className="text-zinc-300 text-sm mb-6">
            Last updated: March 2026
          </p>
          
          <p className="text-zinc-300 leading-relaxed mb-6">
            At Decryptica, we value your privacy. This policy explains what data we collect and how we use it.
          </p>
          
          <h2 className="font-display text-xl font-semibold text-white mt-8 mb-4">What We Collect</h2>
          <ul className="space-y-2 text-zinc-300 mb-6">
            <li>• <strong className="text-white">Email</strong> — If you subscribe to our newsletter, we store your email to send updates. We never share it with third parties.</li>
            <li>• <strong className="text-white">Analytics</strong> — We use privacy-respecting analytics to understand how people use the site. No personal data is tracked.</li>
          </ul>
          
          <h2 className="font-display text-xl font-semibold text-white mt-8 mb-4">Cookies</h2>
          <p className="text-zinc-300 leading-relaxed mb-6">
            We use minimal cookies to improve your experience. You can disable cookies in your browser settings at any time.
          </p>
          
          <h2 className="font-display text-xl font-semibold text-white mt-8 mb-4">Your Rights</h2>
          <p className="text-zinc-300 leading-relaxed mb-6">
            You can unsubscribe from our newsletter at any time by clicking the link in any email. To request deletion of your data, email us at hello@decryptica.com.
          </p>
          
          <h2 className="font-display text-xl font-semibold text-white mt-8 mb-4">Contact</h2>
          <p className="text-zinc-300 leading-relaxed">
            Questions? Reach us at <a href="mailto:hello@decryptica.com" className="text-indigo-400 hover:text-indigo-300">hello@decryptica.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
