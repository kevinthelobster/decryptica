# SEO Pillar Routing Blueprint UX Spec (DEC-280)

## Objective

Define the next routing blueprint that converts SEO traffic across AI, Crypto, and Automation pillars into clear next steps, while preserving crawl clarity and predictable internal-link depth.

## Context

- Prior hub routing: [DEC-157](/DEC/issues/DEC-157)
- Prior intent continuity: [DEC-160](/DEC/issues/DEC-160)
- Prior article SERP package: [DEC-276](/DEC/issues/DEC-276)
- Unblock trigger: [DEC-279](/DEC/issues/DEC-279)

## Routing Decision Summary

1. Keep `/topic/{pillar}` as the canonical pillar-hub route in v1 (`ai`, `crypto`, `automation`).
2. Add dedicated sub-pillar index routes as the next crawl layer to reduce overloading `/articles` for intent-qualified discovery.
3. Normalize flow depth to 3 clicks for SEO entry paths:
   - `Homepage -> Pillar hub -> Sub-pillar index -> Article`
4. Keep conversion routes always one hop from any hub state:
   - `/tools/ai-price-calculator`
   - `/services/ai-automation-consulting`

## Sitemap-Level Routing Blueprint

### 1. Canonical Top-Level Routes

- `/`
- `/articles`
- `/topic/ai`
- `/topic/crypto`
- `/topic/automation`
- `/tools/ai-price-calculator`
- `/services/ai-automation-consulting`

### 2. New Sub-Pillar Routes (Phase 1 execution target)

- AI pillar
  - `/topic/ai/llms`
  - `/topic/ai/agents`
  - `/topic/ai/tooling`
- Crypto pillar
  - `/topic/crypto/defi`
  - `/topic/crypto/wallets`
  - `/topic/crypto/trading`
- Automation pillar
  - `/topic/automation/workflows`
  - `/topic/automation/infrastructure`
  - `/topic/automation/tooling`

### 3. Template Route

- `/blog/{slug}` remains the article detail endpoint.

### 4. Crawl and Priority Guidance

- Priority 1.0: `/`
- Priority 0.9: `/topic/{pillar}`
- Priority 0.8: `/topic/{pillar}/{subpillar}`
- Priority 0.7-0.9: `/blog/{slug}` (recency-adjusted, existing rule)
- Priority 0.85: `/tools/ai-price-calculator`, `/services/ai-automation-consulting`

## Page Hierarchy and Internal-Link Flow

### Homepage (`/`)

Primary exits:
- Pillar cards -> `/topic/{pillar}`
- Intent Router (`Learn`, `Calculate`, `Implement`) -> article index/tool/service

Required internal links:
- At least one direct link to each pillar hub above the fold
- At least one direct conversion link in hero or intent-router band

### Pillar Hub (`/topic/{pillar}`)

Primary exits:
- Section-nav jump links (`Overview`, `Key Questions`, `Tools/Comparisons`, `Next Step`)
- Sub-pillar chips -> `/topic/{pillar}/{subpillar}`
- Curated article cards -> `/blog/{slug}`
- Conversion CTA -> calculator/consulting route by pillar intent

Required internal links:
- 3-6 links to sub-pillar routes
- 3-9 links to pillar-matched article routes
- 1 direct conversion route link

### Sub-Pillar Index (`/topic/{pillar}/{subpillar}`)

Primary exits:
- Cluster intro + key outcomes
- Filtered article grid -> `/blog/{slug}`
- Adjacent sub-pillar links (same pillar)
- Conversion CTA strip

Required internal links:
- Breadcrumb links to `/topic/{pillar}` and `/`
- 6-12 article links
- 2-3 adjacent sub-pillar links

### Article (`/blog/{slug}`)

Primary exits:
- Related-in-cluster module -> sibling article pages
- Back-to-pillar and back-to-sub-pillar links
- Conversion strip links -> calculator/consulting

Required internal links:
- 1 link to parent pillar hub
- 1 link to parent sub-pillar index
- 2-4 links to related articles

## Wireframe-Level UX Notes

### Desktop

- Global header retains three persistent pillar links: `AI`, `Crypto`, `Automation`.
- Pillar pages use 2-column body rhythm:
  - left: sticky local navigation + sub-pillar chips
  - right: key questions, comparison cards, related modules
- Conversion CTA row sits after first content block and repeats near lower fold.
- Breadcrumb pattern on sub-pillar/article pages:
  - `Home / Pillar / Sub-pillar / Article`

### Mobile

- Header exposes one-tap pillar menu (sheet/drawer) with the same three pillar links first.
- Pillar/sub-pillar pages collapse local nav into horizontal chip scroller.
- Sub-pillar chips appear before the first article card to prevent deep scrolling before routing.
- Keep conversion CTA dock persistent at lower viewport once user scrolls past hero.
- Touch targets for nav chips and CTA controls: minimum 44px height.

## Instrumentation Contract Additions

- Continue existing `cta_click` event.
- Add `route_depth_progress` event with:
  - `entryRoute`
  - `currentRoute`
  - `depth` (0-3)
  - `pillar`
  - `subpillar` (nullable)

Success slices:
- Home -> pillar CTR
- Pillar -> sub-pillar CTR
- Sub-pillar -> article CTR
- Route depth completion rate to depth 3

## Handoff Checklist

### CTO (Engineering)

- Add route scaffolding for `/topic/{pillar}/{subpillar}` using shared hub template patterns.
- Extend sitemap generation to include sub-pillar routes.
- Add breadcrumb support and route-depth analytics payload wiring.
- Ensure canonical tags resolve to final route paths for pillar/sub-pillar/article pages.

### CMO (Content/SEO)

- Provide final sub-pillar naming map and keyword cluster assignments (AI/Crypto/Automation).
- Provide sub-pillar intro copy blocks (80-120 words each) + metadata drafts.
- Confirm internal-link anchor text policy for pillar -> sub-pillar and sub-pillar -> article modules.

### QA (Validation)

- Validate no horizontal overflow at 320px on pillar and sub-pillar pages.
- Validate breadcrumb + local-nav keyboard/focus behavior.
- Validate route-depth and CTA events include required metadata.

## Blockers and Exact Asks

- `blocked` (CMO): confirm final keyword cluster-to-sub-pillar mapping before engineering hardcodes route labels.
- `blocked` (CTO): confirm route implementation pattern for nested topic segments (`/topic/{pillar}/{subpillar}`) and canonical handling approach.

## Artifact Path

- `SEO_PILLAR_ROUTING_BLUEPRINT_UX_SPEC.md`
