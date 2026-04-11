'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="font-display font-bold text-xl text-white group-hover:text-indigo-400 transition-colors">
              Decryptica
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/" className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800/50">
              Home
            </Link>
            <Link href="/topic/crypto" className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800/50">
              Crypto
            </Link>
            <Link href="/topic/ai" className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800/50">
              AI
            </Link>
            <Link href="/topic/automation" className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800/50">
              Automation
            </Link>
            <Link href="/tools/ai-price-calculator" className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800/50">
              Tools
            </Link>
            <Link href="/prompts" className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800/50">
              Prompts
            </Link>
            <Link href="/seo/dashboard" className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800/50">
              Dashboard
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/#subscribe" className="btn-secondary text-sm">
              Subscribe
            </Link>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-800/50 py-4">
            <nav className="flex flex-col gap-1">
              <Link href="/" className="px-4 py-3 text-sm font-medium text-white bg-zinc-800/50 rounded-lg">
                Home
              </Link>
              <Link href="/topic/crypto" className="px-4 py-3 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors">
                Crypto
              </Link>
              <Link href="/topic/ai" className="px-4 py-3 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors">
                AI
              </Link>
              <Link href="/topic/automation" className="px-4 py-3 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors">
                Automation
              </Link>
              <Link href="/tools/ai-price-calculator" className="px-4 py-3 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors">
                AI Calculator
              </Link>
              <Link href="/prompts" className="px-4 py-3 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors">
                Prompts
              </Link>
              <Link href="/seo/dashboard" className="px-4 py-3 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors">
                Dashboard
              </Link>
              <div className="mt-2 pt-2 border-t border-zinc-800/50">
                <Link href="/#subscribe" className="btn-secondary text-sm w-full text-center block">
                  Subscribe
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
