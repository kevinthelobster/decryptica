import fs from 'node:fs';
import path from 'node:path';

import { articles } from '../app/data/articles';
import { getArticleImage, imageSet, type ArticleImageKey } from '../app/data/article-images';

type ArticleCategory = 'ai' | 'automation' | 'crypto';

type Candidate = {
  key: string;
  categories: ArticleCategory[];
  src: string;
  alt: string;
  credit: string;
  creditUrl: string;
};

type CandidateFile = {
  keywords: string[];
  candidates: Candidate[];
};

const root = path.join(__dirname, '..');
const articleImagesPath = path.join(root, 'app', 'data', 'article-images.ts');
const candidatesPath = path.join(root, 'data', 'article_image_candidates.json');
const recentWindowDays = Number(process.env.ARTICLE_IMAGE_RECENT_DAYS || 90);
const targetUnusedImages = Number(process.env.ARTICLE_IMAGE_MIN_UNUSED || 120);
const maxAdditions = Number(process.env.ARTICLE_IMAGE_REFILL_LIMIT || 120);

function dateValue(date: string) {
  const value = new Date(date).getTime();
  return Number.isFinite(value) ? value : 0;
}

function recentImageSources() {
  const newestDate = Math.max(...articles.map((article) => dateValue(article.date)), 0);
  const windowMs = recentWindowDays * 24 * 60 * 60 * 1000;

  return new Set(
    articles
      .filter((article) => {
        const articleDate = dateValue(article.date);
        if (newestDate && articleDate && newestDate - articleDate > windowMs) return false;
        return true;
      })
      .map((article) => getArticleImage(article).src)
  );
}

function availableUnusedCount() {
  const usedRecently = recentImageSources();
  return Object.values(imageSet).filter((image) => !usedRecently.has(image.src)).length;
}

function loadCandidateFile(): CandidateFile {
  return JSON.parse(fs.readFileSync(candidatesPath, 'utf8')) as CandidateFile;
}

function tsString(value: string) {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function imageEntry(candidate: Candidate) {
  return `  ${candidate.key}: {
    src: \`${candidate.src}\${unsplashParams}\`,
    alt: ${tsString(candidate.alt)},
    credit: ${tsString(candidate.credit)},
    creditUrl: ${tsString(candidate.creditUrl)},
  },`;
}

function addKeyToPool(source: string, category: ArticleCategory, key: string) {
  const multilinePattern = new RegExp(`(  ${category}: \\[\\n)([\\s\\S]*?)(  \\],)`);
  if (multilinePattern.test(source)) {
    return source.replace(multilinePattern, (match, start, body, end) => {
      if (body.includes(`'${key}'`)) return match;
      return `${start}    '${key}',\n${body}${end}`;
    });
  }

  const inlinePattern = new RegExp(`(  ${category}: \\[)([^\\n]*?)(\\],)`);
  return source.replace(inlinePattern, (match, start, body, end) => {
    if (body.includes(`'${key}'`)) return match;
    const existingItems = body
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    const items = [`'${key}'`, ...existingItems].map((item) => `    ${item},`).join('\n');
    return `${start}\n${items}\n  ${end}`;
  });
}

function updateArticleImagesFile(candidates: Candidate[]) {
  if (!candidates.length) return false;

  let source = fs.readFileSync(articleImagesPath, 'utf8');
  const imageSetEnd = '} satisfies Record<string, ArticleImage>;';
  const entries = `${candidates.map(imageEntry).join('\n')}\n`;

  if (!source.includes(imageSetEnd)) {
    throw new Error('Could not find imageSet insertion point.');
  }

  source = source.replace(imageSetEnd, `${entries}${imageSetEnd}`);

  for (const candidate of candidates) {
    for (const category of candidate.categories) {
      source = addKeyToPool(source, category, candidate.key);
    }
  }

  fs.writeFileSync(articleImagesPath, source, 'utf8');
  return true;
}

const existingKeys = new Set(Object.keys(imageSet));
const existingSources = new Set(Object.values(imageSet).map((image) => image.src.replace(/\?.*$/, '')));
const unusedBefore = availableUnusedCount();
const needed = Math.max(0, targetUnusedImages - unusedBefore);

if (needed === 0) {
  console.log(`Article image pool already has ${unusedBefore} unused images within ${recentWindowDays} days.`);
  process.exit(0);
}

const candidateFile = loadCandidateFile();
const additions = candidateFile.candidates
  .filter((candidate) => !existingKeys.has(candidate.key))
  .filter((candidate) => !existingSources.has(candidate.src))
  .slice(0, Math.min(needed, maxAdditions));

if (!additions.length) {
  throw new Error(
    [
      `Article image pool has only ${unusedBefore} unused images within ${recentWindowDays} days.`,
      `No unused candidates remain in ${path.relative(root, candidatesPath)}.`,
      `Search keywords: ${candidateFile.keywords.join(', ')}`,
    ].join(' ')
  );
}

updateArticleImagesFile(additions);

console.log(
  [
    `Added ${additions.length} image candidate(s) to the article hero pool.`,
    `Unused images before refill: ${unusedBefore}.`,
    `Keywords: ${candidateFile.keywords.join(', ')}`,
  ].join('\n')
);
