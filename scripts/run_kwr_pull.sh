#!/bin/zsh

set -euo pipefail

ROOT="/Users/kevinsimac/.openclaw/workspace/decryptica"
LOG_DIR="$ROOT/logs"

mkdir -p "$LOG_DIR"
cd "$ROOT"

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"
export WORKSPACE="$ROOT"

node scripts/kwr_pull_fresh_lists.js
