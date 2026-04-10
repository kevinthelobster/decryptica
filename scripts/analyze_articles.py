#!/usr/bin/env python3
"""
Article data extractor for SEO KPI pipeline.
Parses articles.ts and outputs structured JSON for KPI processing.
"""
import re
import json
import sys
from datetime import datetime

ARTICLES_FILE = '/Users/kevinsimac/.openclaw/workspace/decryptica/app/data/articles.ts'
OUTPUT_FILE = '/Users/kevinsimac/.openclaw/workspace/decryptica/data/kpi/article_data.json'

def extract_articles():
    with open(ARTICLES_FILE) as f:
        content = f.read()

    # Find articles array boundaries
    articles_marker = 'export const articles: Article[] = ['
    start_idx = content.find(articles_marker)
    if start_idx < 0:
        return []

    # Find the actual opening bracket of the array
    first_bracket = content.find('[', start_idx)
    second_bracket = content.find('[', first_bracket + 1)

    # Count brackets to find matching ]
    depth = 0
    end_idx = second_bracket
    for i in range(second_bracket + 1, len(content)):
        if content[i] == '{':
            depth += 1
        elif content[i] == '}':
            depth -= 1
        elif content[i] == ']' and depth == 0:
            end_idx = i
            break

    articles_text = content[second_bracket + 1:end_idx]

    # Split into individual articles by id:
    # First, remove all content: `...` blocks (template literals) to avoid id: inside content
    clean = re.sub(r'content:\s*`[^`]*`', '"__CONTENT__"', articles_text, flags=re.DOTALL)
    clean = re.sub(r"content:\s*'[^']*'", '"__CONTENT__"', clean)
    clean = re.sub(r'content:\s*"[^"]*"', '"__CONTENT__"', clean)

    # Split by article ID
    parts = re.split(r"\bid:\s*'[^']+'\s*,\s*", clean)

    articles = []
    for part in parts[1:]:  # Skip first (empty)
        slug_m = re.search(r"slug:\s*'([^']+)'", part)
        title_m = re.search(r"title:\s*\"([^\"]+)\"", part)
        if not title_m:
            title_m = re.search(r"title:\s*'([^']+)'", part)
        cat_m = re.search(r"category:\s*'([^']+)'", part)
        date_m = re.search(r"date:\s*'([^']+)'", part)
        wc_m = re.search(r'wordCount:\s*(\d+)', part)

        if slug_m and cat_m and date_m:
            word_count = int(wc_m.group(1)) if wc_m else None
            title = title_m.group(1) if title_m else ''
            articles.append({
                'slug': slug_m.group(1),
                'title': title,
                'category': cat_m.group(1),
                'date': date_m.group(1),
                'wordCount': word_count,
            })

    return articles


def analyze_articles(articles):
    now = datetime.now()
    week_start = now.strftime('%Y-%m-%d')  # Simplified - current date

    # Get week start (Monday)
    days_since_monday = now.weekday()
    week_start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
    from datetime import timedelta
    week_start_date -= timedelta(days=days_since_monday)
    week_start_str = week_start_date.strftime('%Y-%m-%d')

    total = len(articles)
    published_this_week = len([a for a in articles if a['date'] >= week_start_str])

    word_counts = [a['wordCount'] for a in articles if a['wordCount'] and a['wordCount'] > 0]
    if not word_counts:
        # Estimate from title length
        word_counts = [len(a['title'].split()) * 20 for a in articles if a['title']]

    total_wc = sum(word_counts) if word_counts else 0
    avg_wc = total_wc // max(1, len(word_counts)) if word_counts else 0

    stale = len([a for a in articles if a['date'] and (now - datetime.strptime(a['date'], '%Y-%m-%d')).days > 180])
    needs_refresh = len([a for a in articles if a['date'] and 90 < (now - datetime.strptime(a['date'], '%Y-%m-%d')).days <= 180])
    thin = len([a for a in articles if a['wordCount'] and a['wordCount'] < 800])

    top_articles = sorted(articles, key=lambda a: a['wordCount'] or 0, reverse=True)[:5]
    top_articles_data = [
        {'slug': a['slug'], 'title': a['title'], 'category': a['category'],
         'wordCount': a['wordCount'] or avg_wc, 'date': a['date']}
        for a in top_articles
    ]

    return {
        'totalArticles': total,
        'publishedThisWeek': published_this_week,
        'totalWordCount': total_wc,
        'avgWordCount': avg_wc,
        'thinContent': thin,
        'needsRefresh': needs_refresh,
        'stale': stale,
        'topArticles': top_articles_data,
    }


def main():
    articles = extract_articles()
    if not articles:
        print("WARNING: No articles found!", file=sys.stderr)
        articles = []

    analysis = analyze_articles(articles)
    analysis['_articles'] = articles  # Include raw data for debugging

    # Save
    import os
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(analysis, f, indent=2)

    print(f"Extracted {len(articles)} articles")
    print(f"Total: {analysis['totalArticles']}, Published this week: {analysis['publishedThisWeek']}")
    print(f"Avg word count: {analysis['avgWordCount']}")
    print(f"Thin: {analysis['thinContent']}, Needs refresh: {analysis['needsRefresh']}, Stale: {analysis['stale']}")
    print(f"Output: {OUTPUT_FILE}")


if __name__ == '__main__':
    main()
