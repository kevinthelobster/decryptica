#!/usr/bin/env python3
"""
Content Refresh Tracker for Decryptica
Tracks article freshness and flags articles that need updating.

Run via cron: 0 6 * * 1 python3 /path/to/scripts/refresh_content_tracker.py
(Runs every Monday at 6am Eastern)

Checks:
- Articles older than 90 days → flag for review
- Articles older than 180 days → flag as stale
- Articles with < 800 words → flag as too thin
- Product/pricing info older than 30 days → flag for price update
"""

import os
import json
from datetime import datetime, timedelta
from pathlib import Path

BASE_PATH = "/Users/kevinsimac/.openclaw/workspace/decryptica"
ARTICLES_TS = BASE_PATH + "/app/data/articles.ts"
TRACKER_FILE = BASE_PATH + "/data/content_refresh_tracker.json"
REPORT_FILE = BASE_PATH + "/data/content_refresh_report.md"

# Thresholds (in days)
FRESH_THRESHOLD = 90      # Review recommended
STALE_THRESHOLD = 180     # Needs update
PRICE_CHECK = 30          # Check product/pricing info


def parse_date(date_str):
    """Parse date string to datetime object"""
    for fmt in ["%Y-%m-%d", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S"]:
        try:
            return datetime.strptime(date_str[:10], "%Y-%m-%d")
        except ValueError:
            try:
                return datetime.strptime(date_str.split("T")[0], "%Y-%m-%d")
            except:
                continue
    return None


def estimate_word_count(content):
    """Estimate word count from article content"""
    if not content:
        return 0
    # Strip markdown/code artifacts
    clean = content.replace("```", "").replace("`", "")
    clean = " ".join(clean.split())
    words = [w for w in clean.split() if len(w) > 1]
    return len(words)


def analyze_articles():
    """Analyze all articles for freshness"""
    articles = []

    if not os.path.exists(ARTICLES_TS):
        print(f"Articles file not found: {ARTICLES_TS}")
        return articles

    with open(ARTICLES_TS, "r") as f:
        content = f.read()

    # Simple extraction of article entries
    # Look for patterns like: slug: 'xxx', date: 'YYYY-MM-DD', etc.
    import re

    # Find all article objects in the file
    article_pattern = r"\{\s*id:\s*['\"]([^'\"]+)['\"],.*?slug:\s*['\"]([^'\"]+)['\"],.*?title:\s*['\"]([^'\"]+)['\"],.*?date:\s*['\"]([^'\"]+)['\"]"
    matches = re.findall(article_pattern, content, re.DOTALL)

    for match in matches:
        article_id, slug, title, date_str = match
        pub_date = parse_date(date_str)

        if not pub_date:
            continue

        days_old = (datetime.now() - pub_date).days
        word_count_match = re.search(
            rf"slug:\s*['\"]{re.escape(slug)}['\"].*?wordCount:\s*(\d+)", content, re.DOTALL
        )
        word_count = int(word_count_match.group(1)) if word_count_match else 0

        status = "fresh"
        if days_old >= STALE_THRESHOLD:
            status = "stale"
        elif days_old >= FRESH_THRESHOLD:
            status = "review"

        articles.append({
            "id": article_id,
            "slug": slug,
            "title": title,
            "date": date_str,
            "days_old": days_old,
            "word_count": word_count,
            "status": status,
            "needs_update": days_old >= FRESH_THRESHOLD,
            "needs_price_check": days_old >= PRICE_CHECK,
        })

    return articles


def generate_report(articles):
    """Generate markdown report of articles needing attention"""
    now = datetime.now().strftime("%Y-%m-%d %H:%M")

    stale = [a for a in articles if a["status"] == "stale"]
    review = [a for a in articles if a["status"] == "review"]
    thin = [a for a in articles if a["word_count"] < 800]
    price_check = [a for a in articles if a["needs_price_check"]]

    report = f"""# Content Refresh Report
Generated: {now}

## Summary
| Status | Count |
|--------|-------|
| Total Articles | {len(articles)} |
| Fresh (< {FRESH_THRESHOLD} days) | {len([a for a in articles if a['status'] == 'fresh'])} |
| Needs Review ({FRESH_THRESHOLD}-{STALE_THRESHOLD} days) | {len(review)} |
| Stale (> {STALE_THRESHOLD} days) | {len(stale)} |
| Thin Content (< 800 words) | {len(thin)} |

---

## 🚨 Needs Immediate Update ({len(stale)} articles)
These articles are over {STALE_THRESHOLD} days old and likely have outdated information.

"""

    for a in stale:
        report += f"- **{a['title']}** (published {a['date']}, {a['days_old']} days ago)\n"
        report += f"  `/blog/{a['slug']}` | {a['word_count']} words\n\n"

    report += f"\n---\n\n## ⚠️ Should Review ({len(review)} articles)\nThese articles are {FRESH_THRESHOLD}-{STALE_THRESHOLD} days old. Consider refreshing with updated info.\n\n"

    for a in review:
        report += f"- {a['title']} (published {a['date']}, {a['days_old']} days ago)\n"

    if thin:
        report += f"\n---\n\n## 📝 Thin Content ({len(thin)} articles)\nThese articles have fewer than 800 words. Consider expanding for better SEO.\n\n"
        for a in thin:
            report += f"- {a['title']} — {a['word_count']} words\n"

    if price_check:
        report += f"\n---\n\n## 💰 Price Info Check ({len(price_check)} articles)\nThese articles may have outdated pricing. Verify current prices.\n\n"
        for a in price_check:
            report += f"- {a['title']}\n"

    report += f"\n---\n*Report generated by Decryptica content tracker*\n"

    return report


def update_tracker(articles):
    """Update the JSON tracker file"""
    tracker = {
        "last_updated": datetime.now().isoformat(),
        "total_articles": len(articles),
        "fresh_articles": len([a for a in articles if a["status"] == "fresh"]),
        "needs_review": len([a for a in articles if a["status"] == "review"]),
        "stale_articles": len([a for a in articles if a["status"] == "stale"]),
        "articles": articles,
    }

    os.makedirs(os.path.dirname(TRACKER_FILE), exist_ok=True)
    with open(TRACKER_FILE, "w") as f:
        json.dump(tracker, f, indent=2)

    return tracker


def main():
    print("🔍 Analyzing article freshness...")
    articles = analyze_articles()

    if not articles:
        print("No articles found to analyze.")
        return

    # Sort by status priority (stale first, then review)
    status_order = {"stale": 0, "review": 1, "fresh": 2}
    articles.sort(key=lambda a: (status_order[a["status"]], -a["days_old"]))

    # Update tracker
    tracker = update_tracker(articles)

    # Generate and save report
    report = generate_report(articles)
    os.makedirs(os.path.dirname(REPORT_FILE), exist_ok=True)
    with open(REPORT_FILE, "w") as f:
        f.write(report)

    print(f"\n📊 Content Refresh Report")
    print(f"{'='*40}")
    print(f"  Total articles: {tracker['total_articles']}")
    print(f"  Fresh:          {tracker['fresh_articles']}")
    print(f"  Needs review:   {tracker['needs_review']}")
    print(f"  Stale:          {tracker['stale_articles']}")
    print(f"\n📄 Report saved: {REPORT_FILE}")
    print(f"📄 Tracker saved: {TRACKER_FILE}")

    if tracker["stale_articles"] > 0:
        print(f"\n🚨 {tracker['stale_articles']} articles need immediate update!")
        print(f"   Run: open {REPORT_FILE}")

    if tracker["needs_review"] > 0:
        print(f"\n⚠️ {tracker['needs_review']} articles should be reviewed this week")


if __name__ == "__main__":
    main()
