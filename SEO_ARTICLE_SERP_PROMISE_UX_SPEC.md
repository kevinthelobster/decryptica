# SEO Article SERP Promise UX Spec (DEC-276)

## Objective

Increase SEO ranking durability and session-quality signals by making article pages satisfy search intent in the first viewport, then route users to the most relevant next action without forcing a funnel reset.

## Why This Is the Next Highest-Impact Slice

What is already solved:
- [DEC-157](/DEC/issues/DEC-157) improved homepage/topic intent routing.
- [DEC-160](/DEC/issues/DEC-160) carried intent context across hub and article surfaces.
- [DEC-234](/DEC/issues/DEC-234) improved destination-page conversion confidence.

Current gap:
- Many article pages still rely on long-form scanning before a visitor can confirm the page answers their query.
- First actionable next step is typically delayed until mid or end-of-article modules.
- This likely increases quick exits and reduces return-to-SERP resilience for comparison and how-to queries.

Expected impact (14-day rolling baseline after launch):
- +12-18% increase in engaged reads (>=90s or >=50% scroll depth) from organic sessions.
- +10-15% increase in article-to-next-step clicks (calculator, consulting, or related guide) from organic sessions.
- -6-10% reduction in quick exits (<30s and <25% scroll).

## Scope

In scope:
- `/blog/[slug]` template only (desktop + mobile).
- Above-the-fold answer clarity and next-step routing.
- Event instrumentation contract for engagement + progression measurement.

Out of scope:
- article generation pipeline changes
- taxonomy redesign
- destination page redesign (already covered by [DEC-234](/DEC/issues/DEC-234))

## UX Package

### 1. SERP Promise Match Card (new, above content body)

Placement:
- Render immediately under existing TL;DR section and before the first long-form content block.

Structure:
- `Quick answer` headline (1 sentence, intent-matched).
- `Best for` chips (up to 3 audience/use-case tags).
- `What you can do in 5 minutes` checklist (2-3 concrete outcomes).

Behavior:
- Copy variant selected by inferred intent (`learn`, `calculate`, `implement`) using existing intent context.
- Must remain scannable at 320px width without truncating critical line content.

### 2. Action Path Row (new, immediate next-step routing)

Add a compact 3-choice action row directly after the Promise Match Card:
- `Keep Reading` (anchor to article body)
- `Run the Tool` (calculator path when relevant)
- `Implement This` (consulting/services path when relevant)

Rules:
- Always show all three actions; only priority styling changes by intent.
- Use tracked links with explicit `location=article_action_path_row` metadata.

### 3. Section Milestone Chips (reading momentum)

Attach a lightweight milestone strip to local section nav:
- Milestones: `Quick Answer`, `Core Comparison`, `Decision`, `Next Step`.
- Chip state updates as each section enters viewport.

Purpose:
- Reduce perceived reading cost.
- Increase completion probability for long comparison pages.

### 4. Freshness + Evidence Strip (trust reinforcement)

Add a compact trust strip near top modules:
- `Last updated` date
- `Sources reviewed` count (if available; fallback to "Editorially reviewed")
- `Method` link anchor to FAQ/method section

Constraints:
- Low visual weight; must not compete with headline.
- No new backend requirement for v1 (graceful fallbacks allowed).

### 5. Outcome Selector at End of First Screen

At the end of top-screen modules, add one question:
- "What are you trying to do next?"

Options:
- `Compare options`
- `Get implementation help`
- `Keep learning`

Behavior:
- Selection reweights existing conversion strip emphasis lower on page.
- Selection persists for current tab session only.

## Instrumentation Contract

New/updated events:
- `serp_promise_impression`
- `serp_promise_action_click`
- `article_milestone_reached`
- `article_outcome_selected`

Required metadata keys:
- `intent`
- `intentSource` (`url` | `session` | `default`)
- `location` (`serp_promise_card`, `article_action_path_row`, `article_milestone_strip`, `article_outcome_selector`)
- `articleSlug`
- `category`
- `sourceSurface`

## Prioritized Engineering Task List

1. Build `SerpPromiseCard` component with intent-based copy props and responsive layout.
2. Add `ArticleActionPathRow` component and insert directly after TL;DR block.
3. Extend `HubSectionNav` usage on article pages with milestone chip state wiring.
4. Add `FreshnessEvidenceStrip` with fallback behavior when source count absent.
5. Add `ArticleOutcomeSelector` and wire selection to existing conversion strip priority.
6. Instrument all new modules/events with required metadata contract.

## Acceptance Criteria

### UX Acceptance

- Promise Match Card appears above article body on all blog pages.
- Action Path Row is visible without additional scroll on typical desktop and mobile first viewport after header stack.
- New modules do not introduce horizontal overflow at 320px.
- Keyboard navigation reaches all new actions in logical order.

### Behavior Acceptance

- Outcome selector persists only within current tab session.
- Existing conversion strip reacts to selected outcome without removing alternative actions.
- Milestone chips update consistently as section anchors enter viewport.

### Analytics Acceptance

- `serp_promise_impression` fires once per page view when module is visible.
- `serp_promise_action_click` includes `intent`, `location`, and `articleSlug`.
- `article_outcome_selected` fires only when selection changes.
- No schema validation failures for new event payloads.

### KPI Acceptance (14-day baseline)

- Engaged read rate improves by >=12% for organic article sessions.
- Article-to-next-step click-through improves by >=10%.
- Quick exits (<30s and <25% scroll) improve by >=6%.
- No regression >3% in total newsletter conversion from article pages.

## Cross-Functional Dependency Asks

Engineering dependency (CTO):
- Implement module bundle in one incremental PR sequence under follow-up execution ticket.
- Run mobile/desktop QA and event payload checks before release.

Marketing dependency (CMO):
- Provide copy pack for `learn`, `calculate`, `implement` variants:
  - Quick answer sentence templates
  - 5-minute outcome checklist variants
  - Outcome-selector labels/tooltips by category

## Artifact Path

- `SEO_ARTICLE_SERP_PROMISE_UX_SPEC.md`
