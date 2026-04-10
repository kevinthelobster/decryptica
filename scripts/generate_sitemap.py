#!/usr/bin/env python3
"""
Standalone Article Sitemap Generator for Decryptica
Run: python scripts/generate_sitemap.py
Reads articles.ts and generates comprehensive sitemap.
"""

import re
import json
from datetime import datetime

BASE_URL = 'https://www.decryptica.com'
ARTICLES_PATH = 'app/data/articles.ts'

def estimate_word_count(content):
    """Estimate word count from markdown content."""
    text = re.sub(r'```[\s\S]*?```', '', content)
    text = re.sub(r'[#*`_~\\[\]<>]', '', text)
    words = [w for w in text.split() if w]
    return len(words)

def get_priority(word_count, date_str):
    """Calculate priority based on freshness and word count."""
    try:
        days_since = (datetime.now() - datetime.fromisoformat(date_str)).days
        if days_since < 7:
            return '0.9'
        if word_count >= 1500:
            return '0.8'
        return '0.7'
    except:
        return '0.7'

def get_changefreq(date_str, last_updated=None):
    """Determine change frequency based on date."""
    latest = last_updated or date_str
    try:
        days = (datetime.now() - datetime.fromisoformat(latest)).days
        if days < 7:
            return 'daily'
        if days < 30:
            return 'weekly'
        return 'monthly'
    except:
        return 'monthly'

def escape_xml(text):
    """Escape XML special characters."""
    return (text
        .replace('&', '&amp;')
        .replace('<', '&lt;')
        .replace('>', '&gt;')
        .replace('"', '&quot;')
        .replace("'", '&apos;'))

def parse_articles_ts(content):
    """Parse the TypeScript articles file."""
    articles = []
    
    # Find the articles array - look for the export
    match = re.search(r'export\s+const\s+articles:\s*Article\[\]\s*=\s*\[([\s\S]*)\];', content)
    if not match:
        # Try alternate pattern
        match = re.search(r'export\s+const\s+articles\s*=\s*\[([\s\S]*)\];', content)
    
    if not match:
        print("Could not find articles array")
        return []
    
    array_content = match.group(1)
    
    # Split by article objects (look for id: patterns)
    # Each article has: id, slug, title, excerpt, content, category, readTime, date
    article_pattern = r'\{[^}]*(?:id:[^,]+,[^}]*slug:[^,]+,[^}]*)\}'
    
    # Find all article objects more simply - look for {...} blocks
    # Better approach: find each {...} and check if it has required fields
    depth = 0
    start = -1
    articles_raw = []
    
    for i, char in enumerate(array_content):
        if char == '{':
            if start == -1:
                start = i
            depth += 1
        elif char == '}':
            depth -= 1
            if depth == 0 and start != -1:
                articles_raw.append(array_content[start:i+1])
                start = -1
    
    for raw in articles_raw:
        try:
            # Extract fields using regex
            id_match = re.search(r"id:\s*['\"]([^'\"]+)['\"]", raw)
            slug_match = re.search(r"slug:\s*['\"]([^'\"]+)['\"]", raw)
            title_match = re.search(r"title:\s*['\"]([^'\"]+)['\"]", raw)
            date_match = re.search(r"date:\s*['\"]([^'\"]+)['\"]", raw)
            last_updated_match = re.search(r"lastUpdated:\s*['\"]([^'\"]+)['\"]", raw)
            
            # Content extraction - everything between content: ' and ',
            content_match = re.search(r"content:\s*`([^`]*)`", raw, re.DOTALL)
            if not content_match:
                content_match = re.search(r"content:\s*['\"]([^'\"]+)['\"]", raw, re.DOTALL)
            
            # Extract wordCount if present
            word_count_match = re.search(r"wordCount:\s*(\d+)", raw)
            
            if id_match and slug_match and title_match and date_match:
                article = {
                    'id': id_match.group(1),
                    'slug': slug_match.group(1),
                    'title': title_match.group(1),
                    'date': date_match.group(1),
                }
                
                if content_match:
                    article['content'] = content_match.group(1)
                else:
                    article['content'] = ''
                
                if last_updated_match:
                    article['lastUpdated'] = last_updated_match.group(1)
                
                if word_count_match:
                    article['wordCount'] = int(word_count_match.group(1))
                else:
                    article['wordCount'] = estimate_word_count(article['content'])
                
                articles.append(article)
        except Exception as e:
            continue
    
    return articles

def main():
    # Read articles file
    with open(ARTICLES_PATH, 'r', encoding='utf-8') as f:
        content = f.read()
    
    articles = parse_articles_ts(content)
    print(f"Loaded {len(articles)} articles from articles.ts")
    
    # Generate entries
    entries = []
    for article in articles:
        url = f"{BASE_URL}/blog/{article['slug']}"
        lastmod = article.get('lastUpdated', article['date'])
        word_count = article.get('wordCount', estimate_word_count(article.get('content', '')))
        
        entries.append({
            'url': url,
            'lastmod': lastmod,
            'priority': get_priority(word_count, article['date']),
            'changefreq': get_changefreq(article['date'], article.get('lastUpdated'))
        })
    
    # Sort by date (newest first)
    entries.sort(key=lambda x: x['lastmod'], reverse=True)
    
    # Build XML
    urls_xml = '\n'.join(f"""  <url>
    <loc>{entry['url']}</loc>
    <lastmod>{entry['lastmod']}</lastmod>
    <changefreq>{entry['changefreq']}</changefreq>
    <priority>{entry['priority']}</priority>
  </url>""" for entry in entries)
    
    sitemap = f'''<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
  xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
>
{urls_xml}
</urlset>'''
    
    # Write article sitemap
    import os
    sitemaps_dir = 'public/sitemaps'
    os.makedirs(sitemaps_dir, exist_ok=True)
    
    sitemap_path = f'{sitemaps_dir}/articles.xml'
    with open(sitemap_path, 'w', encoding='utf-8') as f:
        f.write(sitemap)
    print(f"✓ Article sitemap written: {sitemap_path}")
    
    # Generate news sitemap (last 2 days)
    two_days_ago = datetime.now().replace(hour=0, minute=0, second=0)
    recent_articles = [a for a in articles if datetime.fromisoformat(a['date']) >= two_days_ago]
    
    news_urls_xml = '\n'.join(f"""  <url>
    <loc>{BASE_URL}/blog/{a['slug']}</loc>
    <news:news>
      <news:publication>
        <news:name>Decryptica</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>{a['date']}</news:publication_date>
      <news:title>{escape_xml(a['title'])}</news:title>
    </news:news>
  </url>""" for a in recent_articles)
    
    news_sitemap = f'''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
{news_urls_xml}
</urlset>'''
    
    news_path = f'{sitemaps_dir}/news.xml'
    with open(news_path, 'w', encoding='utf-8') as f:
        f.write(news_sitemap)
    print(f"✓ News sitemap written: {news_path} ({len(recent_articles)} recent articles)")
    
    # Update main sitemap
    main_sitemap_path = 'public/sitemap.xml'
    if os.path.exists(main_sitemap_path):
        with open(main_sitemap_path, 'r', encoding='utf-8') as f:
            main_sitemap = f.read()
        
        if 'articles.xml' not in main_sitemap:
            today = datetime.now().strftime('%Y-%m-%d')
            article_entry = f'''    <sitemap>
      <loc>https://www.decryptica.com/sitemaps/articles.xml</loc>
      <lastmod>{today}</lastmod>
    </sitemap>
    <sitemap>
      <loc>https://www.decryptica.com/sitemaps/news.xml</loc>
      <lastmod>{today}</lastmod>
    </sitemap>'''
            main_sitemap = main_sitemap.replace('</sitemapindex>', f'{article_entry}\n</sitemapindex>')
            with open(main_sitemap_path, 'w', encoding='utf-8') as f:
                f.write(main_sitemap)
            print(f"✓ Updated main sitemap with article and news sitemap references")
    
    print(f'\n📋 Sitemap Summary:')
    print(f'   Articles: {len(articles)}')
    print(f'   Priority 0.9 (fresh <7 days): {len([e for e in entries if e["priority"] == "0.9"])}')
    print(f'   Recent news articles: {len(recent_articles)}')

if __name__ == '__main__':
    main()