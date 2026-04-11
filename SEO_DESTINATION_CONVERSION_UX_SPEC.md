# SEO Destination Conversion UX Spec (DEC-161)

## Objective

Increase SEO-to-conversion completion by tightening the final step after intent routing: help users complete a high-intent action on destination pages without second-guessing, context loss, or form friction.

## Chosen Opportunity + Rationale

### Chosen opportunity

Add a reusable "Conversion Confidence Layer" across the two highest-intent destination surfaces:
- `/tools/ai-price-calculator`
- `/services/ai-automation-consulting`

### Why this is next highest impact

What is already solved:
- [DEC-157](/DEC/issues/DEC-157) routes users from home/topic into clearer intent paths.
- [DEC-160](/DEC/issues/DEC-160) preserves intent continuity through topic and article flows.

Current gap:
- Users reaching destination pages still face long-scroll, generic content blocks before a confidence-backed next action.
- Tool and services pages contain CTAs, but no explicit "you are in the right place" reinforcement tied to intent source.
- Likely result: high click-through from SEO surfaces but suboptimal action completion at destination.

Expected conversion impact (14-day baseline):
- +10-15% increase in completed calculator interactions from SEO-origin sessions.
- +8-12% increase in consulting-plan starts (`book_automation_audit` or `request_automation_plan`) from SEO-origin sessions.
- +6-10% increase in downstream lead submissions from destination pages.

## Scope

In scope:
- UX package for confidence + completion on tool/services destination pages.
- Copy/structure variants by intent (`learn`, `calculate`, `implement`).
- Analytics contract for measuring confidence-layer lift.

Out of scope:
- pricing model changes
- full visual redesign
- new backend lead pipeline

## UX Package

### 1. Intent Context Header (top-of-page reinforcement)

Add a compact, reusable header block under the hero/title area:
- Confirms prior intent and current page purpose.
- Shows one primary action and one low-friction alternative.

Example variants:
- `calculate` on calculator page: "You are comparing model costs. Enter usage to see lowest-cost fit."
- `implement` on consulting page: "You are evaluating workflow automation ROI. Estimate payback, then request a rollout plan."
- `learn` fallback: "Start with a quick estimate, then continue with practical guides."

Rules:
- Use URL intent first, then session intent (`dc_entry_intent`), then page default.
- Keep block height stable to avoid CLS.

### 2. Sticky Progress + Next-Best Action Rail

Introduce a lightweight sticky rail that appears after first scroll threshold:
- Shows current stage (`Estimate`, `Compare`, `Start Plan`).
- Keeps one primary next action visible.
- On mobile, use compact bottom dock variant (single CTA + dismiss).

Surface mapping:
- Calculator: `Estimate cost` -> `Compare top 3` -> `Save recommendation`
- Consulting: `Estimate ROI` -> `Review proof` -> `Request automation plan`

### 3. Confidence Proof Micro-Modules near primary CTA

Place concise trust modules adjacent to high-intent CTA clusters:
- "Updated" signal (pricing freshness / methodology recency)
- Outcome proof snippet (case metric)
- Risk-control line (no commitment, secure handling, reversible next step)

Design constraints:
- Maximum 3 proof items visible at once.
- Each item 1 line headline + 1 line microcopy.
- Keep visual weight below primary CTA.

### 4. Friction-Reduced Action Capture

Standardize lightweight capture flow before full commitment:
- Calculator: optional "email my top 3 model picks" mini-capture after results rendered.
- Consulting: 3-field quick intake (`team size`, `primary workflow`, `target outcome`) before full contact path.

Behavior:
- Do not force capture to access core tool output.
- Success state is inline, non-blocking, and keyboard accessible.

### 5. Exit-Intent Rescue (non-modal on desktop, inline on mobile)

If user shows abandon behavior (rapid upward scroll + inactivity or tab-close intent):
- Offer one contextual rescue action only.
- Calculator rescue: "Send this estimate to yourself"
- Consulting rescue: "Get a 1-page ROI checklist"

Guardrails:
- Max once per session per page type.
- Never trigger within first 10 seconds on page.

## Instrumentation Contract

Required new/extended events:
- `conversion_confidence_impression`
- `conversion_confidence_cta_click`
- `destination_step_progress`
- `quick_capture_submit`
- `exit_rescue_impression`
- `exit_rescue_click`

Required metadata keys:
- `intent`
- `intentSource` (`url` | `session` | `default`)
- `location` (`tool_header`, `tool_sticky_rail`, `service_header`, `service_sticky_rail`, `proof_module`, `quick_capture`, `exit_rescue`)
- `pageType` (`calculator` | `consulting`)
- `sourceSurface` (`home_intent_router`, `topic_intent_router`, `article_conversion_strip`, `direct`)

## Prioritized Engineering Task List

1. Build reusable client helper for destination intent resolution (`url -> session -> default`).
2. Implement shared `ConversionIntentHeader` component with intent variant copy props.
3. Implement shared sticky rail component with desktop + mobile variants.
4. Add proof micro-module component and place near destination primary CTA sections.
5. Add quick-capture component states (default/loading/success/error) for calculator and consulting flows.
6. Add rescue trigger logic + one-time-per-session guard.
7. Extend analytics payloads and event wiring for all new events/metadata.

## Implementation-Ready Acceptance Criteria

### UX Acceptance

- Intent context header renders on both destination pages with correct variant copy.
- Sticky rail appears only after configured scroll threshold and never obscures required content.
- No horizontal overflow at 320px viewport.
- Keyboard tab order reaches all new actions in logical sequence.

### Behavior Acceptance

- Intent precedence follows `url > session > default`.
- Quick capture is optional and does not block primary calculator/consulting path.
- Exit rescue shows at most once per session and respects timing guardrails.
- Dismissed mobile sticky dock stays dismissed for current session.

### Analytics Acceptance

- `conversion_confidence_impression` fires once per module visibility cycle.
- `destination_step_progress` includes valid step names per page type.
- All confidence-layer CTA events include `intent`, `intentSource`, and `sourceSurface`.
- Event payload validation passes for calculator and consulting surfaces.

### KPI Acceptance (14-day rolling baseline)

- Calculator completion proxy (`results_rendered` -> `compare/top action click`) improves by >= 10%.
- Consulting CTA completion (`book_automation_audit` or `request_automation_plan`) improves by >= 8%.
- Lead capture from destination pages improves by >= 6%.
- Bounce rate on destination pages does not regress by > 3%.

## Explicit Handoff Asks

Engineering handoff ask (to [DEC-163](/DEC/issues/DEC-163)):
- Confirm implementation slicing into 2 incremental PRs:
  - PR1: intent header + sticky rail + analytics foundation
  - PR2: proof micro-modules + quick capture + exit rescue
- Confirm whether any API endpoint updates are needed for quick-capture persistence.
- Return feasibility notes and risk flags for mobile sticky interactions.

Marketing handoff ask (to [DEC-162](/DEC/issues/DEC-162)):
- Provide intent-variant copy pack for `learn`, `calculate`, `implement` on both destination pages.
- Provide proof snippets (case metrics + compliance-safe language) for micro-modules.
- Provide one rescue offer copy per page type with CTA label and success message.

## Artifact Path

- `SEO_DESTINATION_CONVERSION_UX_SPEC.md`
