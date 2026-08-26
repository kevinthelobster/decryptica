# Decryptica KWR Workflow

## Manual imports

1. Export keyword ideas from AnswerThePublic as CSV files.
2. Drop those CSV files into `data/kwr/imports/`.
3. Run `npm run kwr:build`.
4. Review `data/kwr/keyword_candidates.md`.
5. The daily article generator will prefer top unused candidates from `data/kwr/keyword_candidates.json` before falling back to the old title pools.

## Recurring pull job

- `npm run kwr:pull` runs the automated keyword harvest.
- It pulls fresh autocomplete suggestions from the current seed list in `data/kwr/seeds.json`.
- It writes a timestamped CSV into `data/kwr/imports/`.
- It automatically runs the candidate scorer afterward.
- Older import CSVs are trimmed so the folder does not grow forever.
- The builder now defaults to keeping up to `180` scored candidates with up to `4` per cluster so the daily article job has a deeper reserve across categories.

## Daily article preflight

- `scripts/ensure_kwr_capacity.js` runs before the daily article generator.
- It checks ready/unused candidate inventory overall and by category.
- It also refreshes when the candidate file is stale, even if the raw counts still look acceptable.
- If inventory is thin, it automatically runs the recurring keyword pull plus a rebuild before article selection starts.
- The preflight refill skips the slower SERP softness pass so scheduled article runs can rebuild inventory quickly.
- The preflight refill also caps the harvest to a balanced subset of seed queries by default, which keeps the just-in-time rebuild broad enough to recover inventory without turning every article run into a full research job.
- Default targets are tuned for the 3-articles-per-day schedule: at least `6` ready candidates per category, at least `36` total ready candidates, and a candidate file no older than `36` hours. You can override them with env vars.

Notes:
- This workflow treats AnswerThePublic as the idea model, but the recurring automation uses direct autocomplete harvesting because it is much more reliable to schedule.
- The scorer then applies a lightweight SERP softness check.
- The scorer intentionally favors monetizable affiliate/comparison queries over generic informational ones.
- `usedAt` is set automatically after a candidate gets turned into an article.
