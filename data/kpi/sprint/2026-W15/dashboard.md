# Sprint KPI Dashboard Snapshot — 2026-W15 (W1)

Period: 2026-04-06 to 2026-04-12
Generated: 2026-04-11T17:32:36.447Z

## Source Mapping
- Sessions: `data/kpi/weekly/{week}/kpi.json.sessions.totalOrganicSessions` (missing)
- Organic CTR: `data/kpi/weekly/{week}/kpi.json.ctr.overallCtr` (missing)
- CVR: `data/kpi/daily/{yyyy}/{mm}/{yyyy-mm-dd}.json (signups/pageViews)` (placeholder)
- EPC: `data/kpi/daily/{yyyy}/{mm}/{yyyy-mm-dd}.json (revenue/affiliateClicks)` (placeholder)
- RPM: `data/kpi/daily/{yyyy}/{mm}/{yyyy-mm-dd}.json ((revenue*1000)/pageViews)` (placeholder)
- Net New MRR: `data/kpi/daily/{yyyy}/{mm}/{yyyy-mm-dd}.json.revenueCents (proxy until subscription MRR feed)` (placeholder)

## Net-New MRR Attribution (DEC-266)
- Source of truth: `billing.subscription_events`, `billing.invoices`, `analytics.attribution_touches`
- Grain: weekly by event_date (America/New_York), rolled up by channel and campaign
- Formula: `net_new_mrr_attributed = new_logo_mrr + expansion_mrr + trial_conversion_mrr - refund_mrr - churn_mrr_offset`
- Assisted attribution: 70% credit to last non-direct touch, 30% credit to first qualifying touch; direct-only paths get 100% direct
- Trial conversion: Include only when trial converts to paid and first successful invoice posts; use conversion date for recognition
- Export fields: `week_start`, `channel`, `campaign`, `new_logo_mrr`, `expansion_mrr`, `trial_conversion_mrr`, `refund_mrr`, `churn_mrr_offset`, `net_new_mrr_attributed`

## Weekly Snapshot Format
| Week | Sessions | Organic CTR | CVR | EPC | RPM | Net New MRR |
|------|----------|-------------|-----|-----|-----|-------------|
| W1 (2026-W15) | 0 | 0% | 0% | $0 | $0 | $0 |
| W2 | TBC | TBC | TBC | TBC | TBC | TBC |
| W3 | TBC | TBC | TBC | TBC | TBC | TBC |
| W4 | TBC | TBC | TBC | TBC | TBC | TBC |

## Missing Telemetry (Owner + Ask)
- GSC_API_KEY missing in runtime for non-placeholder sessions/CTR.
- KV_REST_API_URL and/or KV_REST_API_TOKEN missing in runtime for non-placeholder CVR/EPC/RPM.
- Subscription-grade net new MRR source is not wired; current value is revenue proxy.

## Reuse Process
1. Run `npx tsx scripts/seo_kpi_feed.ts`
2. Run `npx tsx scripts/daily_rollup.ts`
3. Run `npx tsx scripts/export_sprint_dashboard.ts --week 2026-W15`
