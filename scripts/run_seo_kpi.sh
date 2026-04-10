#!/bin/bash
# SEO Weekly KPI Pipeline runner
# Usage: bash scripts/run_seo_kpi.sh
set -e
cd "$(dirname "$0")/.."
npx tsx scripts/seo_kpi_feed.ts
