#!/bin/zsh

set -euo pipefail

ROOT="/Users/kevinsimac/.openclaw/workspace/decryptica"
LOG_DIR="$ROOT/logs"
LOCK_ROOT="$ROOT/.locks"
LOCK_DIR="$LOCK_ROOT/daily-article.lock"

# The legacy crontab entry runs without AI_PROVIDER and cannot reach the Claude
# login keychain; skip it so it never grabs the lock from the OpenClaw run.
if [[ -z "${AI_PROVIDER:-}" ]]; then
  echo "AI_PROVIDER not set (legacy crontab invocation); skipping. Set AI_PROVIDER=claude to run manually."
  exit 0
fi

mkdir -p "$LOG_DIR" "$LOCK_ROOT"
cd "$ROOT"

if [[ -d "$LOCK_DIR" ]]; then
  lock_age_seconds=$(($(date +%s) - $(stat -f %m "$LOCK_DIR" 2>/dev/null || echo 0)))
  if (( lock_age_seconds > 10800 )); then
    rm -rf "$LOCK_DIR"
  fi
fi

if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  echo "Daily article run already active; skipping duplicate invocation."
  exit 0
fi

cleanup_lock() {
  rm -f "$LOCK_DIR/run.meta" 2>/dev/null || true
  rmdir "$LOCK_DIR" 2>/dev/null || true
}
trap cleanup_lock EXIT INT TERM

{
  echo "pid=$$"
  echo "started_at=$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
} > "$LOCK_DIR/run.meta"

export PATH="/Users/kevinsimac/.codex/plugins/.plugin-appserver:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"
export WORKSPACE="$ROOT"
export CODEX_HOME="/Users/kevinsimac/.codex"
export AI_PROVIDER="${AI_PROVIDER:-claude}"
export AI_MODEL="${AI_MODEL:-claude-opus-5-5}"

set -a
source "$ROOT/.env.local"
set +a

export AI_PROVIDER="${AI_PROVIDER:-claude}"
export AI_MODEL="${AI_MODEL:-claude-opus-5-5}"

/opt/homebrew/bin/node "$ROOT/scripts/ensure_kwr_capacity.js"
/opt/homebrew/bin/node "$ROOT/scripts/daily-article-v2.js"
npm run qa:article-images
