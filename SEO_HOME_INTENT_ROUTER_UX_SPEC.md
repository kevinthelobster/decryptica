# SEO Home Intent Router UX Spec (DEC-157)

## Objective

Define the next highest-impact UX deliverable after article-template improvements: route homepage and topic traffic into high-intent actions (service consultation, tool usage, and newsletter capture) without hurting article discovery.

## Why This Is Next

- `DEC-154` improved article-page conversion surfaces.
- Current homepage and topic pages still behave mostly as navigation surfaces, not intent routing surfaces.
- Closing this gap should increase qualified conversion starts from SEO entry traffic while preserving content depth.

## Scope

Surfaces:
- `/` (homepage)
- `/topic/[slug]`

Out of scope:
- visual redesign of entire brand system
- pricing/packaging changes
- article template changes already covered by `DEC-154`

## UX Deliverable

### 1. Intent Router Module (new reusable block)

Placement:
- Homepage: directly after Featured Articles
- Topic pages: after topic header and before article grid

Structure:
- 3 intent cards with equal hierarchy:
  - `Learn` -> read latest/topical article cluster
  - `Calculate` -> AI price calculator
  - `Implement` -> AI automation consulting page
- Each card includes 1-line value proposition and one primary CTA.

Behavior:
- Desktop: 3-column grid.
- Mobile: stacked cards with 12-16px spacing.
- Track click source by surface (`home_intent_router`, `topic_intent_router`).

### 2. Topic Header Action Row (topic pages)

Add a compact CTA row below topic description:
- Primary: `Get Weekly Brief` (subscribe anchor/form)
- Secondary: context-specific utility CTA
  - `ai` -> AI calculator
  - `automation` -> consulting page
  - `crypto` -> latest crypto article feed section

### 3. Homepage CTA Priority Cleanup

Adjust hero CTA priority to reduce split attention:
- Primary: `Start Reading`
- Secondary: `Try AI Calculator`
- Tertiary text link: `Book Automation Audit`

## Annotated Wireframe Guidance (text)

Homepage flow:
1. Hero (clear value + focused CTA hierarchy)
2. Latest Articles
3. **Intent Router (new)**
4. Topics Grid
5. Existing calculator feature section
6. Subscribe

Topic page flow:
1. Topic header
2. **Topic Header Action Row (new)**
3. **Intent Router (new, compact variant)**
4. Article grid

## Instrumentation Contract

Add/standardize events:
- `cta_click`
- `intent_router_impression`

Metadata keys:
- `location`: `home_intent_router` | `topic_intent_router` | `topic_action_row` | `home_hero`
- `cta`: `learn`, `calculate`, `implement`, `subscribe`, `start_reading`
- `category`: `crypto` | `ai` | `automation` | `all`

## Prioritized Engineering Task List

1. Build reusable `IntentRouter` component with variant support (`default`, `compact`).
2. Insert `IntentRouter` on homepage under Featured Articles.
3. Insert Topic Header Action Row on `/topic/[slug]` with category-aware secondary CTA.
4. Insert compact `IntentRouter` on `/topic/[slug]` before article grid.
5. Update homepage hero CTA ordering/copy per priority cleanup.
6. Ensure all new CTA links use existing tracking wrappers (`TrackedLink`) with required metadata.

## Acceptance Criteria

UX:
- Intent router appears on homepage and all topic pages.
- No horizontal overflow at 320px viewport.
- CTA labels are unique and intent-specific (no duplicated vague labels).

Behavior:
- All router and action-row CTAs fire tracked `cta_click` with required metadata.
- Router cards remain keyboard-accessible and focus-visible.

KPI target (14-day baseline):
- +12% increase in clicks from home/topic to `/tools/ai-price-calculator` and `/services/ai-automation-consulting`.
- +10% increase in newsletter signups originating from home/topic surfaces.
- No more than +3% homepage bounce regression.

## Handoff Notes

- Engineering owner: CTO (`DEC` implementation follow-up).
- QA focus: responsive layout, keyboard navigation, and event payload validation.
- This package is intentionally incremental to fit one sprint and avoid reworking `DEC-154` article components.
