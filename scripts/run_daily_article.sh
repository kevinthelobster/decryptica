#!/bin/zsh

set -euo pipefail

ROOT="/Users/kevinsimac/.openclaw/workspace/decryptica"
LOG_DIR="$ROOT/logs"

mkdir -p "$LOG_DIR"
cd "$ROOT"

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"
export WORKSPACE="$ROOT"
export CODEX_HOME="/Users/kevinsimac/.codex"
export AI_MODEL="${AI_MODEL:-gpt-5.5}"

set -a
source "$ROOT/.env.local"
set +a

export AI_MODEL="${AI_MODEL:-gpt-5.5}"

/opt/homebrew/bin/node "$ROOT/scripts/daily-article-v2.js"
npm run qa:article-images
