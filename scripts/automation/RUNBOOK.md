# Decryptica SEO Automation Runbook
Updated: 2026-04-10

## Overview
Automation pipeline for publishing and refreshing SEO content on Decryptica.
Manages: content refresh cadence, stale-page detection, internal-link reinforcement, safe deployment checks.

---

## Quick Commands

### Run full content refresh (detects stale articles)
```bash
cd /Users/kevinsimac/.openclaw/workspace/decryptica
python3 scripts/automation/content_refresh.py
```

### Generate & submit sitemaps to Google
```bash
npx ts-node scripts/generate_article_sitemap.ts
python3 scripts/submit_to_search_console.py --recent 5
```

### Validate all articles (pre-deploy)
```bash
cd /Users/kevinsimac/.openclaw/workspace/decryptica
npx ts-node scripts/validate-content.ts --fix
```

### Daily article generation
```bash
cd /Users/kevinsimac/.openclaw/workspace/decryptica
node scripts/daily-article-v2.js
```

### Safe deployment checklist
```bash
# 1. Run content validator
npx ts-node scripts/validate-content.ts

# 2. Run SEO updater (language/policy fixes)
python3 scripts/seo_updater.py

# 3. Regenerate sitemaps
npx ts-node scripts/generate_article_sitemap.ts

# 4. Build
npm run build

# 5. If build passes, commit and push
git add -A && git commit -m "deploy: $(date +%Y-%m-%d)" && git push
```

---

## Automation Scripts

### content_refresh.py
Tracks article freshness, flags stale content needing updates.
- Reviews articles > 90 days
- Flags articles > 180 days as stale
- Checks for thin content (< 800 words)
- Generates content_refresh_report.md

### generate_article_sitemap.ts
Regenerates the article sitemap and news sitemap.
- Updates public/sitemaps/articles.xml
- Updates public/sitemaps/news.xml
- Should run after any new article deployment

### submit_to_search_console.py
Submits recent articles to Google Search Console for faster indexing.
- Generates URL inspection batch file
- Tracks submitted URLs to avoid duplicates
- Usage: `python3 scripts/submit_to_search_console.py --recent 5`

### seo_updater.py
Content policy fixes applied across all articles.
- Replaces "we tested" → "we researched"
- Renames "How We Test" → "How We Research"
- Fixes intro paragraphs
- Updates "tested picks" → "researched picks"

---

## Cron Schedule

| Time | Task | Command |
|------|------|---------|
| Every Monday 6am ET | Content freshness report | python3 .../content_refresh.py |
| Daily 11pm ET | SEO language updates | python3 .../seo_updater.py |
| After each deploy | Sitemap regeneration | npx ts-node .../generate_article_sitemap.ts |
| Weekly | GSC URL submission | python3 .../submit_to_search_console.py --recent 5 |

---

## Stale Page Detection
Articles flagged as stale (> 180 days) or review-needed (> 90 days) are documented in:
- `data/content_refresh_tracker.json` (JSON summary)
- `data/content_refresh_report.md` (human-readable report)

---

## Internal Link Reinforcement
When adding new articles, ensure:
- 2 links to articles in the **same category** (topical authority)
- 1 link to an article in a **different category** (cross-cluster)
- Use descriptive anchor text (no "click here")

---

## Deployment Safety Gates

Before any push to production:
1. ✅ Content validation passes (`npx ts-node scripts/validate-content.ts`)
2. ✅ Build succeeds (`npm run build`)
3. ✅ Sitemap regenerated
4. ✅ No forbidden phrases remain

---

## Notes
- Last full automation run: 2026-04-10
- Total published articles: 54
- All sitemaps: public/sitemaps/articles.xml, news.xml
- Build status: Clean (confirmed 2026-04-10)