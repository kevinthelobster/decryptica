import fs from 'node:fs';
import path from 'node:path';

import { articles, type Article } from '../app/data/articles';
import { getArticleImage, getArticleImageCandidateKeys, imageSet, type ArticleImageKey } from '../app/data/article-images';

const root = path.join(__dirname, '..');
const articleImagesPath = path.join(root, 'app', 'data', 'article-images.ts');
const recentWindowDays = Number(process.env.ARTICLE_IMAGE_RECENT_DAYS || 90);

function dateValue(date: string) {
  const value = new Date(date).getTime();
  return Number.isFinite(value) ? value : 0;
}

function stableHash(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function sortByNewest(entries: Article[]) {
  return [...entries].sort((a, b) => dateValue(b.date) - dateValue(a.date));
}

function recentArticlesFor(latestArticle: Article) {
  const latestDate = dateValue(latestArticle.date);
  const windowMs = recentWindowDays * 24 * 60 * 60 * 1000;

  return articles.filter((article) => {
    if (article.slug === latestArticle.slug) return false;

    const articleDate = dateValue(article.date);
    if (latestDate && articleDate && latestDate - articleDate > windowMs) return false;

    return true;
  });
}

function chooseImageKey(latestArticle: Article): ArticleImageKey {
  const recentImageSources = new Set(recentArticlesFor(latestArticle).map((article) => getArticleImage(article).src));
  const candidates = getArticleImageCandidateKeys(latestArticle);
  const unusedCandidate = candidates.find((key) => !recentImageSources.has(imageSet[key].src));

  if (unusedCandidate) {
    return unusedCandidate;
  }

  const unusedCatalogKey = (Object.keys(imageSet) as ArticleImageKey[]).find((key) => !recentImageSources.has(imageSet[key].src));

  if (unusedCatalogKey) {
    return unusedCatalogKey;
  }

  return candidates[stableHash(latestArticle.slug) % candidates.length] || 'aiTools';
}

function upsertArticleImageOverride(slug: string, imageKey: ArticleImageKey) {
  const source = fs.readFileSync(articleImagesPath, 'utf8');
  const overrideEntry = `  '${slug}': imageSet.${imageKey},`;
  const existingPattern = new RegExp(`  '${slug}': imageSet\\.[a-zA-Z0-9_]+,`);

  if (existingPattern.test(source)) {
    const nextSource = source.replace(existingPattern, overrideEntry);
    if (nextSource !== source) fs.writeFileSync(articleImagesPath, nextSource, 'utf8');
    return;
  }

  const objectStart = 'export const articleImageOverrides = {\n';
  if (!source.includes(objectStart)) {
    throw new Error('Could not find articleImageOverrides in app/data/article-images.ts');
  }

  fs.writeFileSync(articleImagesPath, source.replace(objectStart, `${objectStart}${overrideEntry}\n`), 'utf8');
}

const latestArticle = sortByNewest(articles)[0];

if (!latestArticle) {
  process.exit(0);
}

const imageKey = chooseImageKey(latestArticle);
upsertArticleImageOverride(latestArticle.slug, imageKey);

console.log(`Assigned ${imageKey} hero image to newest article: ${latestArticle.slug}`);
