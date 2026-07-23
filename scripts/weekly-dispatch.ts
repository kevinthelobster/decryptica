import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { kv } from '@vercel/kv';
import { articles } from '../app/data/articles';

type DispatchStatus = 'draft' | 'scheduled';

const SITE_URL = process.env.NEWSLETTER_SITE_URL || 'https://www.decryptica.com';
const BUTTONDOWN_API_KEY = process.env.BUTTONDOWN_API_KEY;
const BUTTONDOWN_STATUS = getDispatchStatus();
const FORCE = process.argv.includes('--force') || process.env.FORCE_WEEKLY_DISPATCH === '1';
const DRY_RUN = process.argv.includes('--dry-run') || process.env.DRY_RUN === '1';

const now = new Date();
const weekKey = getIsoWeekKey(now);
const dispatchKey = `newsletter:dispatch:${weekKey}`;

async function main() {
  const recentArticles = articles
    .filter((article) => (article.status ?? 'published') === 'published')
    .filter((article) => daysBetween(new Date(article.date), now) <= 7)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7);

  if (recentArticles.length === 0) {
    console.log('No published articles found for this week. Dispatch skipped.');
    return;
  }

  if (!FORCE && !DRY_RUN) {
    const existing = await kv.get(dispatchKey);
    if (existing) {
      console.log(`Dispatch already prepared for ${weekKey}. Use --force to override.`);
      return;
    }
  }

  const subject = `Decryptica Dispatch: ${recentArticles[0].title}`;
  const body = buildDispatchBody(recentArticles);
  const archivePath = writeLocalDraft(weekKey, subject, body);

  if (DRY_RUN) {
    console.log(`Dry run complete. Draft written to ${archivePath}.`);
    return;
  }

  if (!BUTTONDOWN_API_KEY) {
    console.log(`BUTTONDOWN_API_KEY is missing. Draft written to ${archivePath}.`);
    process.exitCode = 1;
    return;
  }

  const payload: Record<string, unknown> = {
    subject,
    body,
    status: BUTTONDOWN_STATUS,
    canonical_url: `${SITE_URL}/articles`,
    metadata: {
      source: 'decryptica-weekly-dispatch',
      week: weekKey,
    },
  };

  if (BUTTONDOWN_STATUS === 'scheduled') {
    payload.publish_date = getPublishDate().toISOString();
  }

  const response = await fetch('https://api.buttondown.com/v1/emails', {
    method: 'POST',
    headers: {
      Authorization: `Token ${BUTTONDOWN_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Buttondown email creation failed: ${response.status} ${body.slice(0, 240)}`);
  }

  const result = await response.json();
  await kv.set(dispatchKey, {
    buttondownEmailId: result.id,
    status: BUTTONDOWN_STATUS,
    subject,
    articleSlugs: recentArticles.map((article) => article.slug),
    createdAt: now.toISOString(),
  });

  console.log(`Weekly dispatch ${BUTTONDOWN_STATUS} for ${weekKey}.`);
}

function buildDispatchBody(recentArticles: typeof articles): string {
  const lead = recentArticles[0];
  const secondary = recentArticles.slice(1);

  const lines = [
    '# Decryptica Dispatch',
    '',
    `The sharpest new Decryptica read this week: [${lead.title}](${articleUrl(lead.slug)}).`,
    '',
    lead.excerpt,
    '',
    `[Read the lead story](${articleUrl(lead.slug)})`,
    '',
  ];

  if (secondary.length > 0) {
    lines.push('## Also new this week', '');
    for (const article of secondary) {
      lines.push(`- [${article.title}](${articleUrl(article.slug)}) — ${article.excerpt}`);
    }
    lines.push('');
  }

  lines.push(
    'Thanks for reading Decryptica.',
    '',
    `[Browse the full archive](${SITE_URL}/articles)`
  );

  return lines.join('\n');
}

function writeLocalDraft(week: string, subject: string, body: string): string {
  const dir = join(process.cwd(), 'artifacts', 'newsletter');
  mkdirSync(dir, { recursive: true });

  const path = join(dir, `${week}.md`);
  writeFileSync(path, `Subject: ${subject}\n\n${body}\n`, 'utf8');
  return path;
}

function articleUrl(slug: string): string {
  return `${SITE_URL}/blog/${slug}`;
}

function daysBetween(date: Date, reference: Date): number {
  return Math.max(0, (startOfDay(reference).getTime() - startOfDay(date).getTime()) / 86_400_000);
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getDispatchStatus(): DispatchStatus {
  const status = process.env.BUTTONDOWN_DISPATCH_STATUS;
  return status === 'scheduled' ? 'scheduled' : 'draft';
}

function getPublishDate(): Date {
  const minutes = Number(process.env.BUTTONDOWN_PUBLISH_DELAY_MINUTES || '10');
  return new Date(Date.now() + minutes * 60_000);
}

function getIsoWeekKey(date: Date): string {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNumber = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil(((target.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${target.getUTCFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
