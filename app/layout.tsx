import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: {
    default: "Decryptica | Technical Intelligence for Crypto, AI & Automation",
    template: "%s | Decryptica",
  },
  description: "Expert insights on Crypto, AI, and Automation. Stay ahead of the curve with technical intelligence.",
  openGraph: {
    title: "Decryptica | Technical Intelligence",
    description: "Expert insights on Crypto, AI, and Automation.",
    url: "https://decryptica.com",
    siteName: "Decryptica",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Decryptica | Technical Intelligence",
    description: "Expert insights on Crypto, AI, and Automation.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrains.variable} bg-slate-950 text-slate-50 antialiased`}>
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
              <a href="/" className="font-mono text-xl font-bold tracking-tight">
                <span className="text-cyan-400">$</span>decryptica
              </a>
              <nav className="flex gap-6 text-sm">
                <a href="/" className="text-slate-400 hover:text-cyan-400 transition-colors">Index</a>
                <a href="/toolbox" className="text-slate-400 hover:text-cyan-400 transition-colors">Toolbox</a>
                <a href="/builds" className="text-slate-400 hover:text-cyan-400 transition-colors">Builds</a>
              </nav>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-slate-800 bg-slate-900/30 py-8">
            <div className="max-w-6xl mx-auto px-4 text-center text-slate-500 text-sm">
              <p className="font-mono">© 2026 Decryptica. Built for the curious.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
