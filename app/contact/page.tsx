import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact | Decryptica',
  description: 'Get in touch with Decryptica.',
};

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="card-elevated p-8 md:p-12">
        <h1 className="section-heading mb-6">Get in Touch</h1>
        
        <p className="text-zinc-300 text-lg leading-relaxed mb-8">
          Have a question, suggestion, or want to collaborate? We'd love to hear from you.
        </p>
        
        <div className="space-y-6">
          <div className="p-6 bg-zinc-800/30 rounded-xl">
            <h2 className="font-display font-semibold text-white mb-2">Email</h2>
            <a href="mailto:hello@decryptica.com" className="text-indigo-400 hover:text-indigo-300">
              hello@decryptica.com
            </a>
          </div>
          
          <div className="p-6 bg-zinc-800/30 rounded-xl">
            <h2 className="font-display font-semibold text-white mb-2">For Business Inquiries</h2>
            <a href="mailto:brian@renegadereels.com" className="text-indigo-400 hover:text-indigo-300">
              brian@renegadereels.com
            </a>
          </div>
          
          <div className="p-6 bg-zinc-800/30 rounded-xl">
            <h2 className="font-display font-semibold text-white mb-2">Business Identity</h2>
            <p className="text-zinc-300">
              <strong className="text-white">Legal Entity:</strong> Renegade Reels LLC<br/>
              State of Registration: Ohio, United States
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
