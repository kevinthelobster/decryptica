# Decryptica Editorial Pipeline & Performance Gates
## DEC-20 Artifact — v1.0

---

## 1. Editorial Workflow States & Handoff Rules

### State Machine

```
draft → in_review → approved → published
                          ↓
                       archived
```

| State | Owner | Gate | Visibility |
|-------|-------|------|------------|
| `draft` | Author/Kevin | Content generated, not ready | Internal |
| `in_review` | Editor/CMO | Editorial QA checklist passed | Internal |
| `approved` | Editor | All SEO gates passed, ready to ship | Internal |
| `published` | Kevin | Deployed to production | Public |
| `archived` | Editor | Removed from public, preserved | Internal |

### Handoff Rules

**Draft → In Review:**
- Word count ≥ 1,500
- Primary keyword present in title, first H2, ≥3 body paragraphs
- TL;DR box present at top
- No forbidden phrases
- Internal links: 2 same-category + 1 cross-category
- FAQ section present (≥3 entries for 1,500+ words)

**In Review → Approved:**
- CMO/Editor validates SEO metadata completeness
- Slug uniqueness confirmed
- Meta description 120-160 chars
- OG image exists or fallback acceptable
- All external links use `rel="noopener noreferrer"`
- Canonical URL set correctly

**Approved → Published:**
- Vercel deploy succeeds (CI gate)
- Core Web Vitals pass (see Section 2)
- Build completes without errors
- Post-deploy smoke test passes (homepage loads, article page 200 OK)

**Any State → Archived:**
- Editor action required
- Article URL returns 410 or redirects to parent topic page
- No 404 chain

---

## 2. Core Web Vitals & Page Speed Gate Definitions

### Thresholds (Google "Good" Range)

| Metric | Abbreviation | Target | Blocker Threshold | Measurement |
|--------|--------------|--------|-------------------|-------------|
| Largest Contentful Paint | LCP | ≤ 2.5s | > 4.0s | Lighthouse / PageSpeed Insights |
| First Input Delay | FID | ≤ 100ms | > 300ms | Lighthouse (TBT sub) |
| Cumulative Layout Shift | CLS | ≤ 0.1 | > 0.25 | Lighthouse |
| First Contentful Paint | FCP | ≤ 1.8s | > 3.0s | Lighthouse |
| Time to First Byte | TTFB | ≤ 800ms | > 1.8s | Lighthouse |
| Total Blocking Time | TBT | ≤ 200ms | > 600ms | Lighthouse |

### Speed Budget (Per Article Page)

| Resource | Budget |
|----------|--------|
| HTML (gzipped) | < 50 KB |
| CSS (gzipped) | < 30 KB |
| JavaScript (gzipped) | < 100 KB |
| Hero/LCP image | < 150 KB, WebP, lazy-loaded |
| Total page weight | < 1.5 MB |
| Critical rendering path | < 3 network round trips |
| Font load (blocking) | 0 — all fonts preloaded or font-display: swap |

### Gate Behavior

- **Pre-deploy gate:** Lighthouse CI must run on every PR preview. All "Good" thresholds must pass for merge to `main`.
- **Rollback trigger:** If production LCP > 4.0s or CLS > 0.25, auto-rollback fires within 5 minutes of detection.
- **Monitoring:** Vercel built-in Core Web Vitals dashboard + weekly Lighthouse CI report posted to Paperclip.

### Performance Measurement Tools

```
Local:  npx lighthouse https://decryptica.com/blog/{slug} --output=json --chrome-flags="--headless"
CI:     Lighthouse CI via vercel/lighthouse-ci-action
Prod:   Vercel Analytics + Web Vitals endpoint
```

---

## 3. Release Checklist

### Pre-Release (Approved → Deploy)

- [ ] Editorial workflow state = `approved`
- [ ] Word count ≥ 1,500 verified
- [ ] All H2 headings have anchor IDs (`#heading-slug`)
- [ ] TL;DR box at top of article
- [ ] FAQ accordion section present (≥3 questions)
- [ ] Breadcrumb JSON-LD rendered
- [ ] Article JSON-LD rendered with correct `@type: Article`
- [ ] Internal links: 2 same-cluster + 1 cross-cluster
- [ ] External links: `rel="noopener noreferrer"` on all
- [ ] Affiliate link placeholders resolved or flagged
- [ ] OG image: 1200×630px, `/public/og/{slug}.jpg` exists
- [ ] Canonical URL matches production URL
- [ ] No `noIndex: true` on article (unless intentionally draft)
- [ ] Lighthouse CI pre-deploy run: all metrics "Good"

### Post-Deploy (Smoke Test)

- [ ] `https://decryptica.com/blog/{slug}` returns HTTP 200
- [ ] LCP image loads within 2.5s on 4G throttled
- [ ] No console errors (Error level)
- [ ] Lighthouse score ≥ 90 (Performance)
- [ ] Google Search Console: URL inspected and indexed within 24h

### Rollback Path

**Trigger:** Any of:
- Lighthouse Performance < 80 post-deploy
- LCP > 4.0s on production
- CLS > 0.25 on production
- Build fails after merge
- Article page returns 5xx

**Steps:**
1. `git revert HEAD` on `main` → push → Vercel auto-deploys previous known-good state
2. Or: Vercel dashboard → Deployments → find last green deploy → "Promote to Production"
3. Post incident report to DEC-22 issue with: timestamp, metric that failed, current value, action taken

**Rollback SLA:** < 5 minutes from alert to production reverted

---

## 4. Observability Hooks

| Hook | Trigger | Action |
|------|---------|--------|
| Lighthouse CI (PR) | Every PR to `main` | Post score summary to Paperclip run log |
| Vercel Web Vitals | LCP/CLS/FID > threshold | Kevin (me) gets alert → triage |
| Search Console indexing | URL submitted | Auto-log to articles.json `indexedAt` field |
| Build failure | Vercel deploy error | Kevin alert → DEC-22 defect created |

---

## 5. File Locations

| Artifact | Path |
|----------|------|
| Article process | `/decryptica/ARTICLE_PROCESS.md` |
| SEO architecture | `/decryptica/SEO_ARCHITECTURE.md` |
| Article design standards | `/decryptica/ARTICLE_DESIGN_STANDARDS.md` |
| This pipeline doc | `/decryptica/EDITORIAL_PIPELINE.md` |
| Content data | `/decryptica/data/articles.ts` |
| Article generation script | `/decryptica/scripts/generate_content.py` |
| Lighthouse CI config | `/.lighthouserc.json` (to be created) |

---

_Last updated: 2026-04-10 | Owner: Kevin (Decryptica CEO Agent)_
