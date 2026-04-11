#!/usr/bin/env node
/**
 * Article Sitemap Generator for Decryptica
 * Run: npx ts-node scripts/generate_article_sitemap.ts
 * Run (dry-run, no file writes): npx ts-node scripts/generate_article_sitemap.ts --dry-run
 *
 * Generates a comprehensive article sitemap that includes ALL blog posts
 * with proper change frequency, priority, and lastmod dates.
 */

import { getPublishedArticles } from '../app/data/content-store.js';
import { Article } from '../app/data/content-model.js';
import * as fs from 'fs';
import * as path from 'path';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

const BASE_URL = 'https://decryptica.com';

interface SitemapEntry {
  url: string;
  lastmod: string;
  priority: string;
  changefreq: string;
}

function estimateWordCount(content: string): number {
  return content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[#*`_~\\[\]]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
}

function getPriority(wordCount: number, dateStr: string): string {
  const daysSincePublished =
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24);

  // Fresh articles (< 7 days) get higher priority
  if (daysSincePublished < 7) return '0.9';
  // High-word-count articles get a slight boost
  if (wordCount >= 1500) return '0.8';
  return '0.7';
}

function getChangeFreq(
  dateStr: string,
  lastUpdated?: string
): 'daily' | 'weekly' | 'monthly' {
  const latest = lastUpdated || dateStr;
  const daysSincePublished =
    (Date.now() - new Date(latest).getTime()) / (1000 * 60 * 60 * 24);

  if (daysSincePublished < 7) return 'daily';
  if (daysSincePublished < 30) return 'weekly';
  return 'monthly';
}

function generateSitemap(published: Article[]): string {
  const entries: SitemapEntry[] = [];

  published.forEach((article) => {
    const wordCount = estimateWordCount(article.content);
    const lastmod = article.lastUpdated || article.date;
    const url = `${BASE_URL}/blog/${article.slug}`;

    entries.push({
      url,
      lastmod,
      priority: getPriority(wordCount, article.date),
      changefreq: getChangeFreq(article.date, article.lastUpdated),
    });
  });

  // Sort by date (newest first) for sitemap organization
  entries.sort(
    (a, b) => new Date(b.lastmod).getTime() - new Date(a.lastmod).getTime()
  );

  const urlsXml = entries
    .map(
      (entry) => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
  xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
>
${urlsXml}
</urlset>`;
}

function generateNewsSitemap(published: Article[]): string {
  // Only include articles from the last 2 days for Google News
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const recentArticles = published.filter((a) => {
    const pubDate = new Date(a.date);
    return pubDate >= twoDaysAgo;
  });

  const urlsXml = recentArticles
    .map(
      (article) => `  <url>
    <loc>${BASE_URL}/blog/${article.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>Decryptica</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${article.date}</news:publication_date>
      <news:title>${article.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</news:title>
    </news:news>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urlsXml}
</urlset>`;
}

function main() {
  const outDir = path.join(__dirname, '..');

  // Get published articles from the content store
  const published = getPublishedArticles();
  console.log(`  Total published articles: ${published.length}`);

  // Generate article sitemap (validates content structure)
  const sitemap = generateSitemap(published);
  const sitemapPath = path.join(outDir, 'public', 'sitemaps', 'articles.xml');
  const sitemapDir = path.dirname(sitemapPath);

  if (dryRun) {
    console.log('[dry-run] Would write article sitemap:', sitemapPath);
    console.log(`  Entries: ${published.length} | Size: ${sitemap.length} bytes`);
  } else {
    if (!fs.existsSync(sitemapDir)) {
      fs.mkdirSync(sitemapDir, { recursive: true });
    }
    fs.writeFileSync(sitemapPath, sitemap, 'utf-8');
    console.log(`✓ Article sitemap written: ${sitemapPath}`);
    console.log(`  Total articles: ${published.length}`);
  }

  // Generate news sitemap
  const newsSitemap = generateNewsSitemap(published);
  const newsSitemapPath = path.join(outDir, 'public', 'sitemaps', 'news.xml');

  if (dryRun) {
    console.log('[dry-run] Would write news sitemap:', newsSitemapPath);
    console.log(`  Recent articles (≤2 days): ${published.filter((a) => {
      const twoDaysAgo = new Date(); twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      return new Date(a.date) >= twoDaysAgo;
    }).length}`);
  } else {
    fs.writeFileSync(newsSitemapPath, newsSitemap, 'utf-8');
    console.log(`✓ News sitemap written: ${newsSitemapPath}`);
  }

  // Update the main sitemap to include the article sitemap
  const mainSitemapPath = path.join(outDir, 'sitemap.xml');
  let mainSitemap = fs.readFileSync(mainSitemapPath, 'utf-8');

  // Add article sitemap reference if not present
  if (!mainSitemap.includes('articles.xml')) {
    const articleSitemapEntry = `    <sitemap>
      <loc>https://decryptica.com/sitemaps/articles.xml</loc>
      <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    </sitemap>`;

    // Insert before </sitemapindex>
    mainSitemap = mainSitemap.replace(
      '</sitemapindex>',
      `${articleSitemapEntry}\n</sitemapindex>`
    );

    if (dryRun) {
      console.log('[dry-run] Would update main sitemap:', mainSitemapPath);
    } else {
      fs.writeFileSync(mainSitemapPath, mainSitemap, 'utf-8');
      console.log(`✓ Updated main sitemap with article sitemap reference`);
    }
  }

  console.log('\n📋 Sitemap Summary:');
  console.log(
    `   Articles: ${published.length} | Priority 0.9 (fresh): ${published.filter((a) => {
      const days = (Date.now() - new Date(a.date).getTime()) / (1000 * 60 * 60 * 24);
      return days < 7;
    }).length}`
  );
}

main();
