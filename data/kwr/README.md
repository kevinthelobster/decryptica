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

Notes:
- This workflow treats AnswerThePublic as the idea model, but the recurring automation uses direct autocomplete harvesting because it is much more reliable to schedule.
- The scorer then applies a lightweight SERP softness check.
- The scorer intentionally favors monetizable affiliate/comparison queries over generic informational ones.
- `usedAt` is set automatically after a candidate gets turned into an article.
