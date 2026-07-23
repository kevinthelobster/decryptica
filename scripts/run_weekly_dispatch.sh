#!/bin/zsh
set -euo pipefail

cd "$(dirname "$0")/.."

if [[ -f .env.local ]]; then
  set -a
  source .env.local
  set +a
fi

npx tsx scripts/weekly-dispatch.ts "$@"
