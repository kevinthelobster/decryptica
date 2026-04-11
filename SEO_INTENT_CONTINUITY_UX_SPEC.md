# SEO Intent Continuity UX Spec (DEC-160)

## Objective

Increase SEO-to-conversion performance by preserving visitor intent across homepage, topic, and article surfaces so each CTA reflects what the user already signaled.

## Why This Is the Next Highest-Impact Opportunity

What is already solved:
- [DEC-157](/DEC/issues/DEC-157) established homepage/topic intent-router entry points.
- [DEC-129](/DEC/issues/DEC-129) established article conversion modules and mobile sticky CTA.

Current gap:
- Intent signals are captured per click location, but the next page does not adapt CTA strategy based on that prior intent.
- A user who clicked "Calculate" can still land on generic article CTAs instead of calculator-first progression.
- This creates funnel reset and likely suppresses conversion rate on high-intent traffic.

Expected impact:
- +12-18% increase in calculator and consulting CTA clicks from SEO sessions.
- +8-12% increase in article-origin newsletter signups for users whose initial intent is "Learn".
- Lower friction from first SEO click to first meaningful action.

## Scope

Surfaces in scope:
- `/` homepage
- `/topic/[slug]`
- `/blog/[slug]`

Out of scope:
- pricing/packaging changes
- visual redesign of existing brand system
- net-new product pages

## UX Package

### 1. Intent Token + Session Persistence

Capture entry intent (`learn`, `calculate`, `implement`) and persist for session-level personalization.

Rules:
- On key CTA clicks from home/topic routers, append `?intent=<value>` to destination links when destination is internal and not already intent-tagged.
- On page load, hydrate current intent from URL first, then session fallback.
- Persist in `sessionStorage` key: `dc_entry_intent` with payload shape:
  - `intent`
  - `source` (`home_intent_router`, `topic_intent_router`, `topic_action_row`, `home_hero`, `article_conversion_strip`)
  - `category`
  - `timestamp`

### 2. Intent-Aware CTA Prioritization (Article)

On `/blog/[slug]`, dynamically prioritize conversion actions by stored/URL intent.

Behavior matrix:
- `learn`: keep current ordering; primary ask remains subscribe/read-more.
- `calculate`: elevate calculator CTA in mid-capture secondary action and conversion strip "Compare" card prominence.
- `implement`: elevate consulting CTA in conversion strip "Start" card and sticky dock alternative variant.

Constraints:
- Preserve all three conversion choices; only visual priority and copy order change.
- Never hide newsletter option completely.

### 3. Intent Confirmation Banner (Topic + Article)

Add a compact, dismissible context bar below header area:
- Copy example: "You're exploring with a **Calculate** goal. Continue to tools or keep reading."
- Primary action matches intent.
- Secondary action: "Switch goal" opens lightweight selector (`Learn`, `Calculate`, `Implement`).

Dismiss behavior:
- Session-level dismissal per page type.
- Reappears if intent changes.

### 4. Intent-Specific Microcopy Variants

Apply lightweight copy variants without layout churn:
- Mid-article lead capture headline/body
- Conversion strip subtext
- Mobile sticky CTA label

Copy principles:
- `learn`: insight/newsletter framing
- `calculate`: tool/comparison framing
- `implement`: execution/audit framing

## Annotated Flow

1. User clicks `Calculate` from home/topic intent router.
2. Destination page receives `intent=calculate` and persists session intent.
3. Article conversion modules reweight CTA hierarchy toward calculator path.
4. User can switch intent at any point; subsequent pages honor latest selected intent.

## Instrumentation Contract

New/updated events:
- `intent_set`
- `intent_switch`
- `intent_banner_dismiss`
- `cta_click` (existing, now with intent metadata)

Required metadata keys:
- `intent`
- `intentSource`
- `intentDerivedFrom` (`url` | `session` | `default`)
- `location`
- `category`
- `articleSlug` (article surface only)

Success measurement dashboard slices:
- CTA click-through rate by `intent` and `location`
- signup rate by initial intent cohort
- calculator/consulting page entries with retained intent

## Prioritized Engineering Tasks

1. Add intent persistence utility (`getIntent`, `setIntent`, `clearIntent`) in shared client helper.
2. Update tracked links in home/topic intent routers to propagate query intent.
3. Add intent hydration hook in article and topic pages.
4. Implement intent confirmation banner component with dismiss + switch interactions.
5. Add intent-aware variant logic for conversion strip, mid-capture secondary link, and mobile sticky dock copy.
6. Extend analytics payload builders to include intent metadata.

## QA Acceptance Criteria

UX:
- Intent banner appears when intent context exists and is not dismissed.
- Intent switch updates CTA copy/priority in under 1 frame without full page reload.
- Mobile (320px+) has no horizontal overflow with intent banner enabled.

Behavior:
- URL intent has precedence over session intent.
- Session intent persists through internal navigation during same tab session.
- Dismissed banner remains hidden until intent changes.

Analytics:
- `intent_set` fires once on new intent capture.
- `intent_switch` fires only when value actually changes.
- Every `cta_click` on in-scope surfaces includes `intent` and `intentSource` metadata.

## Handoff Notes

- Engineering owner: CTO implementation follow-up under [DEC-160](/DEC/issues/DEC-160).
- QA owner: validate responsive behavior, event payload integrity, and intent precedence rules.
- Rollout recommendation: ship behind a feature flag (`intent_continuity_v1`) for one-week measurement window before full default-on.
