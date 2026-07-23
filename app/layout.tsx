import type { Metadata } from "next";
import Link from "next/link";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import NewsletterPopup from "./components/NewsletterPopup";
import SeoCwvTracker from "./components/SeoCwvTracker";
import VercelAnalytics from "./components/VercelAnalytics";
import { getOrganizationSchema, getWebsiteSchema, jsonLdScript } from "./lib/schema";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-sans",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Decryptica | Independent Crypto, AI, and Automation Analysis",
    template: "%s | Decryptica",
  },
  description: "Independent reporting and analysis on crypto markets, AI tools, and automation systems.",
  openGraph: {
    title: "Decryptica | Independent Crypto, AI, and Automation Analysis",
    description: "Independent reporting and analysis on crypto markets, AI tools, and automation systems.",
    url: "https://decryptica.com",
    siteName: "Decryptica",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Decryptica | Independent Crypto, AI, and Automation Analysis",
    description: "Independent reporting and analysis on crypto markets, AI tools, and automation systems.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(getOrganizationSchema())} />
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(getWebsiteSchema())} />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} antialiased`}>
        <Header />

        {/* Main Content */}
        <main className="flex-1">{children}</main>

        {/* SEO CWV & Telemetry Collector */}
        <SeoCwvTracker />
        <VercelAnalytics />
        <NewsletterPopup />

        <footer className="border-t border-stone-200 bg-white">
          <div className="mx-auto max-w-7xl px-5 py-12">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
              <div className="col-span-1 md:col-span-2">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center border-2 border-stone-950 bg-stone-950 font-serif text-xl font-black text-white">
                    D
                  </div>
                  <span className="font-serif text-2xl font-black text-stone-950">Decryptica</span>
                </div>
                <p className="max-w-md text-sm leading-6 text-stone-600">
                  Independent reporting and analysis for operators tracking crypto, AI, and automation systems.
                </p>
              </div>

              <div>
                <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-stone-500">Sections</h4>
                <ul className="space-y-2">
                  <li><Link href="/topic/crypto/trading" className="text-sm font-medium text-stone-600 hover:text-red-900">Crypto Markets</Link></li>
                  <li><Link href="/topic/ai/tooling" className="text-sm font-medium text-stone-600 hover:text-red-900">AI Tools</Link></li>
                  <li><Link href="/topic/automation/workflows" className="text-sm font-medium text-stone-600 hover:text-red-900">Automation</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-stone-500">Company</h4>
                <ul className="space-y-2">
                  <li><Link href="/about" className="text-sm font-medium text-stone-600 hover:text-red-900">About</Link></li>
                  <li><Link href="/contact" className="text-sm font-medium text-stone-600 hover:text-red-900">Contact</Link></li>
                  <li><Link href="/privacy" className="text-sm font-medium text-stone-600 hover:text-red-900">Privacy</Link></li>
                  <li><Link href="/terms" className="text-sm font-medium text-stone-600 hover:text-red-900">Terms</Link></li>
                  <li><Link href="/affiliate-disclosure" className="text-sm font-medium text-stone-600 hover:text-red-900">Affiliate Disclosure</Link></li>
                </ul>
              </div>
            </div>

            <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-stone-200 pt-8 md:flex-row">
              <p className="text-sm text-stone-500">
                © 2026 Decryptica. Independent digital economy coverage.
              </p>
              <div className="flex items-center gap-4">
                <a
                  href="https://x.com/decryptica"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Decryptica on X"
                  className="text-stone-500 hover:text-red-900"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </a>
                <a
                  href="https://github.com/decryptica"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Decryptica on GitHub"
                  className="text-stone-500 hover:text-red-900"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
