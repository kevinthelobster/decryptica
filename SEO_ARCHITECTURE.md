# SEO Platform Architecture & CMS Content Model
# Decryptica — Information Architecture v1.0

---

## Overview

This document defines the information architecture and CMS content model for Decryptica's
SEO content platform. It covers the content type schema, slug strategy, taxonomy structure,
authoring fields, validation rules, and publishing workflow.

**Goal:** Support scalable SEO publishing across AI, Crypto, and Automation topic clusters
with consistent structure, strong SEO foundations, and a publishing workflow that can
grow to 90+ articles/month without quality degradation.

---

## Content Types

### 1. Article (Primary Content Type)

The core SEO content unit. Every article targets a specific search intent and belongs
to exactly one topic cluster.

```
Article {
  id:           string          // Unique ID (timestamp-based, e.g. "1775734693989-1926")
  slug:         string          // URL-safe identifier
  title:        string          // H1 headline (max 70 chars for SEO)
  excerpt:      string          // Meta description + TL;DR (max 160 chars)
  content:      string          // Full article body (markdown)
  category:     TopicSlug       // Primary topic cluster
  tags:         string[]        // Free-form topic tags (max 8)
  author:       string          // Author name (e.g. "Decryptica" or personal name)
  readTime:     string          // Estimated read time (e.g. "11 min")
  date:         string          // ISO 8601 publish date (YYYY-MM-DD)
  lastUpdated:  string?         // ISO 8601 last modified date
  wordCount:    number?         // Computed word count
  faqs:         FAQ[]           // Structured FAQ entries

  // SEO Fields
  primaryKeyword:   string?     // Main target keyword (SEO optimization)
  metaDescription:  string?     // Explicit meta (defaults to excerpt)
  canonicalUrl:     string?     // Override canonical (for syndicated content)
  noIndex:          boolean     // Prevent indexing (default: false)

  // Content Quality
  status:       ArticleStatus   // draft | in_review | published | archived
  featuredImage?: string        // OG image override URL
  affiliateLinks?: string[]     // Monetization links embedded in content
}
```

### 2. Topic Cluster (Taxonomy Root)

Top-level category that defines a content pillar and internal linking strategy.

```
Topic {
  slug:        string           // URL-safe identifier (e.g. "crypto", "ai")
  name:        string           // Display name (e.g. "Crypto & DeFi")
  description: string           // Topic page description (120-160 chars for SEO)
  icon:        string           // Emoji or icon identifier
  color:       string           // Brand color hex (for UI accents)
  parentSlug:  string?          // For hierarchical topics (future)
  articleCount: number         // Computed count of published articles
}
```

### 3. FAQ (Structured Content Block)

Reusable structured Q&A blocks that appear in articles and topic pages.

```
FAQ {
  question: string   // Full question text
  answer:   string  // Full answer text (supports markdown)
  order:    number  // Display order in accordion
}
```

### 4. Author

```
Author {
  id:        string
  name:      string
  role:      string              // "Editor", "Contributor", "Staff Writer"
  bio:       string              // Short bio (for author bio sections)
  avatar:    string              // Avatar image URL
  twitter?:  string              // Twitter handle (without @)
  isOrg:     boolean             // True for Decryptica (org-level authorship)
}
```

### 5. Tag

```
Tag {
  slug:     string               // URL-safe identifier
  name:     string               // Display name
  count:    number               // Computed count of articles using this tag
}
```

---

## Slug Strategy

### Article Slugs

Format: `kebab-case` with topic-qualified prefixes recommended.

```
Rule:     {primary-keyword-phrase}
Example:  event-driven-architecture-when-it-actually-helps
Max:      75 characters
```

**Slug Standards:**
- All lowercase, letters and hyphens only (no numbers except in well-established terms)
- No stop words at the start: "how", "what", "why", "best", "top" should be avoided as leading words
- Use full words, no abbreviations except: DeFi, API, SDK, SaaS, UX, SEO, SQL
- Articles about tools: prefix with action verb — "automate-x-with-zapier"
- Comparisons: use "vs" — "chatgpt-vs-claude-2026"
- Year qualifiers go at the end — "best-crypto-wallets-2026"

**What NOT to do:**
- ❌ `2026-best-solana-wallet` → ✅ `best-solana-wallets-2026`
- ❌ `ai-agent-explained` → ✅ `what-are-ai-agents-explained`
- ❌ `crypto-defi-nft-web3` → ✅ `defi-vs-nft-whats-the-difference`

### Topic Slugs

Format: single lowercase word (no compound)

```
crypto       → /topic/crypto
ai           → /topic/ai
automation   → /topic/automation
```

### Tag Slugs

Format: `kebab-case`, singular nouns

```
stablecoins,DeFi-yield,liquid-staking,token-gating
```

---

## Taxonomy

### Topic Clusters (3 Pillars)

```
crypto
├── defi
│   ├── dexes
│   ├── lending
│   ├── staking
│   └── yield
├── nfts
│   ├── marketplaces
│   ├── collections
│   └── gaming
├── wallets
│   ├── hardware
│   ├── software
│   └── custody
├── trading
│   ├── technical-analysis
│   ├── signals
│   └── bots
└── protocols
    ├── layer-2
    ├── bridges
    └──基础设施

ai
├── llms
│   ├── gpt
│   ├── claude
│   └── open-source
├── tools
│   ├── image-generation
│   ├── code-generation
│   └── voice
├── agents
│   ├── autonomous
│   └── collaborative
├── automation
│   ├── prompt-engineering
│   └── fine-tuning
└── research

automation
├── tools
│   ├── zapier
│   ├── make
│   ├── n8n
│   └──IFTTT
├── scripting
│   ├── python
│   ├── javascript
│   └── bash
├── workflows
│   ├── crm
│   ├── marketing
│   └── operations
└── infrastructure
    ├── webhooks
    ├── apis
    └── queues
```

### Content Format Taxonomy

Articles are classified by **format type** which determines template and structure:

| Format | Template | Word Count | SEO Purpose |
|--------|----------|------------|-------------|
| `review` | Product review with pros/cons table | 2,000-3,000 | Affiliate + comparison |
| `comparison` | Side-by-side X vs Y | 1,800-2,500 | Comparison keywords |
| `tutorial` | Step-by-step how-to | 1,500-2,500 | How-to queries |
| `explainer` | Concept definition | 1,200-1,800 | What is / How does |
| `news` | Current event analysis | 800-1,200 | Freshness signals |
| `listicle` | Numbered roundup | 1,500-2,500 | List keywords |
| `guide` | Comprehensive pillar | 3,000-5,000 | Top-of-funnel authority |

---

## Authoring Fields & Validation Rules

### Article Validation (Pre-Publish Checklist)

**Required Fields:**
- [ ] `title` — 30-70 characters, contains primary keyword near the start
- [ ] `slug` — URL-safe, unique across all articles, matches pattern `^[a-z0-9-]+$`
- [ ] `excerpt` — 100-160 characters, no duplicate sentences from content
- [ ] `content` — Minimum 1,500 words, no lorem ipsum, all headings have content
- [ ] `category` — Must be one of: `crypto`, `ai`, `automation`
- [ ] `date` — Valid ISO 8601 date, not in the future
- [ ] `readTime` — Matches pattern `^\d+ min$`
- [ ] `primaryKeyword` — Present in title, first H2, and at least 3 body paragraphs
- [ ] `status` — Must be `published` to appear on site

**Recommended Fields:**
- [ ] `lastUpdated` — Required if article is older than 90 days
- [ ] `faqs` — At least 3 FAQs for articles over 1,500 words
- [ ] `tags` — At least 2, no more than 8
- [ ] `featuredImage` — Required for articles targeting competitive keywords

**Forbidden in Content:**
- Phrases: "In today's fast-paced world", "Delve", "Unlock", "Game-changer"
- Personal claims: "I tested", "We tested" → use "Based on our research"
- Placeholder text or TODOs
- Raw markdown rendering errors (unclosed backticks, broken tables)

### Field-Level Validation Rules

```typescript
// title
{
  required: true,
  minLength: 30,
  maxLength: 70,
  pattern: /^[^!?.]+$/,           // No sentence-ending punctuation in title
}

// slug
{
  required: true,
  pattern: /^[a-z0-9-]+$/,
  maxLength: 75,
  unique: true,                   // No duplicate slugs
}

// excerpt
{
  required: true,
  minLength: 100,
  maxLength: 160,
}

// content
{
  required: true,
  minWordCount: 1500,
  forbiddenPhrases: [...],
}

// category
{
  required: true,
  enum: ['crypto', 'ai', 'automation'],
}

// tags
{
  type: 'array',
  maxItems: 8,
  itemPattern: /^[a-z0-9-]+$/,
}

// date
{
  required: true,
  notFuture: true,
  ISO8601: true,
}
```

---

## Publishing Workflow

```
draft → in_review → published
                    ↓
                 archived
```

| Status | Description | Who Can Set |
|--------|-------------|-------------|
| `draft` | In progress, not visible | Author, Editor |
| `in_review` | Submitted for editorial review | Author |
| `published` | Live on site | Editor |
| `archived` | Removed from public, preserved | Editor |

**Editorial Checks (in_review → published):**
1. Title contains primary keyword naturally
2. Slug is unique and follows conventions
3. Word count ≥ 1,500
4. Content has no forbidden phrases
5. At least 2 internal links (to related articles)
6. At least 1 external authoritative link
7. All external links use `rel="noopener noreferrer"`
8. FAQ section present (recommended for 1,500+ word articles)
9. TL;DR box present at top of article
10. OG image exists or fallback is acceptable

---

## Data Storage

**Current:** Static TypeScript arrays in `app/data/articles.ts`
**Recommended (Phase 2):** SQLite via `data/content.db` with admin UI

```
app/
  data/
    articles.ts        # Static article array (Phase 1 current state)
    content-model.ts    # TypeScript interfaces & type guards (NEW)
    content-schema.ts   # Validation rules & schema definitions (NEW)
    content-store.ts    # CRUD operations & data access layer (NEW)

data/
  content.db           # SQLite database (Phase 2)
  posted_titles.json    # Track published slugs (dedup)

scripts/
  validate-content.ts  # Pre-publish validation script (NEW)
  content-cli.ts       # CLI tool for content operations (NEW)
```

---

## Internal Linking Strategy

**Topical Cluster Linking (per article):**
- 2 links to articles in the **same category** (topical authority)
- 1 link to an article in a **different category** (cross-cluster, semantic)
- Related articles widget uses same formula

**Anchor Text Rules:**
- Descriptive, keyword-informed anchor text (never "click here" or "read more")
- Internal links use relative paths when possible: `/blog/slug-name`
- External links open in new tab with `rel="noopener noreferrer"`

---

## SEO Checklist Per Article

### On-Page SEO
- [ ] Primary keyword in `<title>` (within first 50 characters)
- [ ] Primary keyword in H1 (title)
- [ ] Primary keyword in first paragraph
- [ ] Primary keyword in at least one H2
- [ ] Keyword density ~1% (not keyword stuffing)
- [ ] Meta description contains keyword and is 120-160 chars
- [ ] Canonical URL is correct
- [ ] All images have descriptive alt text
- [ ] URL slug is clean and contains keyword

### Structured Data
- [ ] Article JSON-LD schema
- [ ] FAQ JSON-LD schema
- [ ] BreadcrumbList JSON-LD schema

### Content Quality
- [ ] No grammatical errors
- [ ] No broken links
- [ ] Code blocks have language labels
- [ ] Tables render properly on mobile
- [ ] External links open correctly
- [ ] Read time estimate is accurate

---

## Phase Roadmap

### Phase 1: Content Model Foundation (This Issue)
- [x] Define content types (Article, Topic, Tag, Author, FAQ)
- [x] Define slug strategy
- [x] Define taxonomy structure
- [x] Define authoring fields
- [x] Define validation rules
- [ ] Implement content-model.ts with TypeScript interfaces
- [ ] Implement content-schema.ts with Zod validation
- [ ] Implement content-store.ts with CRUD helpers
- [ ] Create validate-content.ts CLI script
- [ ] Update ARTICLE_PROCESS.md to reference this document

### Phase 2: Database Layer
- [ ] Migrate from static arrays to SQLite
- [ ] Build admin UI for content management
- [ ] Add content versioning / revision history
- [ ] Implement content relationships (article → related articles)

### Phase 3: Workflow & Collaboration
- [ ] Editorial review workflow in admin UI
- [ ] Multi-author support
- [ ] Content calendar integration
- [ ] Automated SEO scoring on draft articles

---

_Last updated: 2026-04-10_
