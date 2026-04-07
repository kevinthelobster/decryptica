#!/usr/bin/env python3
"""
Regenerate bad articles from daily-article-v2.js that used template/Ollama content.
This script removes bad articles from articles.ts so they can be regenerated properly.
"""

import re
import os
import json
import subprocess
import time

BASE_PATH = "/Users/kevinsimac/.openclaw/workspace/decryptica"
ARTICLES_TS = BASE_PATH + "/app/data/articles.ts"
TRACKER_FILE = BASE_PATH + "/data/posted_titles.json"

# Bad slugs to remove (template/Ollama generated, <1000 words)
BAD_SLUGS = {
    "when-to-abandon-no-code-for-real-code",
    "the-roi-of-business-automation-real-numbers",
    "the-pomodoro-problem-why-timers-don-t-work",
    "the-state-of-api-documentation-in-2026",
    "the-no-code-ceiling-when-tools-hit-their-limit",
    "the-hidden-costs-of-no-code-solutions",
    "obsidian-vs-notion-the-real-tradeoff",
    "why-your-ai-coding-assistant-is-costing-you-more-time",
    "the-etf-narrative-is-missing-this-critical-detail",
    "why-most-defi-users-will-never-leave-ethereum",
    "on-chain-data-tells-a-different-story-than-the-headlines",
    "the-ceiling-every-automation-tool-eventually-hits",
    "why-no-code-automation-hits-a-wall",
    "the-productivity-paradox-of-ai-developers",
}

# Titles to remove from tracker so they can be re-generated
BAD_TITLES = {
    "When to Abandon No-Code for Real Code",
    "The ROI of Business Automation: Real Numbers",
    "The Pomodoro Problem: Why Timers Don't Work",
    "The State of API Documentation in 2026",
    "The No-Code Ceiling: When Tools Hit Their Limit",
    "The Hidden Costs of No-Code Solutions",
    "Obsidian vs Notion: The Real Tradeoff",
    "Why Your AI Coding Assistant Is Costing You More Time",
    "The ETF Narrative Is Missing This Critical Detail",
    "Why Most DeFi Users Will Never Leave Ethereum",
    "On-Chain Data Tells a Different Story Than The Headlines",
    "The Ceiling Every automation Tool Eventually Hits",
    "Why No-Code Automation Hits a Wall",
    "The Productivity Paradox of AI Developers",
}

def remove_bad_articles():
    """Remove bad articles from articles.ts"""
    print(f"Reading {ARTICLES_TS}...")
    with open(ARTICLES_TS, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Find and remove each bad article
    removed_count = 0
    for slug in BAD_SLUGS:
        # Pattern: starts with "  {\n" followed by id and slug lines
        pattern = r'\n  \{\n    id: \'[^\']+\',\n    slug: \'' + re.escape(slug) + r'\',[\s\S]*?\n  \},'
        
        new_content = re.sub(pattern, '\n', content)
        if new_content != content:
            print(f"  ✓ Removed: {slug}")
            removed_count += 1
            content = new_content
        else:
            print(f"  ✗ Not found: {slug}")
    
    if removed_count > 0:
        with open(ARTICLES_TS, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Removed {removed_count} bad articles from articles.ts")
    else:
        print("No articles removed")
    
    return removed_count

def update_tracker():
    """Remove bad titles from posted_titles.json"""
    print(f"\nUpdating {TRACKER_FILE}...")
    
    if not os.path.exists(TRACKER_FILE):
        print("  Tracker file not found, skipping")
        return
    
    with open(TRACKER_FILE, 'r', encoding='utf-8') as f:
        tracker = json.load(f)
    
    original_count = len(tracker['posted'])
    
    # Remove bad titles
    tracker['posted'] = [
        entry for entry in tracker['posted']
        if entry['title'] not in BAD_TITLES and entry['slug'] not in BAD_SLUGS
    ]
    
    removed = original_count - len(tracker['posted'])
    if removed > 0:
        with open(TRACKER_FILE, 'w', encoding='utf-8') as f:
            json.dump(tracker, f, indent=2)
        print(f"  ✓ Removed {removed} entries from tracker")
    else:
        print("  No tracker entries removed")

def main():
    print("=" * 60)
    print("Decryptica Bad Article Regeneration Script")
    print("=" * 60)
    
    # Step 1: Remove bad articles from articles.ts
    print("\n[Step 1] Removing bad articles...")
    remove_bad_articles()
    
    # Step 2: Update posted_titles.json
    print("\n[Step 2] Updating tracker...")
    update_tracker()
    
    # Step 3: Commit changes
    print("\n[Step 3] Committing removal...")
    try:
        subprocess.run(['git', 'add', 'app/data/articles.ts', 'data/posted_titles.json'], 
                      cwd=BASE_PATH, check=True)
        subprocess.run(['git', 'commit', '-m', 'Remove bad template articles (will regenerate)'], 
                      cwd=BASE_PATH, check=True)
        subprocess.run(['git', 'push', 'origin', 'main'], 
                      cwd=BASE_PATH, check=True)
        print("  ✓ Changes pushed")
    except subprocess.CalledProcessError as e:
        print(f"  ✗ Git error: {e}")
    
    print("\n" + "=" * 60)
    print("Done! Run 'node scripts/daily-article-v2.js' to regenerate articles.")
    print("=" * 60)

if __name__ == "__main__":
    main()
