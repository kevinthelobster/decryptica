'use client';

import { useState } from 'react';
import Link from 'next/link';

const navItems = [
  { href: '/articles', label: 'Latest' },
  { href: '/topic/crypto/trading', label: 'Crypto' },
  { href: '/topic/ai/tooling', label: 'AI' },
  { href: '/topic/automation/workflows', label: 'Automation' },
  { href: '/tools/ai-price-calculator', label: 'Tools' },
  { href: '/prompts', label: 'Prompts' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-5">
        <div className="flex min-h-16 items-center justify-between gap-4">
          <Link href="/" className="group flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center border-2 border-stone-950 bg-stone-950 font-serif text-xl font-black text-white">
              D
            </span>
            <span className="leading-none">
              <span className="block font-serif text-2xl font-black tracking-tight text-stone-950 group-hover:text-red-900">
                Decryptica
              </span>
              <span className="hidden text-[0.65rem] font-bold uppercase tracking-[0.16em] text-stone-500 sm:block">
                Digital economy desk
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-5 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-bold text-stone-700 hover:text-red-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/#subscribe"
            className="hidden border border-stone-950 px-4 py-2 text-sm font-bold text-stone-950 hover:bg-stone-950 hover:text-white md:inline-flex"
          >
            Subscribe
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="border border-stone-400 px-3 py-2 text-sm font-bold text-stone-900 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? 'Close' : 'Menu'}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-stone-200 py-4 md:hidden">
            <nav className="grid gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="border border-stone-200 bg-white px-4 py-3 text-sm font-bold text-stone-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/#subscribe"
                className="bg-stone-950 px-4 py-3 text-center text-sm font-bold text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Subscribe
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
