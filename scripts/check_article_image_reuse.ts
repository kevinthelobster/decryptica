import { articles } from '../app/data/articles';
import { getArticleImage } from '../app/data/article-images';

const recentWindowDays = Number(process.env.ARTICLE_IMAGE_RECENT_DAYS || 90);

function dateValue(date: string) {
  const value = new Date(date).getTime();
  return Number.isFinite(value) ? value : 0;
}

const sortedArticles = [...articles].sort((a, b) => dateValue(b.date) - dateValue(a.date));
const latestArticle = sortedArticles[0];

if (!latestArticle) {
  process.exit(0);
}

const latestImage = getArticleImage(latestArticle);
const latestDate = dateValue(latestArticle.date);
const windowMs = recentWindowDays * 24 * 60 * 60 * 1000;

const duplicate = sortedArticles.find((article) => {
  if (article.slug === latestArticle.slug) return false;
  const articleDate = dateValue(article.date);
  if (latestDate && articleDate && latestDate - articleDate > windowMs) return false;
  return getArticleImage(article).src === latestImage.src;
});

if (duplicate) {
  console.error(
    [
      `Newest article hero image was already used within ${recentWindowDays} days.`,
      `Newest: ${latestArticle.date} ${latestArticle.slug}`,
      `Duplicate: ${duplicate.date} ${duplicate.slug}`,
      `Image: ${latestImage.creditUrl}`,
    ].join('\n')
  );
  process.exit(1);
}

console.log(`Article image reuse check passed for ${latestArticle.slug}.`);
