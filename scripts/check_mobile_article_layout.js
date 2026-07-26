const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const articlePagePath = path.join(root, 'app', 'blog', '[slug]', 'page.tsx');
const articlesPath = path.join(root, 'app', 'data', 'articles.ts');

const articlePage = fs.readFileSync(articlePagePath, 'utf8');
const articles = fs.readFileSync(articlesPath, 'utf8');

function assert(condition, message) {
  if (!condition) {
    console.error(`Mobile article layout check failed: ${message}`);
    process.exitCode = 1;
  }
}

assert(
  articlePage.includes('function ResponsiveMarkdownTable'),
  'markdown tables must render through the responsive table/card component.'
);

assert(
  articlePage.includes('hidden overflow-x-auto sm:block') && articlePage.includes('space-y-3 sm:hidden'),
  'comparison tables need a desktop table and a mobile card layout.'
);

assert(
  articlePage.includes("content.replace(/^#\\s+.+\\n+/, '')"),
  'article body should strip generated duplicate H1 headings before rendering.'
);

assert(
  articlePage.includes('<div className="hidden sm:block">') &&
    articlePage.includes('<section className="mt-8 scroll-mt-28 sm:hidden" aria-label="Article next steps">'),
  'heavy decision modules should stay below the article body on mobile.'
);

const latestArticleMatch = articles.match(/\{\n\s*id: [\s\S]*?\n\s*\},(?=\n\s*\{|\n\];)/);
const latestArticle = latestArticleMatch?.[0] || '';
const firstMarkdownTable = latestArticle.match(/\|(.+)\|\n\|[-:| ]+\|/);
if (firstMarkdownTable) {
  const columnCount = firstMarkdownTable[1].split('|').map((cell) => cell.trim()).filter(Boolean).length;
  assert(
    columnCount <= 4 || articlePage.includes('space-y-3 sm:hidden'),
    `latest article includes a ${columnCount}-column table but no mobile card fallback is present.`
  );
}

if (!process.exitCode) {
  console.log('Mobile article layout guard passed.');
}
