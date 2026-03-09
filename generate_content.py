#!/usr/bin/env python3
"""
Decryptica Content Generator
Generates 6 articles per day: 3 lists + 3 news
"""

import os
import random
from datetime import datetime

# Configuration
BASE_PATH = "/Users/kevinsimac/.openclaw/workspace/decryptica"
ARTICLES_LOG = BASE_PATH + "/articles_log.txt"

# Article templates
LIST_TOPICS = {
    "ai": [
        "Best AI Agents for Automation",
        "Top AI Coding Assistants",
        "Best AI Writing Tools",
        "Most Useful AI Chrome Extensions",
        "Best AI Tools for Crypto",
        "Top AI Plugins for ChatGPT",
        "Best AI Voice Assistants",
        "AI Tools for Developers",
    ],
    "crypto": [
        "Best Crypto Wallets for Beginners",
        "Top DeFi Protocols",
        "Best Hardware Wallets",
        "Most Popular Solana dApps",
        "Best Crypto Trading Strategies",
        "Top Crypto Podcasts",
        "Best Crypto Learning Resources",
        "Most Secure Exchanges",
    ],
    "automation": [
        "Best Automation Tools",
        "Top Zapier Alternatives",
        "Best Productivity Apps",
        "Chrome Extensions for Productivity",
        "Best API Tools for Developers",
        "Top No-Code Platforms",
        "Best Task Management Apps",
        "Automation Tools for Small Business",
    ]
}

NEWS_TOPICS = [
    "Bitcoin ETF",
    "Solana Price Prediction",
    "Ethereum Updates",
    "New AI Tools Launch",
    "Crypto Regulation",
    "DeFi Trends",
    "NFT Market",
    "Web3 Development",
    "Blockchain News",
    "AI and Crypto Integration",
]

def get_published_articles():
    """Get list of already published articles"""
    if not os.path.exists(ARTICLES_LOG):
        return []
    with open(ARTICLES_LOG, 'r') as f:
        return [line.strip() for line in f.readlines()]

def log_article(title, filename):
    """Log published article"""
    with open(ARTICLES_LOG, 'a') as f:
        f.write(f"{datetime.now().date()}|{title}|{filename}\n")

def generate_list_article(category, topic):
    """Generate a listicle article"""
    title = f"10 Best {topic} in 2026"
    
    content = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} - Decryptica</title>
    <meta name="description" content="Discover the 10 best {topic.lower()} in 2026. Our expert picks for {category} tools that deliver results.">
    <meta name="keywords" content="{topic.lower()}, best {category.lower()}, {topic.lower()} 2026">
    <meta name="author" content="Decryptica - Renegade Reels LLC">
    <link rel="canonical" href="https://decryptica.com/">
    <script>
        window.va = window.va || function() {{ (window.vaq = window.vaq || []).push(arguments); }};
    </script>
    <script defer src='https://cdn.jsdelivr.net/npm/vercel-analytics@1.3.1'></script>
    <style>
        :root {{ --bg-primary: #000000; --bg-secondary: #161617; --bg-tertiary: #1d1d1f; --text-primary: #f5f5f7; --text-secondary: #86868b; --accent: #2997ff; }}
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: var(--bg-primary); color: var(--text-primary); line-height: 1.6; }}
        nav {{ background: rgba(0,0,0,0.8); padding: 16px 24px; border-bottom: 1px solid rgba(255,255,255,0.1); }}
        nav a {{ color: var(--accent); text-decoration: none; font-weight: 600; }}
        .container {{ max-width: 700px; margin: 0 auto; padding: 60px 24px; }}
        h1 {{ font-size: 36px; margin-bottom: 16px; }}
        .meta {{ color: var(--text-secondary); font-size: 14px; margin-bottom: 40px; }}
        h2 {{ font-size: 24px; margin: 40px 0 16px; }}
        p {{ color: var(--text-secondary); margin-bottom: 16px; }}
        ul {{ margin: 16px 0 16px 24px; color: var(--text-secondary); }}
        li {{ margin-bottom: 12px; }}
        .cta {{ background: var(--accent); color: #fff; padding: 12px 24px; border-radius: 24px; text-decoration: none; display: inline-block; margin-top: 20px; }}
        footer {{ background: var(--bg-secondary); padding: 24px; text-align: center; border-top: 1px solid rgba(255,255,255,0.1); }}
        footer p {{ color: var(--text-secondary); font-size: 12px; }}
    </style>
</head>
<body>
    <nav><a href="https://decryptica.com">← Back to Decryptica</a></nav>
    <div class="container">
        <h1>{title}</h1>
        <p class="meta">Published: {datetime.now().strftime('%B %d, %Y')} | 8 min read</p>
        
        <p>Looking for the best {topic.lower()}? We've tested dozens of options and compiled this list of the top 10 that actually deliver results in 2026.</p>
        
        <h2>#1 Best Overall Pick</h2>
        <p>Our top pick combines ease of use with powerful features. Perfect for beginners and pros alike.</p>
        
        <h2>#2 Best Value</h2>
        <p>Great features at an affordable price point. Ideal for those just starting out.</p>
        
        <h2>#3 Best for Power Users</h2>
        <p>Advanced features for users who need maximum control and customization.</p>
        
        <h2>Honorable Mentions</h2>
        <p>Several other options worth considering depending on your specific needs.</p>
        
        <a href="https://decryptica.com" class="cta">Explore More Articles</a>
    </div>
    <footer><p>© 2026 Decryptica. All rights reserved. | Renegade Reels LLC</p></footer>
</body>
</html>'''
    
    filename = f"{topic.lower().replace(' ', '-')}-{datetime.now().strftime('%m%d')}.html"
    filepath = BASE_PATH + "/" + filename
    
    with open(filepath, 'w') as f:
        f.write(content)
    
    log_article(title, filename)
    return filename

def generate_news_article(topic):
    """Generate a news article"""
    title = f"{topic}: What You Need to Know in {datetime.now().strftime('%B %Y')}"
    
    content = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} - Decryptica</title>
    <meta name="description" content="Latest news and analysis on {topic.lower()}. Stay updated with the most important developments in the crypto and AI space.">
    <meta name="keywords" content="{topic.lower()}, crypto news, ai news, {topic.lower()} 2026">
    <meta name="author" content="Decryptica - Renegade Reels LLC">
    <link rel="canonical" href="https://decryptica.com/">
    <script>
        window.va = window.va || function() {{ (window.vaq = window.vaq || []).push(arguments); }};
    </script>
    <script defer src='https://cdn.jsdelivr.net/npm/vercel-analytics@1.3.1'></script>
    <style>
        :root {{ --bg-primary: #000000; --bg-secondary: #161617; --bg-tertiary: #1d1d1f; --text-primary: #f5f5f7; --text-secondary: #86868b; --accent: #2997ff; }}
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: var(--bg-primary); color: var(--text-primary); line-height: 1.6; }}
        nav {{ background: rgba(0,0,0,0.8); padding: 16px 24px; border-bottom: 1px solid rgba(255,255,255,0.1); }}
        nav a {{ color: var(--accent); text-decoration: none; font-weight: 600; }}
        .container {{ max-width: 700px; margin: 0 auto; padding: 60px 24px; }}
        h1 {{ font-size: 36px; margin-bottom: 16px; }}
        .meta {{ color: var(--text-secondary); font-size: 14px; margin-bottom: 40px; }}
        .tag {{ background: rgba(41,151,255,0.2); color: var(--accent); padding: 4px 12px; border-radius: 12px; font-size: 12px; text-transform: uppercase; }}
        h2 {{ font-size: 24px; margin: 40px 0 16px; }}
        p {{ color: var(--text-secondary); margin-bottom: 16px; }}
        .highlight {{ background: var(--bg-tertiary); padding: 24px; border-radius: 12px; margin: 24px 0; border-left: 4px solid var(--accent); }}
        .cta {{ background: var(--accent); color: #fff; padding: 12px 24px; border-radius: 24px; text-decoration: none; display: inline-block; margin-top: 20px; }}
        footer {{ background: var(--bg-secondary); padding: 24px; text-align: center; border-top: 1px solid rgba(255,255,255,0.1); }}
        footer p {{ color: var(--text-secondary); font-size: 12px; }}
    </style>
</head>
<body>
    <nav><a href="https://decryptica.com">← Back to Decryptica</a></nav>
    <div class="container">
        <span class="tag">Breaking News</span>
        <h1>{title}</h1>
        <p class="meta">Published: {datetime.now().strftime('%B %d, %Y')}</p>
        
        <div class="highlight">
            <strong>Key Takeaway:</strong> This is a developing story. We'll update this article as more information becomes available.
        </div>
        
        <p>The {topic.lower()} space is evolving rapidly. Here's what you need to know right now.</p>
        
        <h2>What's Happening</h2>
        <p>Recent developments have brought increased attention to {topic.lower()}. Industry experts are watching closely to see how this will impact the broader ecosystem.</p>
        
        <h2>Why It Matters</h2>
        <p>Whether you're a seasoned veteran or just getting started, these changes could affect your strategy. Here's how.</p>
        
        <h2>What to Watch For</h2>
        <ul>
            <li>Market reactions and price movements</li>
            <li>New partnerships and integrations</li>
            <li>Regulatory developments</li>
            <li>Community response</li>
        </ul>
        
        <p>We'll continue monitoring this story and providing updates as they happen.</p>
        
        <a href="https://decryptica.com" class="cta">Explore More Articles</a>
    </div>
    <footer><p>© 2026 Decryptica. All rights reserved. | Renegade Reels LLC</p></footer>
</body>
</html>'''
    
    filename = f"news-{topic.lower().replace(' ', '-')}-{datetime.now().strftime('%m%d')}.html"
    filepath = BASE_PATH + "/" + filename
    
    with open(filepath, 'w') as f:
        f.write(content)
    
    log_article(title, filename)
    return filename

def main():
    """Generate 6 articles: 3 lists + 3 news"""
    print(f"Generating content for {datetime.now().date()}")
    
    # Get already published topics
    published = get_published_articles()
    
    # Generate 3 list articles (one per category)
    for category in ["ai", "crypto", "automation"]:
        available = [t for t in LIST_TOPICS[category] if t not in published]
        if not available:
            available = LIST_TOPICS[category]
        topic = random.choice(available)
        
        print(f"Generating list article: {topic}")
        generate_list_article(category, topic)
    
    # Generate 3 news articles
    for _ in range(3):
        topic = random.choice(NEWS_TOPICS)
        print(f"Generating news article: {topic}")
        generate_news_article(topic)
    
    print("Content generation complete!")

if __name__ == "__main__":
    main()
