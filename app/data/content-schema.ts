/**
 * Decryptica Content Schema & Validation
 * Zod-based validation rules for all content types.
 *
 * Part of SEO_ARCHITECTURE.md implementation (Phase 1)
 */

import { z } from 'zod';
import type {
  Article,
  FAQ,
  TopicSlug,
  ArticleStatus,
  ContentFormat,
  ValidationResult,
  ValidationError,
} from './content-model';
import {
  TOPIC_SLUGS,
  STATUS_TRANSITIONS,
  CONTENT_TEMPLATES,
  canTransitionTo,
} from './content-model';

// ─── Schemas ──────────────────────────────────────────────────────────────────

export const FAQSchema: z.ZodType<FAQ> = z.object({
  question: z
    .string()
    .min(10, 'FAQ question must be at least 10 characters')
    .max(200, 'FAQ question must be at most 200 characters'),
  answer: z
    .string()
    .min(20, 'FAQ answer must be at least 20 characters')
    .max(1000, 'FAQ answer must be at most 1000 characters'),
  order: z.number().optional(),
});

// TopicSlug enum
export const TopicSlugSchema = z.enum([
  'crypto',
  'ai',
  'automation',
]);

// ArticleStatus enum
export const ArticleStatusSchema = z.enum([
  'draft',
  'in_review',
  'published',
  'archived',
]);

// ContentFormat enum
export const ContentFormatSchema = z.enum([
  'review',
  'comparison',
  'tutorial',
  'explainer',
  'news',
  'listicle',
  'guide',
]);

// ─── Forbidden Phrases (content quality) ──────────────────────────────────────

const FORBIDDEN_PHRASES = [
  "in today's fast-paced world",
  "delve",
  "unlock the power",
  "testament to",
  "game-changer",
  "revolutionizing",
  "in summary",
  "to summarize",
  "in conclusion",
] as const;

const FORBIDDEN_PATTERNS = [
  /lorem ipsum/i,
  /todo/i,
  / FIXME /i,
  /XXX /i,
  /\[PLACEHOLDER\]/i,
  /\[INSERT /i,
];

// ─── Article Schema ────────────────────────────────────────────────────────────

export const ArticleSchema = z
  .object({
    id: z.string().min(1, 'Article ID is required'),
    slug: z
      .string()
      .min(1, 'Slug is required')
      .max(75, 'Slug must be at most 75 characters')
      .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
    title: z
      .string()
      .min(30, 'Title must be at least 30 characters')
      .max(70, 'Title must be at most 70 characters')
      .refine((t) => !/[!?.]$/.test(t), 'Title should not end with sentence-ending punctuation'),
    excerpt: z
      .string()
      .min(10, 'Excerpt must be at least 10 characters')
      .max(200, 'Excerpt should be at most 200 characters for SEO best practices'),
    content: z
      .string()
      .min(1, 'Content is required'),
    category: TopicSlugSchema,
    tags: z.array(z.string().regex(/^[a-z0-9-]+$/)).max(8, 'Maximum 8 tags allowed').optional().default([]),
    format: ContentFormatSchema.optional(),
    author: z.string().min(1, 'Author is required').optional().default('Decryptica'),
    authorId: z.string().optional(),
    status: ArticleStatusSchema.optional().default('published'),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format')
      .refine((d) => new Date(d) <= new Date(), 'Date cannot be in the future'),
    lastUpdated: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'lastUpdated must be YYYY-MM-DD format')
      .optional(),
    readTime: z
      .string()
      .regex(/^\d+ min$/, 'readTime must match pattern "N min"'),
    wordCount: z.number().optional(),
    faqs: z.array(FAQSchema).optional(),
    primaryKeyword: z.string().optional(),
    metaDescription: z.string().optional(),
    canonicalUrl: z.string().url().optional().or(z.literal('')),
    noIndex: z.boolean().optional(),
    featuredImage: z.string().url().optional(),
    affiliateLinks: z.array(z.string().url()).optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .strict();

export type ArticleInput = z.input<typeof ArticleSchema>;
export type ArticleOutput = z.infer<typeof ArticleSchema>;

// ─── Validation Functions ─────────────────────────────────────────────────────

/**
 * Validate a full article against the schema.
 * Returns ValidationResult with errors and warnings.
 */
export function validateArticle(
  article: Partial<Article>,
  options: { allowOptionalFields?: boolean } = {}
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  // 1. Schema validation
  const result = ArticleSchema.safeParse(article);
  if (!result.success) {
    for (const issue of result.error.issues) {
      errors.push({
        field: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
      });
    }
  }

  // 1b. Soft excerpt length check (SEO recommendation, not hard requirement)
  if (article.excerpt) {
    if (article.excerpt.length < 100) {
      warnings.push(
        `Excerpt is ${article.excerpt.length} chars — SEO best practice is 100-160 chars for meta description`
      );
    } else if (article.excerpt.length > 160) {
      warnings.push(
        `Excerpt is ${article.excerpt.length} chars — may be truncated in Google search results (160 char limit)`
      );
    }
  }

  // 2. Word count check
  if (article.content) {
    const wordCount = estimateWordCount(article.content);
    const format = article.format;
    const template = format ? CONTENT_TEMPLATES[format] : null;
    const minWords = template?.minWords ?? 1500;

    if (wordCount < minWords) {
      errors.push({
        field: 'content',
        message: `Article word count (${wordCount}) is below minimum (${minWords}) for ${format ?? 'standard'} format`,
        code: 'word_count_too_low',
      });
    }

    // Warn about very short articles
    if (wordCount < 800) {
      warnings.push(`Article is very short (${wordCount} words). Consider expanding for SEO value.`);
    }
  }

  // 3. Primary keyword checks
  if (article.primaryKeyword && article.content && article.title) {
    const kw = article.primaryKeyword.toLowerCase();
    const content = article.content.toLowerCase();
    const title = article.title.toLowerCase();

    // Keyword in title
    if (!title.includes(kw)) {
      warnings.push(`Primary keyword "${article.primaryKeyword}" not found in title`);
    }

    // Keyword density check (very rough)
    const words = content.split(/\s+/).length;
    const keywordOccurrences = (content.match(new RegExp(kw, 'gi')) ?? []).length;
    const density = keywordOccurrences / words;
    if (density > 0.03) {
      warnings.push(`Keyword density for "${article.primaryKeyword}" may be too high (${(density * 100).toFixed(1)}%)`);
    }
    if (density < 0.003) {
      warnings.push(`Keyword "${article.primaryKeyword}" appears too rarely in content for good SEO`);
    }
  }

  // 4. Forbidden phrases check
  if (article.content) {
    const contentLower = article.content.toLowerCase();
    for (const phrase of FORBIDDEN_PHRASES) {
      if (contentLower.includes(phrase)) {
        errors.push({
          field: 'content',
          message: `Content contains forbidden phrase: "${phrase}"`,
          code: 'forbidden_phrase',
        });
      }
    }
    for (const pattern of FORBIDDEN_PATTERNS) {
      if (pattern.test(article.content)) {
        errors.push({
          field: 'content',
          message: `Content contains placeholder/TODO text matching pattern: ${pattern}`,
          code: 'placeholder_text',
        });
      }
    }
  }

  // 5. FAQ check for long articles
  if (article.content && article.wordCount && article.wordCount >= 1500) {
    const faqCount = article.faqs?.length ?? 0;
    if (faqCount === 0) {
      warnings.push('Article is 1,500+ words but has no FAQ section. Consider adding FAQs.');
    } else if (faqCount < 3) {
      warnings.push(`Only ${faqCount} FAQ(s). Consider adding at least 3-5 FAQs for better SEO.`);
    }
  }

  // 6. Tag check
  if (article.tags && article.tags.length < 2) {
    warnings.push('Article has fewer than 2 tags. Consider adding more for topic relevance.');
  }

  // 7. Date/lastUpdated relationship
  if (article.lastUpdated && article.date) {
    if (new Date(article.lastUpdated) < new Date(article.date)) {
      errors.push({
        field: 'lastUpdated',
        message: 'lastUpdated cannot be earlier than the publish date',
        code: 'invalid_date',
      });
    }
  }

  // 8. Status transition check
  // (Requires knowing previous status, which we don't have here.
  //  Use canTransitionStatus() separately.)

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate that a status transition is allowed.
 */
export function canTransitionStatus(
  currentStatus: ArticleStatus,
  nextStatus: ArticleStatus
): boolean {
  return canTransitionTo(currentStatus, nextStatus);
}

/**
 * Validate a slug for uniqueness (placeholder — implement with actual article list).
 */
export function validateSlugUniqueness(
  slug: string,
  existingArticles: Article[],
  excludeId?: string
): ValidationError | null {
  const duplicate = existingArticles.find(
    (a) => a.slug === slug && a.id !== excludeId
  );
  if (duplicate) {
    return {
      field: 'slug',
      message: `Slug "${slug}" is already used by article "${duplicate.title}"`,
      code: 'duplicate_slug',
    };
  }
  return null;
}

/**
 * Validate all articles in a list (useful for CI/build checks).
 */
export function validateAllArticles(
  articles: Article[]
): Record<string, ValidationResult> {
  const results: Record<string, ValidationResult> = {};
  for (const article of articles) {
    results[article.slug] = validateArticle(article);
  }
  return results;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function estimateWordCount(content: string): number {
  return content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[#*`_~\[\]]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
}

// ─── Validation Summary ───────────────────────────────────────────────────────

export interface ArticleValidationSummary {
  total: number;
  valid: number;
  errors: number;
  warnings: number;
  failedArticles: Array<{ slug: string; errors: ValidationError[] }>;
}

export function buildValidationSummary(
  results: Record<string, ValidationResult>
): ArticleValidationSummary {
  let valid = 0;
  let errors = 0;
  let warnings = 0;
  const failedArticles: Array<{ slug: string; errors: ValidationError[] }> = [];

  for (const [slug, result] of Object.entries(results)) {
    if (result.valid) {
      valid++;
    } else {
      errors += result.errors.length;
      failedArticles.push({ slug, errors: result.errors });
    }
    warnings += result.warnings.length;
  }

  return {
    total: Object.keys(results).length,
    valid,
    errors,
    warnings,
    failedArticles,
  };
}
