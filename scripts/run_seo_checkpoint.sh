#!/bin/zsh

set -euo pipefail

ROOT="/Users/kevinsimac/.openclaw/workspace/decryptica"
LOG_DIR="$ROOT/logs"

mkdir -p "$LOG_DIR"
cd "$ROOT"

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

set -a
source "$ROOT/.env.local"
set +a

/opt/homebrew/bin/node "$ROOT/scripts/seo_daily_checkpoint.js" "$@"
