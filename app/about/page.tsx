import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About | Decryptica',
  description: 'About Decryptica - Technical intelligence for the curious mind.',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="card-elevated p-8 md:p-12">
        <h1 className="section-heading mb-6">About Decryptica</h1>
        
        <div className="prose prose-invert prose-zinc">
          <p className="text-zinc-300 text-lg leading-relaxed mb-6">
            Decryptica was born from a simple frustration: the internet is flooded with shallow content that recycles the same surface-level takes. We wanted something different.
          </p>
          
          <p className="text-zinc-300 leading-relaxed mb-6">
            We decode the complex world of crypto, AI, and automation into actionable insights. No fluff. No hype. Just real technical depth for people who want to understand what's actually happening.
          </p>
          
          <h2 className="font-display text-xl font-semibold text-white mt-8 mb-4">Our Mission</h2>
          <p className="text-zinc-300 leading-relaxed mb-6">
            To equip developers, traders, and technologists with the technical intelligence they need to stay ahead of the curve. We believe in proof over promises—and we back that up with code.
          </p>
          
          <h2 className="font-display text-xl font-semibold text-white mt-8 mb-4">What We Cover</h2>
          <ul className="space-y-2 text-zinc-300 mb-6">
            <li>• <strong className="text-white">Crypto & DeFi</strong> — Blockchain protocols, trading strategies, market analysis</li>
            <li>• <strong className="text-white">Artificial Intelligence</strong> — LLMs, AI agents, local AI, prompt engineering</li>
            <li>• <strong className="text-white">Automation</strong> — Workflows, n8n, scripting, productivity systems</li>
          </ul>
          
          <h2 className="font-display text-xl font-semibold text-white mt-8 mb-4">Built By</h2>
          <p className="text-zinc-300 leading-relaxed">
            Decryptica is built by the team at <strong className="text-white">Renegade Reels</strong>—a company dedicated to building tools and content that help people understand emerging technology.
          </p>
        </div>
      </div>
    </div>
  );
}
