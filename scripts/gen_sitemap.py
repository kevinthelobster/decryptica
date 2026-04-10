#!/usr/bin/env python3
import re
import os
from datetime import datetime

BASE_URL = 'https://www.decryptica.com'

with open('app/data/articles.ts', 'r') as f:
    content = f.read()

start = content.find('export const articles: Article[] = [')
end = content.rfind('];', start)
section = content[start:end+2]

topic_slugs = {'crypto', 'ai', 'automation'}
slug_positions = [(m.start(), m.group(1)) for m in re.finditer(r"slug:\s*'([^']+)'", section)]
date_positions = [(m.start(), m.group(1)) for m in re.finditer(r"date:\s*'([^']+)'", section)]

articles = []
for pos, slug in slug_positions:
    if slug in topic_slugs:
        continue
    for dp, dv in date_positions:
        if dp > pos:
            articles.append({'slug': slug, 'date': dv})
            break

print(f'Found {len(articles)} articles')
print('First 3:', articles[:3])

os.makedirs('public/sitemaps', exist_ok=True)

# Generate sitemap
urls = []
for a in articles:
    try:
        days = (datetime.now() - datetime.fromisoformat(a['date'].split('T')[0])).days
    except:
        days = 30
    pri = '0.9' if days < 7 else '0.7'
    freq = 'daily' if days < 7 else ('weekly' if days < 30 else 'monthly')
    urls.append(f"  <url>\n    <loc>{BASE_URL}/blog/{a['slug']}</loc>\n    <lastmod>{a['date']}</lastmod>\n    <changefreq>{freq}</changefreq>\n    <priority>{pri}</priority>\n  </url>")

xml = f'''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
  xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
>
{chr(10).join(urls)}
</urlset>'''

with open('public/sitemaps/articles.xml', 'w') as f:
    f.write(xml)
print('Wrote public/sitemaps/articles.xml')

# News sitemap
two_days_ago = datetime.now().replace(hour=0, minute=0, second=0)
recent = []
for a in articles:
    try:
        art_date = datetime.fromisoformat(a['date'].split('T')[0])
        if art_date >= two_days_ago:
            recent.append(a)
    except:
        pass

def esc(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')

news_urls = '\n'.join(f"  <url>\n    <loc>{BASE_URL}/blog/{a['slug']}</loc>\n    <news:news>\n      <news:publication>\n        <news:name>Decryptica</news:name>\n        <news:language>en</news:language>\n      </news:publication>\n      <news:publication_date>{a['date']}</news:publication_date>\n      <news:title>{esc(a['slug'].replace('-', ' ').title())}</news:title>\n    </news:news>\n  </url>" for a in recent)
news_xml = f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n{news_urls}\n</urlset>'
with open('public/sitemaps/news.xml', 'w') as f:
    f.write(news_xml)
print(f'Wrote public/sitemaps/news.xml ({len(recent)} recent)')

# Update main sitemap
if os.path.exists('public/sitemap.xml'):
    with open('public/sitemap.xml', 'r') as f:
        sm = f.read()
    if 'articles.xml' not in sm:
        today = datetime.now().strftime('%Y-%m-%d')
        entry = f'\n    <sitemap>\n      <loc>https://www.decryptica.com/sitemaps/articles.xml</loc>\n      <lastmod>{today}</lastmod>\n    </sitemap>\n    <sitemap>\n      <loc>https://www.decryptica.com/sitemaps/news.xml</loc>\n      <lastmod>{today}</lastmod>\n    </sitemap>'
        sm = sm.replace('</sitemapindex>', entry + '\n</sitemapindex>')
        with open('public/sitemap.xml', 'w') as f:
            f.write(sm)
        print('Updated public/sitemap.xml')

print(f'Total articles: {len(articles)}')