# SEO Article Conversion UX Spec (DEC-129)

## Scope

Define reusable article-page UX sections that improve readability, trust, lead capture, and conversion intent across Decryptica SEO content pages.

This spec is designed for reuse on:
- `/blog/[slug]`
- high-intent long-form landing articles in future topic clusters

## UX Outcomes

- Increase article completion rate on mobile and desktop.
- Increase qualified CTA clicks from article pages.
- Preserve readability while adding conversion touchpoints.

## Reusable Sections

### 1. Readability Frame

Purpose: Keep long-form content scannable and reduce bounce from text walls.

Include:
- `TL;DR` summary card directly below article header.
- Sticky progress navigation for section jumps.
- Body width constrained to 65-75 characters per line.
- Heading rhythm: H2 every 250-450 words, H3 as needed.

Mobile behavior:
- Progress navigation collapses to a bottom sheet trigger.
- `TL;DR` remains visible above first content block without pushing hero metadata below fold.

### 2. Trust Signal Strip

Purpose: Reinforce credibility before first conversion ask.

Placement:
- Immediately after first major section, before mid-article CTA.

Content requirements:
- "Last updated" date.
- Evidence/source policy link.
- Risk disclosure line for financial/automation claims.
- Author or editorial ownership label.

Mobile behavior:
- Stack into 2 rows max.
- Keep each trust item tap-target >= 44px height.

### 3. Mid-Article Lead Capture Block

Purpose: Capture engaged readers before drop-off at 45-60% scroll depth.

Placement:
- After second major section or around 40-55% of article length.

Structure:
- Value proposition (1 sentence).
- Input + primary CTA.
- Privacy reassurance microcopy.
- Optional secondary link to a related high-intent page.

States:
- Default, loading, success, error.
- Success state must not cause large layout shift.

Mobile behavior:
- Input and button can stack.
- Primary CTA must remain above keyboard fold when focused.

### 4. Conversion Strip (Post-Content)

Purpose: Route readers by intent at end of article.

Cards:
- Explore: continue reading by topic.
- Compare: evaluate tools/options.
- Start: subscribe or start workflow.

Interaction model:
- Equal visual weight at rest.
- Active hover/focus lift by 2-4px (desktop).
- Single-column stack on mobile with 12-16px spacing.

### 5. Mobile Sticky CTA Dock

Purpose: Keep one primary conversion path available for mobile readers.

Trigger:
- Appears after 35% scroll depth.
- Hides near footer to avoid overlap with post-content CTAs.

Rules:
- One primary action only (Subscribe or Start).
- Includes dismiss action remembered for current session.
- Must not obstruct content or navigation controls.

## Event Instrumentation Contract

Track section visibility and interactions with consistent metadata keys.

Required events:
- `page_view` with `impressionType: article`
- `toc_jump`
- `cta_click`
- `signup`

Required metadata:
- `articleSlug`
- `location` (e.g., `article_tldr`, `article_trust_strip`, `article_mid_capture`, `article_conversion_strip`, `article_mobile_sticky`)
- `cta` (e.g., `subscribe`, `compare_tools`, `explore_topic`, `start_workflow`)
- `category`

## Acceptance Criteria (Measurable)

### UX Acceptance
- Every article template includes all five reusable sections.
- No section introduces horizontal scrolling at 320px viewport width.
- Keyboard navigation reaches all CTA actions in logical order.
- Color contrast for text and controls meets WCAG AA minimum.

### Behavior Acceptance
- Mobile sticky CTA appears only after threshold and can be dismissed.
- Mid-article lead capture supports success and error states without layout break.
- Trust signal strip renders with valid "last updated" and disclosure content.

### KPI Acceptance (rolling 14-day baseline comparison)
- `cta_click` rate from article pages improves by >= 15%.
- `signup` conversion from article-origin traffic improves by >= 10%.
- Median scroll depth on article pages improves by >= 8%.
- Bounce rate on article pages does not increase by > 3%.

## QA Checklist

- Validate layout at 320px, 375px, 768px, 1024px, and 1440px.
- Validate CTA focus states and tab order.
- Validate event payloads in analytics endpoint for each section.
- Validate sticky CTA overlap behavior with footer and cookie/privacy elements.
- Validate no CLS regressions from lead capture state transitions.

## Implementation Notes

- Use shared section components instead of ad hoc per-page markup.
- Keep copy variants configurable by category (`crypto`, `ai`, `automation`).
- Keep section spacing consistent with existing article rhythm tokens.
- Roll out behind an experiment flag if traffic quality is sensitive.
