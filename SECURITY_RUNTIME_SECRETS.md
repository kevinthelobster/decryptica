# Runtime Secret Guardrail

This service now fails closed for protected admin/debug routes when required secrets are missing.

## Required env keys

- `PROMPTS_ADMIN_PASSWORD`
  - Used by `/api/prompts/admin/*` session auth and cookie validation.
  - If missing, admin routes return `503` (`Admin auth is not configured`).
- `ANALYTICS_DEBUG_TOKEN`
  - Used by `/api/analytics` debug GET, `/api/analytics/dashboard`, `/api/seo` GET, and `/api/seo/dashboard`.
  - If missing, debug routes return `503` (`Debug auth is not configured`).

## Optional env keys

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
  - Used for prompt-submission Telegram notifications in `app/api/prompts/db.ts`.
  - If either key is missing, notification send is skipped (returns `false`).

## Rotation steps

1. Generate new secret values in your secret manager (Vercel/hosted runtime).
2. Update runtime env vars for:
   - `PROMPTS_ADMIN_PASSWORD`
   - `ANALYTICS_DEBUG_TOKEN`
   - `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` if Telegram notifications are enabled.
3. Deploy/restart runtime so new env values are active.
4. Re-authenticate admin sessions (old `prompts_admin` cookie will no longer match).
5. Validate:
   - Admin login + approve/reject/edit routes still authenticate.
   - Debug routes return `401` for wrong tokens and `200` for correct tokens.
   - Telegram notification smoke test succeeds if enabled.

