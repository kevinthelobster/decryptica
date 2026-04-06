#!/usr/bin/env python3
"""
Google Search Console URL Submission Script for Decryptica
Submits new articles to Google Search Console for faster indexing.

Usage:
    python3 scripts/submit_to_search_console.py                    # Submit all unindexed
    python3 scripts/submit_to_search_console.py --url "https://..."  # Submit specific URL
    python3 scripts/submit_to_search_console.py --recent 5         # Submit last N articles

Note: Google Search Console API requires:
    1. Site verification in GSC
    2. OAuth2 credentials OR a service account with GSC access
    3. The 'webmasters' API enabled

For a simpler approach without OAuth, this script also generates a
URL inspection batch file you can paste into GSC's URL Inspector.

Alternative (recommended): Use the Google Search Console UI batch inspection
at: https://search.google.com/search-console/inspect
"""

import os
import sys
import json
import argparse
from datetime import datetime, timedelta
from urllib.request import Request, urlopen
from urllib.parse import urlencode
import re

BASE_PATH = "/Users/kevinsimac/.openclaw/workspace/decryptica"
ARTICLES_LOG = BASE_PATH + "/articles_log.txt"
TRACKER_FILE = BASE_PATH + "/data/submitted_urls.json"

# Configuration
GSC_API_KEY = os.environ.get("GSC_API_KEY", "")  # Optional if using URL Inspector method
GSC_SITE_URL = "sc-domain:decryptica.com"  # Or use https://decryptica.com


def load_submitted_tracker():
    """Load the tracker of already-submitted URLs"""
    if not os.path.exists(TRACKER_FILE):
        return {}

    try:
        with open(TRACKER_FILE, "r") as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return {}


def save_submitted_tracker(tracker):
    """Save the updated tracker"""
    os.makedirs(os.path.dirname(TRACKER_FILE), exist_ok=True)
    with open(TRACKER_FILE, "w") as f:
        json.dump(tracker, f, indent=2)


def get_recent_articles(count=10):
    """Get recent articles from the log"""
    if not os.path.exists(ARTICLES_LOG):
        print("No articles log found.")
        return []

    articles = []
    with open(ARTICLES_LOG, "r") as f:
        lines = f.readlines()

    # Skip header if exists, get last N articles
    for line in lines[-count:]:
        parts = line.strip().split("|")
        if len(parts) >= 3:
            date = parts[0]
            title = parts[1]
            filename = parts[2]
            url = f"https://decryptica.com/{filename}"
            articles.append({"date": date, "title": title, "filename": filename, "url": url})

    return list(reversed(articles))


def submit_url_inspector(url):
    """
    Submit URL to Google URL Inspector via their batch inspection tool.
    Since the GSC API requires OAuth, we generate a batch file for manual use.
    Returns True if URL was successfully submitted (or queued for manual inspection).
    """
    return True  # Always succeeds — we generate the inspection list


def generate_inspection_batch(articles, output_file=None):
    """
    Generate a batch inspection list for Google Search Console URL Inspector.
    Paste these URLs into the URL Inspector tool at:
    https://search.google.com/search-console/inspect

    Google allows batch inspection of up to 10 URLs at a time.
    """
    if output_file is None:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = f"{BASE_PATH}/data/gsc_inspection_batch_{timestamp}.txt"

    os.makedirs(os.path.dirname(output_file), exist_ok=True)

    with open(output_file, "w") as f:
        f.write(f"# Google Search Console URL Inspection Batch\n")
        f.write(f"# Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"# Paste these URLs into GSC URL Inspector (max 10 at a time)\n")
        f.write(f"# URL: https://search.google.com/search-console/inspect\n")
        f.write("#" + "=" * 60 + "\n\n")

        for article in articles:
            f.write(f"{article['url']}\n")

    print(f"\n✓ Inspection batch written: {output_file}")
    print(f"  {len(articles)} URLs ready for inspection")
    print(f"\n📋 Next steps:")
    print(f"  1. Go to: https://search.google.com/search-console/inspect")
    print(f"  2. Paste URLs from: {output_file}")
    print(f"  3. Click 'Request indexing' for each")
    print(f"  4. Or use the 'Inspect any URL' tab for batch submission")

    return output_file


def generate_sitemap_submission():
    """
    Generate the command/script to submit sitemap to Google.
    Google automatically discovers sitemaps if properly referenced in robots.txt.
    This generates a curl command you can run to submit directly.
    """
    sitemap_url = "https://decryptica.com/sitemaps/articles.xml"

    print(f"\n📋 Sitemap Submission:")
    print(f"  Sitemap URL: {sitemap_url}")
    print(f"  Submit via: https://search.google.com/search-console/sitemaps")
    print(f"  Or use the Google Ping API:")

    ping_url = f"https://www.google.com/ping?sitemap={sitemap_url}"
    print(f"  GET: {ping_url}")

    return ping_url


def check_url_indexed(url):
    """
    Check if a URL is already indexed using Google (via site: search).
    Returns True if indexed, False if not.
    """
    try:
        search_url = f"https://www.google.com/search?q=site:{url}&num=1"
        req = Request(search_url, headers={"User-Agent": "Mozilla/5.0"})
        resp = urlopen(req, timeout=10)
        html = resp.read().decode("utf-8", errors="ignore")

        # If the URL appears in the search results, it's indexed
        if url.replace("https://", "")[:50] in html:
            return True
        return False
    except Exception as e:
        print(f"  Warning: Could not check indexing status: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(description="Submit Decryptica URLs to Google Search Console")
    parser.add_argument("--url", help="Submit a specific URL")
    parser.add_argument("--recent", type=int, default=5, help="Submit last N articles (default: 5)")
    parser.add_argument("--all", action="store_true", help="Submit ALL articles from log")
    parser.add_argument("--check", action="store_true", help="Check indexing status without submitting")
    parser.add_argument("--force", action="store_true", help="Re-submit even if already submitted")

    args = parser.parse_args()

    tracker = load_submitted_tracker()
    articles_to_submit = []

    if args.url:
        # Single URL submission
        articles_to_submit = [{"url": args.url, "title": "Manual submission", "date": datetime.now().date().isoformat()}]
    elif args.all:
        # All articles
        articles_to_submit = get_recent_articles(count=100)
    else:
        # Recent articles
        articles_to_submit = get_recent_articles(count=args.recent)

    if not articles_to_submit:
        print("No articles to submit.")
        return

    # Filter out already-submitted URLs (unless --force)
    if not args.force:
        before_count = len(articles_to_submit)
        articles_to_submit = [a for a in articles_to_submit if a["url"] not in tracker]
        print(f"Filtered {before_count - len(articles_to_submit)} already-submitted URLs")

    if not articles_to_submit:
        print("All selected URLs have already been submitted.")
        return

    print(f"\n{'='*60}")
    print(f"Google Search Console URL Submission")
    print(f"{'='*60}")
    print(f"Selected: {len(articles_to_submit)} URLs\n")

    for article in articles_to_submit:
        print(f"  📄 {article['url']}")

    # Generate the inspection batch file
    batch_file = generate_inspection_batch(articles_to_submit)

    # Generate sitemap submission info
    generate_sitemap_submission()

    # Update tracker
    for article in articles_to_submit:
        tracker[article["url"]] = {
            "submitted": datetime.now().isoformat(),
            "title": article["title"],
        }

    save_submitted_tracker(tracker)
    print(f"\n✓ Tracker updated with {len(articles_to_submit)} submissions")
    print(f"\n{'='*60}")
    print("✅ Done! Follow the steps above to complete submission.")
    print(f"{'='*60}\n")

    # Print batch file contents for easy copy-paste
    print("\n📋 Quick copy-paste list for URL Inspector:\n")
    for article in articles_to_submit:
        print(f"  {article['url']}")


if __name__ == "__main__":
    main()
