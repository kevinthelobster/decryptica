/**
 * Decryptica Content Store — CRUD Operations & Data Access Layer
 *
 * Provides a typed, centralized API for reading and writing content.
 * Abstracts the underlying storage (currently static arrays; Phase 2 → SQLite).
 *
 * Part of SEO_ARCHITECTURE.md implementation (Phase 1)
 */

import {
  Article,
  Topic,
  TopicSlug,
  Author,
  Tag,
  SubTopic,
  FAQ,
  ArticleStatus,
  isArticle,
  TOPICS,
  TOPIC_BY_SLUG,
  SUB_TOPICS,
  AUTHORS,
  createArticleId,
  slugify,
  estimateWordCount,
  estimateReadTime,
  formatDate,
} from './content-model';

import {
  validateArticle,
  validateSlugUniqueness,
  canTransitionStatus,
  ArticleValidationSummary,
  buildValidationSummary,
} from './content-schema';

// ─── Store State ─────────────────────────────────────────────────────────────
//
// In Phase 1, the store operates on the static articles array.
// In Phase 2, this will be replaced with SQLite via better-sqlite3.

import { articles as staticArticles } from './articles';

type ArticleStore = Article[];
let articles: ArticleStore = [...staticArticles];

// Treat articles without status as 'published' (backward compat)
function withDefaults(article: Article): Article {
  return {
    ...article,
    status: article.status ?? 'published',
    tags: article.tags ?? [],
    author: article.author ?? 'Decryptica',
  };
}

// ─── Article CRUD ─────────────────────────────────────────────────────────────

/**
 * Get all articles, optionally filtered by status.
 */
export function getArticles(options: {
  status?: ArticleStatus | ArticleStatus[];
  category?: TopicSlug;
  tag?: string;
  limit?: number;
  offset?: number;
} = {}): Article[] {
  let result = [...articles];

  if (options.status) {
    const statuses = Array.isArray(options.status) ? options.status : [options.status];
    result = result.filter((a) => statuses.includes(a.status ?? 'published'));
  }

  if (options.category) {
    result = result.filter((a) => a.category === options.category);
  }

  if (options.tag) {
    result = result.filter((a) => a.tags?.includes(options.tag!));
  }

  // Sort by date descending (newest first)
  result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (options.offset !== undefined) {
    result = result.slice(options.offset);
  }

  if (options.limit !== undefined) {
    result = result.slice(0, options.limit);
  }

  return result;
}

/**
 * Get a single article by slug.
 */
export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

/**
 * Get a single article by ID.
 */
export function getArticleById(id: string): Article | undefined {
  return articles.find((a) => a.id === id);
}

/**
 * Get articles by category (alias for filtering).
 */
export function getArticlesByCategory(category: TopicSlug): Article[] {
  return getArticles({ status: 'published', category });
}

/**
 * Get all published articles (ready for site rendering).
 */
export function getPublishedArticles(): Article[] {
  return getArticles({ status: 'published' });
}

// ─── Article Creation ────────────────────────────────────────────────────────

export interface CreateArticleInput {
  title: string;
  excerpt: string;
  content: string;
  category: TopicSlug;
  author?: string;
  tags?: string[];
  format?: Article['format'];
  primaryKeyword?: string;
  featuredImage?: string;
  faqs?: FAQ[];
}

export interface CreateArticleResult {
  success: boolean;
  article?: Article;
  slug?: string;
  errors: string[];
  warnings: string[];
}

/**
 * Create a new article with auto-generated slug, word count, and read time.
 * Runs full validation before committing.
 */
export function createArticle(input: CreateArticleInput): CreateArticleResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Generate slug
  const slug = slugify(input.title);
  if (!slug) {
    return { success: false, errors: ['Could not generate slug from title'], warnings: [] };
  }

  // Check slug uniqueness
  const slugError = validateSlugUniqueness(slug, articles);
  if (slugError) {
    errors.push(slugError.message);
  }

  // Check for duplicate titles
  const duplicateTitle = articles.find(
    (a) => a.title.toLowerCase() === input.title.toLowerCase()
  );
  if (duplicateTitle) {
    errors.push(`An article with this title already exists: "${duplicateTitle.slug}"`);
  }

  // Build article object
  const wordCount = estimateWordCount(input.content);
  const article: Article = {
    id: createArticleId(),
    slug: slugError ? `${slug}-${Date.now()}` : slug,
    title: input.title,
    excerpt: input.excerpt,
    content: input.content,
    category: input.category,
    tags: input.tags ?? [],
    format: input.format,
    author: input.author ?? 'Decryptica',
    status: 'draft',
    date: formatDate(),
    readTime: estimateReadTime(wordCount),
    wordCount,
    primaryKeyword: input.primaryKeyword,
    featuredImage: input.featuredImage,
    faqs: input.faqs,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Validate
  const validation = validateArticle(article);
  if (!validation.valid) {
    errors.push(...validation.errors.map((e) => `${e.field}: ${e.message}`));
  }
  warnings.push(...validation.warnings);

  if (errors.length > 0) {
    return { success: false, errors, warnings, slug };
  }

  // Commit
  articles.push(article);

  return { success: true, article, slug: article.slug, errors, warnings };
}

// ─── Article Updates ──────────────────────────────────────────────────────────

export interface UpdateArticleInput {
  title?: string;
  excerpt?: string;
  content?: string;
  category?: TopicSlug;
  tags?: string[];
  format?: Article['format'];
  author?: string;
  status?: ArticleStatus;
  date?: string;
  lastUpdated?: string;
  primaryKeyword?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  featuredImage?: string;
  faqs?: FAQ[];
}

export interface UpdateArticleResult {
  success: boolean;
  article?: Article;
  errors: string[];
  warnings: string[];
}

/**
 * Update an existing article by ID.
 * Validates status transitions and runs full validation.
 */
export function updateArticle(
  id: string,
  input: UpdateArticleInput
): UpdateArticleResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const existing = getArticleById(id);
  if (!existing) {
    return { success: false, errors: [`Article not found: ${id}`], warnings: [] };
  }

  // Status transition check
  const effectiveStatus = existing.status ?? 'published';
  if (input.status && input.status !== effectiveStatus) {
    if (!canTransitionStatus(effectiveStatus, input.status)) {
      errors.push(
        `Invalid status transition: ${effectiveStatus} → ${input.status}. ` +
        `Allowed: ${[effectiveStatus, ...[]].join(', ')}`
      );
    }
  }

  // Slug uniqueness check (if title changes, slug changes)
  let newSlug = existing.slug;
  if (input.title && input.title !== existing.title) {
    newSlug = slugify(input.title);
    const slugError = validateSlugUniqueness(newSlug, articles, id);
    if (slugError) {
      errors.push(slugError.message);
    }
  }

  // Build updated article
  const wordCount = input.content
    ? estimateWordCount(input.content)
    : existing.wordCount ?? estimateWordCount(existing.content);

  const updated: Article = {
    ...existing,
    ...input,
    id: existing.id, // immutable
    slug: newSlug,
    wordCount,
    readTime: estimateReadTime(wordCount),
    lastUpdated: input.content || input.status ? formatDate() : existing.lastUpdated,
    updatedAt: new Date().toISOString(),
  };

  // Validate
  const validation = validateArticle(updated);
  if (!validation.valid) {
    errors.push(...validation.errors.map((e) => `${e.field}: ${e.message}`));
  }
  warnings.push(...validation.warnings);

  if (errors.length > 0) {
    return { success: false, errors, warnings };
  }

  // Commit (replace in array)
  const index = articles.findIndex((a) => a.id === id);
  if (index !== -1) {
    articles[index] = withDefaults(updated);
  }

  return { success: true, article: updated, errors, warnings };
}

/**
 * Publish an article (draft → in_review → published).
 * Convenience wrapper for the common workflow.
 */
export function publishArticle(id: string): UpdateArticleResult {
  const article = getArticleById(id);
  if (!article) {
    return { success: false, errors: [`Article not found: ${id}`], warnings: [] };
  }
  return updateArticle(id, { status: 'published' });
}

/**
 * Archive an article (published → archived).
 */
export function archiveArticle(id: string): UpdateArticleResult {
  const article = getArticleById(id);
  if (!article) {
    return { success: false, errors: [`Article not found: ${id}`], warnings: [] };
  }
  return updateArticle(id, { status: 'archived' });
}

// ─── Article Deletion ─────────────────────────────────────────────────────────

/**
 * Delete an article by ID. Returns false if not found.
 */
export function deleteArticle(id: string): boolean {
  const index = articles.findIndex((a) => a.id === id);
  if (index === -1) return false;
  articles.splice(index, 1);
  return true;
}

// ─── Topic Access ─────────────────────────────────────────────────────────────

export function getTopics(): Topic[] {
  return TOPICS.map((topic) => ({
    ...topic,
    articleCount: getArticles({ status: 'published', category: topic.slug }).length,
  }));
}

export function getTopicBySlug(slug: TopicSlug): Topic | undefined {
  return TOPIC_BY_SLUG[slug];
}

export function getSubTopics(parent?: TopicSlug): SubTopic[] {
  if (parent) {
    return SUB_TOPICS.filter((st) => st.parent === parent);
  }
  return SUB_TOPICS;
}

// ─── Tag Operations ────────────────────────────────────────────────────────────

export function getAllTags(): Tag[] {
  const tagMap = new Map<string, number>();

  for (const article of articles) {
    if (article.status !== 'published') continue;
    for (const tag of article.tags ?? []) {
      tagMap.set(tag, (tagMap.get(tag) ?? 0) + 1);
    }
  }

  return Array.from(tagMap.entries())
    .map(([slug, count]) => ({ slug, name: slug.replace(/-/g, ' '), count }))
    .sort((a, b) => b.count - a.count);
}

export function getTagsByCategory(category: TopicSlug): Tag[] {
  const tagMap = new Map<string, number>();

  for (const article of articles) {
    if (article.status !== 'published') continue;
    if (article.category !== category) continue;
    for (const tag of article.tags ?? []) {
      tagMap.set(tag, (tagMap.get(tag) ?? 0) + 1);
    }
  }

  return Array.from(tagMap.entries())
    .map(([slug, count]) => ({ slug, name: slug.replace(/-/g, ' '), count }))
    .sort((a, b) => b.count - a.count);
}

// ─── Author Access ─────────────────────────────────────────────────────────────

export function getAuthors(): Author[] {
  return AUTHORS;
}

export function getAuthorById(id: string): Author | undefined {
  return AUTHORS.find((a) => a.id === id);
}

// ─── Related Articles (Topical Cluster Linking) ───────────────────────────────

/**
 * Get related articles using the topical cluster strategy:
 * - 2 articles from the same category
 * - 1 article from a different category (cross-link)
 */
export function getRelatedArticles(
  article: Article,
  limit: number = 3
): Article[] {
  const published = getPublishedArticles().filter((a) => a.id !== article.id);

  const sameCategory = published.filter((a) => a.category === article.category);
  const otherCategory = published.filter((a) => a.category !== article.category);

  const related: Article[] = [];
  let sameIdx = 0;
  let otherIdx = 0;

  for (let i = 0; i < limit; i++) {
    if (i % 3 === 2 && otherIdx < otherCategory.length) {
      related.push(otherCategory[otherIdx++]);
    } else if (sameIdx < sameCategory.length) {
      related.push(sameCategory[sameIdx++]);
    }
  }

  return related;
}

// ─── Stats & Analytics ─────────────────────────────────────────────────────────

export interface SiteStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  byCategory: Record<TopicSlug, number>;
  byFormat: Record<string, number>;
  avgWordCount: number;
  avgReadTime: number;
}

export function getSiteStats(): SiteStats {
  const published = getPublishedArticles();

  const byCategory: Record<TopicSlug, number> = {
    crypto: 0,
    ai: 0,
    automation: 0,
  };

  const byFormat: Record<string, number> = {};

  let totalWordCount = 0;

  for (const article of published) {
    byCategory[article.category]++;
    if (article.format) {
      byFormat[article.format] = (byFormat[article.format] ?? 0) + 1;
    }
    totalWordCount += article.wordCount ?? 0;
  }

  return {
    totalArticles: articles.length,
    publishedArticles: published.length,
    draftArticles: articles.filter((a) => a.status === 'draft').length,
    byCategory,
    byFormat,
    avgWordCount: published.length > 0 ? Math.round(totalWordCount / published.length) : 0,
    avgReadTime: published.length > 0
      ? Math.round(totalWordCount / published.length / 225)
      : 0,
  };
}

// ─── Search ────────────────────────────────────────────────────────────────────

/**
 * Search articles by title, excerpt, or content (simple keyword match).
 */
export function searchArticles(
  query: string,
  options: { status?: ArticleStatus; limit?: number } = {}
): Article[] {
  const q = query.toLowerCase();
  let results = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q) ||
      a.tags?.some((t) => t.includes(q))
  );

  if (options.status) {
    results = results.filter((a) => a.status === options.status);
  }

  if (options.limit) {
    results = results.slice(0, options.limit);
  }

  return results;
}

// ─── Full-Text Search ──────────────────────────────────────────────────────────

/**
 * More sophisticated search using keyword extraction and ranking.
 */
export function fullTextSearch(
  query: string,
  options: { category?: TopicSlug; limit?: number } = {}
): Array<{ article: Article; score: number }> {
  const keywords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const scored = articles
    .filter((a) => {
      if (options.category && a.category !== options.category) return false;
      return true;
    })
    .map((article) => {
      let score = 0;
      const titleLower = article.title.toLowerCase();
      const excerptLower = article.excerpt.toLowerCase();
      const contentLower = article.content.toLowerCase();

      for (const kw of keywords) {
        // Title matches score highest
        if (titleLower.includes(kw)) score += 10;
        // Excerpt matches
        if (excerptLower.includes(kw)) score += 5;
        // Content matches
        if (contentLower.includes(kw)) score += 1;
        // Tag matches
        if (article.tags?.some((t) => t.includes(kw))) score += 3;
      }

      return { article, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  if (options.limit) {
    return scored.slice(0, options.limit);
  }

  return scored;
}

// ─── Sync to Static (for current app compatibility) ───────────────────────────

/**
 * Get the current articles array for use by existing page components.
 * This maintains backward compatibility with the existing app/data/articles.ts
 * consumer pattern while the store handles all mutations.
 */
export function getArticlesArray(): Article[] {
  return articles;
}

// ─── Validation Reports ────────────────────────────────────────────────────────

/**
 * Run validation on all articles and return a summary.
 */
export function validateAll(): ArticleValidationSummary {
  const results: Record<string, ReturnType<typeof validateArticle>> = {};
  for (const article of articles) {
    results[article.slug] = validateArticle(article);
  }
  return buildValidationSummary(results);
}

/**
 * Validate a single article and return detailed result.
 */
export function validateOne(idOrSlug: string): ReturnType<typeof validateArticle> {
  const article = getArticleById(idOrSlug) ?? getArticleBySlug(idOrSlug);
  if (!article) {
    return {
      valid: false,
      errors: [{ field: 'id/slug', message: 'Article not found', code: 'not_found' }],
      warnings: [],
    };
  }
  return validateArticle(article);
}
