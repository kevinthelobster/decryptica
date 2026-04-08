#!/bin/bash
# Run daily-article-v2.js 9 times for Brian

SCRIPT="/Users/kevinsimac/.openclaw/workspace/decryptica/scripts/daily-article-v2.js"
cd /Users/kevinsimac/.openclaw/workspace/decryptica

echo "Starting 9 article regeneration runs..."
echo ""

for i in 1 2 3 4 5 6 7 8 9; do
    echo "========================================"
    echo "Run $i of 9"
    echo "========================================"
    node "$SCRIPT" 2>&1 | grep -E "Content generated|using fallback|Article generated|Primary keyword"
    echo ""
done

echo "========================================"
echo "ALL 9 RUNS COMPLETE"
echo "========================================"
echo "Check articles.ts and push to GitHub if needed."
