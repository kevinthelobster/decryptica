#!/bin/zsh

set -euo pipefail

ROOT="/Users/kevinsimac/.openclaw/workspace/decryptica"
LOCK_ROOT="$ROOT/.locks"
LOCK_DIR="$LOCK_ROOT/article-image-refill.lock"

mkdir -p "$LOCK_ROOT"
cd "$ROOT"

if [[ -d "$LOCK_DIR" ]]; then
  lock_age_seconds=$(($(date +%s) - $(stat -f %m "$LOCK_DIR" 2>/dev/null || echo 0)))
  if (( lock_age_seconds > 3600 )); then
    rm -rf "$LOCK_DIR"
  fi
fi

if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  echo "SILENT article image refill already active"
  exit 0
fi

cleanup_lock() {
  rmdir "$LOCK_DIR" 2>/dev/null || true
}
trap cleanup_lock EXIT INT TERM

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "BLOCKED Decryptica repo has local changes; image refill skipped"
  exit 1
fi

git pull --ff-only origin main >/dev/null

npm run article:image:refill

if git diff --quiet -- app/data/article-images.ts; then
  echo "SILENT article image pool already stocked"
  exit 0
fi

npm run qa:article-images
npm run build

git add app/data/article-images.ts
git commit -m "Refill article hero image pool"
git push origin main

echo "UPDATED article image pool refilled and pushed"
