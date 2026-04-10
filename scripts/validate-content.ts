#!/usr/bin/env npx ts-node
/**
 * Content Validation CLI
 * Run: npx ts-node scripts/validate-content.ts [--fix] [--format table|json]
 *
 * Validates all articles in the content store against the CMS schema.
 * Exits with code 1 if any articles have validation errors.
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  validateAll,
  getArticles,
  getArticleBySlug,
  validateOne,
} from '../app/data/content-store.js';
import { buildValidationSummary } from '../app/data/content-schema.js';

const args = process.argv.slice(2);
const dryRun = !args.includes('--fix');
const format = args.includes('--json') ? 'json' : 'table';

console.log('\n🔍 Decryptica Content Validation\n');
console.log(`Mode: ${dryRun ? 'DRY RUN (no changes)' : 'FIX (will update)'}\n`);

// Run validation on all articles
const summary = validateAll();

// Also check for duplicate slugs
const articles = getArticles({});
const slugSet = new Set<string>();
const duplicateSlugs: string[] = [];
for (const article of articles) {
  if (slugSet.has(article.slug)) {
    duplicateSlugs.push(article.slug);
  }
  slugSet.add(article.slug);
}

// Build detailed summary
const results: Record<string, ReturnType<typeof validateOne>> = {};
for (const article of articles) {
  results[article.slug] = validateOne(article.slug);
}

if (format === 'json') {
  console.log(JSON.stringify({ summary, results, duplicateSlugs }, null, 2));
} else {
  // Table format
  console.log(`📊 Total Articles: ${summary.total}`);
  console.log(`✅  Valid: ${summary.valid}`);
  console.log(`❌  With Errors: ${summary.failedArticles.length}`);
  console.log(`⚠️  Warnings: ${summary.warnings}\n`);

  if (duplicateSlugs.length > 0) {
    console.log('⚠️  DUPLICATE SLUGS FOUND:');
    for (const slug of duplicateSlugs) {
      console.log(`   - ${slug}`);
    }
    console.log('');
  }

  if (summary.failedArticles.length > 0) {
    console.log('❌ Articles with errors:\n');
    for (const { slug, errors } of summary.failedArticles) {
      console.log(`  📄 ${slug}`);
      for (const error of errors) {
        console.log(`     • [${error.code}] ${error.field}: ${error.message}`);
      }
      console.log('');
    }
  }

  if (summary.warnings > 0) {
    console.log('⚠️  Articles with warnings:\n');
    for (const [slug, result] of Object.entries(results)) {
      if (result.warnings.length > 0 && !summary.failedArticles.find((f) => f.slug === slug)) {
        console.log(`  📄 ${slug}`);
        for (const warning of result.warnings) {
          console.log(`     ⚠️  ${warning}`);
        }
        console.log('');
      }
    }
  }

  // Status breakdown
  console.log('📁 Status Breakdown:');
  const byStatus: Record<string, number> = {};
  for (const article of articles) {
    const s = article.status ?? 'published';
    byStatus[s] = (byStatus[s] ?? 0) + 1;
  }
  for (const [status, count] of Object.entries(byStatus)) {
    const icon = status === 'published' ? '✅' : status === 'draft' ? '📝' : status === 'in_review' ? '👀' : '📦';
    console.log(`   ${icon} ${status}: ${count}`);
  }

  // Category breakdown
  console.log('\n📂 Category Breakdown:');
  const byCategory: Record<string, number> = {};
  for (const article of articles) {
    byCategory[article.category] = (byCategory[article.category] ?? 0) + 1;
  }
  for (const [cat, count] of Object.entries(byCategory)) {
    const icon = cat === 'crypto' ? '₿' : cat === 'ai' ? '🤖' : '⚡';
    console.log(`   ${icon} ${cat}: ${count}`);
  }

  // Word count stats
  const wordCounts = articles
    .filter((a) => a.wordCount)
    .map((a) => a.wordCount!);
  if (wordCounts.length > 0) {
    const avg = Math.round(wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length);
    const min = Math.min(...wordCounts);
    const max = Math.max(...wordCounts);
    console.log(`\n📏 Word Count: avg=${avg}, min=${min}, max=${max}`);
  }

  console.log('');
}

if (summary.failedArticles.length > 0) {
  console.log('❌ Validation FAILED — articles have errors.\n');
  process.exit(1);
} else {
  console.log('✅ All articles pass validation.\n');
  process.exit(0);
}
