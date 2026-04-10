#!/usr/bin/env node
/**
 * Standalone Article Sitemap Generator for Decryptica
 * Run: node scripts/generate_sitemap.js
 * 
 * Reads articles.ts data and generates comprehensive sitemap.
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.decryptica.com';

// Load articles data - read the file and extract the articles array
const articlesPath = path.join(__dirname, '..', 'app', 'data', 'articles.ts');
const articlesContent = fs.readFileSync(articlesPath, 'utf-8');

// Extract articles array using regex (since we can't import TypeScript directly)
const articlesMatch = articlesContent.match(/export\s+const\s+articles:\s*Article\[\]\s*=\s*(\[[\s\S]*?\])\s*;/);
if (!articlesMatch) {
  console.error('Could not find articles array in articles.ts');
  process.exit(1);
}

// Evaluate the articles array
let articles;
try {
  // Create a fake module context for evaluation
  const mockModule = { exports: {} };
  const mockExports = mockModule.exports;
  
  // Extract just the array content and make it valid JS
  let arrayContent = articlesMatch[1];
  
  // Replace TypeScript-specific syntax
  arrayContent = arrayContent
    .replace(/:\s*'[^']*'/g, '')
    .replace(/:\s*"[^"]*"/g, '')
    .replace(/:\s*\[\]/g, ': []')
    .replace(/:\s*\{[^}]*\}/g, (match) => {
      // Simplify object literals - just keep them as valid JS
      return match;
    })
    .replace(/interface\s+\w+\s*\{[^}]*\}/g, '')
    .replace(/export\s+(const|let|var)\s+/g, 'const ')
    .replace(/;/g, '');

  // Wrap in array literal
  const wrappedContent = `(${arrayContent})`;
  articles = eval(wrappedContent);
} catch (e) {
  console.error('Failed to parse articles:', e.message);
  process.exit(1);
}

console.log(`Loaded ${articles.length} articles from articles.ts`);

// Helper functions
function estimateWordCount(content) {
  return content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[#*`_~\\[\]<>]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 0).length;
}

function getPriority(wordCount, dateStr) {
  const daysSincePublished = (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSincePublished < 7) return '0.9';
  if (wordCount >= 1500) return '0.8';
  return '0.7';
}

function getChangeFreq(dateStr, lastUpdated) {
  const latest = lastUpdated || dateStr;
  const daysSincePublished = (Date.now() - new Date(latest).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSincePublished < 7) return 'daily';
  if (daysSincePublished < 30) return 'weekly';
  return 'monthly';
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Generate sitemap entries
const entries = articles.map(article => {
  const wordCount = article.wordCount || estimateWordCount(article.content);
  const lastmod = article.lastUpdated || article.date;
  const url = `${BASE_URL}/blog/${article.slug}`;
  
  return {
    url,
    lastmod,
    priority: getPriority(wordCount, article.date),
    changefreq: getChangeFreq(article.date, article.lastUpdated)
  };
});

// Sort by date (newest first)
entries.sort((a, b) => new Date(b.lastmod).getTime() - new Date(a.lastmod).getTime());

// Generate XML
const urlsXml = entries.map(entry => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
  xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
>
${urlsXml}
</urlset>`;

// Write article sitemap
const sitemapsDir = path.join(__dirname, '..', 'public', 'sitemaps');
if (!fs.existsSync(sitemapsDir)) {
  fs.mkdirSync(sitemapsDir, { recursive: true });
}

const sitemapPath = path.join(sitemapsDir, 'articles.xml');
fs.writeFileSync(sitemapPath, sitemap, 'utf-8');
console.log(`✓ Article sitemap written: ${sitemapPath}`);

// Generate news sitemap (last 2 days)
const twoDaysAgo = new Date();
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

const recentArticles = articles.filter(a => new Date(a.date) >= twoDaysAgo);
const newsUrlsXml = recentArticles.map(article => `  <url>
    <loc>${BASE_URL}/blog/${article.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>Decryptica</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${article.date}</news:publication_date>
      <news:title>${escapeXml(article.title)}</news:title>
    </news:news>
  </url>`).join('\n');

const newsSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${newsUrlsXml}
</urlset>`;

const newsSitemapPath = path.join(sitemapsDir, 'news.xml');
fs.writeFileSync(newsSitemapPath, newsSitemap, 'utf-8');
console.log(`✓ News sitemap written: ${newsSitemapPath} (${recentArticles.length} recent articles)`);

// Update main sitemap to include article sitemap
const mainSitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
let mainSitemap = '';
if (fs.existsSync(mainSitemapPath)) {
  mainSitemap = fs.readFileSync(mainSitemapPath, 'utf-8');
}

if (!mainSitemap.includes('articles.xml')) {
  const today = new Date().toISOString().split('T')[0];
  const articleSitemapEntry = `    <sitemap>
      <loc>https://www.decryptica.com/sitemaps/articles.xml</loc>
      <lastmod>${today}</lastmod>
    </sitemap>
    <sitemap>
      <loc>https://www.decryptica.com/sitemaps/news.xml</loc>
      <lastmod>${today}</lastmod>
    </sitemap>`;
  
  mainSitemap = mainSitemap.replace('</sitemapindex>', `${articleSitemapEntry}\n</sitemapindex>`);
  fs.writeFileSync(mainSitemapPath, mainSitemap, 'utf-8');
  console.log(`✓ Updated main sitemap with article and news sitemap references`);
}

console.log('\n📋 Sitemap Summary:');
console.log(`   Articles: ${articles.length}`);
console.log(`   Priority 0.9 (fresh <7 days): ${entries.filter(e => e.priority === '0.9').length}`);
console.log(`   Recent news articles: ${recentArticles.length}`);