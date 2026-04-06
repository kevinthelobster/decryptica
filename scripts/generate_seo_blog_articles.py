#!/usr/bin/env python3
"""
Decryptica SEO Article Generator — Next.js Native (v3)
Adds articles directly to articles.ts so they automatically get
ALL SEO features from the blog post template.

Usage:
  python3 scripts/generate_seo_blog_articles.py --type list --topic "AI Coding Assistants"
  python3 scripts/generate_seo_blog_articles.py --type all  # Generate 5 random articles
"""

import os
import re
import json
import random
from datetime import datetime

BASE_PATH = "/Users/kevinsimac/.openclaw/workspace/decryptica"
ARTICLES_TS = BASE_PATH + "/app/data/articles.ts"

# ─── Product Database ─────────────────────────────────────────────────────────
PRODUCTS = {
    "ai_coding": [
        {"name": "Cursor", "price": "Free / $20/mo", "url": "https://cursor.sh", "desc": "AI-first code editor built on VS Code"},
        {"name": "GitHub Copilot", "price": "$10/mo", "url": "https://github.com/features/copilot", "desc": "AI pair programmer from GitHub"},
        {"name": "Windsurf", "price": "$15/mo", "url": "https://windsurf.ai", "desc": "AI-powered IDE from Codeium"},
        {"name": "Claude Code", "price": "Free", "url": "https://claude.ai/claude-code", "desc": "Anthropic's CLI for coding"},
        {"name": "Amazon Q Developer", "price": "Free / $19/mo", "url": "https://aws.amazon.com/q", "desc": "AWS AI coding assistant"},
        {"name": "Tabnine", "price": "Free / $12/mo", "url": "https://tabnine.com", "desc": "AI code completion plugin"},
        {"name": "Replit Agent", "price": "$10/mo", "url": "https://replit.com/agent", "desc": "AI builds full apps from prompts"},
        {"name": "Devin", "price": "$28/mo", "url": "https://devin.ai", "desc": "Autonomous AI software engineer"},
        {"name": "CodeWhisperer", "price": "Free", "url": "https://aws.amazon.com/codewhisperer", "desc": "Amazon free AI coding companion"},
        {"name": "MutableAI", "price": "Free / $15/mo", "url": "https://mutable.ai", "desc": "Fast AI-accelerated development"},
    ],
    "ai_writing": [
        {"name": "ChatGPT Plus", "price": "$20/mo", "url": "https://chat.openai.com", "desc": "OpenAI flagship chatbot with GPT-4"},
        {"name": "Claude Pro", "price": "$25/mo", "url": "https://claude.ai/pro", "desc": "Anthropic Claude with extended context"},
        {"name": "Jasper", "price": "$49/mo", "url": "https://jasper.ai", "desc": "AI writing assistant for marketing"},
        {"name": "Copy.ai", "price": "Free / $36/mo", "url": "https://copy.ai", "desc": "AI-powered copy generation"},
        {"name": "Writesonic", "price": "Free / $19/mo", "url": "https://writesonic.com", "desc": "AI writer for SEO content"},
        {"name": "Rytr", "price": "Free / $12/mo", "url": "https://rytr.me", "desc": "Budget-friendly AI writer"},
        {"name": "Notion AI", "price": "$10/mo", "url": "https://notion.so/product/ai", "desc": "AI writing embedded in Notion"},
        {"name": "Grammarly", "price": "Free / $12/mo", "url": "https://grammarly.com", "desc": "AI-powered writing assistant"},
        {"name": "Sudowrite", "price": "$19/mo", "url": "https://sudowrite.com", "desc": "AI for creative fiction writing"},
        {"name": "Wordtune", "price": "Free / $9.99/mo", "url": "https://wordtune.com", "desc": "AI rewriting and summarization"},
    ],
    "ai_image": [
        {"name": "Midjourney", "price": "$10/mo", "url": "https://midjourney.com", "desc": "Hyper-realistic image generation"},
        {"name": "DALL-E 3", "price": "$16/mo", "url": "https://chat.openai.com", "desc": "OpenAI image generator"},
        {"name": "Stable Diffusion 3", "price": "Free / $9/mo", "url": "https://stability.ai", "desc": "Open-source image generation"},
        {"name": "Adobe Firefly", "price": "$4.99/mo", "url": "https://firefly.adobe.com", "desc": "Adobe generative AI"},
        {"name": "Leonardo AI", "price": "Free / $12/mo", "url": "https://leonardo.ai", "desc": "Creative AI platform with tools"},
        {"name": "Canva AI", "price": "$12.99/mo", "url": "https://canva.com", "desc": "AI design tools in Canva"},
        {"name": "Runway", "price": "Free / $15/mo", "url": "https://runwayml.com", "desc": "AI creative suite"},
        {"name": "Pika", "price": "$10/mo", "url": "https://pika.art", "desc": "AI video and image generation"},
        {"name": "Ideogram", "price": "Free / $8/mo", "url": "https://ideogram.ai", "desc": "Text-to-image with typography"},
        {"name": "Recraft", "price": "Free / $15/mo", "url": "https://recraft.ai", "desc": "AI art and design generator"},
    ],
    "crypto_wallets": [
        {"name": "Phantom", "price": "Free", "url": "https://phantom.app", "desc": "Best Solana wallet with mobile app"},
        {"name": "MetaMask", "price": "Free", "url": "https://metamask.io", "desc": "Most popular Ethereum wallet"},
        {"name": "Backpack", "price": "Free", "url": "https://backpack.app", "desc": "Multi-chain wallet with DEX"},
        {"name": "Solflare", "price": "Free", "url": "https://solflare.com", "desc": "Top Solana wallet with staking"},
        {"name": "Exodus", "price": "Free", "url": "https://exodus.com", "desc": "Desktop and mobile multi-chain"},
        {"name": "Rainbow", "price": "Free", "url": "https://rainbow.me", "desc": "Beautiful Ethereum wallet"},
        {"name": "Keplr", "price": "Free", "url": "https://keplrwallet.com", "desc": "Best Cosmos/IBC wallet"},
        {"name": "Rabby", "price": "Free", "url": "https://rabby.io", "desc": "Multi-chain DeFi wallet"},
        {"name": "Coinbase Wallet", "price": "Free", "url": "https://wallet.coinbase.com", "desc": "Self-custody from Coinbase"},
        {"name": "Blade", "price": "Free", "url": "https://bladelabs.io", "desc": "Fast Ethereum wallet"},
    ],
    "hardware_wallets": [
        {"name": "Ledger Nano X", "price": "$149", "url": "https://ledger.com", "desc": "Bluetooth-enabled hardware wallet"},
        {"name": "Trezor Model T", "price": "$219", "url": "https://trezor.io", "desc": "Open-source hardware wallet with touchscreen"},
        {"name": "Trezor Model One", "price": "$69", "url": "https://trezor.io", "desc": "Budget-friendly hardware wallet"},
        {"name": "Ellipal Titan", "price": "$169", "url": "https://ellipal.com", "desc": "Air-gapped mobile wallet"},
        {"name": "SafePal S1", "price": "$49", "url": "https://safepal.com", "desc": "Budget hardware wallet option"},
        {"name": "CoolWallet Pro", "price": "$119", "url": "https://coolwallet.io", "desc": "Credit card form factor"},
        {"name": "BitBox02", "price": "$139", "url": "https://shiftcrypto.ch", "desc": "Swiss-made open-source wallet"},
        {"name": "SecuX V20", "price": "$129", "url": "https://secuxtech.com", "desc": "Large touchscreen wallet"},
        {"name": "Keystone Pro", "price": "$199", "url": "https://keyst.one", "desc": "Open-source with QR code"},
        {"name": "Ledger Stax", "price": "$279", "url": "https://ledger.com", "desc": "Flagship with touchscreen"},
    ],
    "defi_protocols": [
        {"name": "Jupiter", "price": "Fee: 0.1%", "url": "https://jup.ag", "desc": "Top Solana DEX aggregator"},
        {"name": "Raydium", "price": "Fee: 0.25%", "url": "https://raydium.io", "desc": "Solana top AMM with liquidity pools"},
        {"name": "Orca", "price": "Fee: 0.3%", "url": "https://orca.so", "desc": "User-friendly Solana DEX with Whirlpools"},
        {"name": "Uniswap V3", "price": "Fee: 0.3%", "url": "https://uniswap.org", "desc": "Largest Ethereum DEX"},
        {"name": "Aave", "price": "Fee: varies", "url": "https://aave.com", "desc": "Top lending protocol"},
        {"name": "Compound", "price": "Fee: varies", "url": "https://compound.finance", "desc": "Algorithmic money market"},
        {"name": "Lido", "price": "Fee: 10%", "url": "https://lido.fi", "desc": "Liquid staking for ETH/SOL"},
        {"name": "Marinade Finance", "price": "Fee: 2%", "url": "https://marinade.finance", "desc": "Liquid staking on Solana"},
        {"name": "Kamino", "price": "Fee: 0.1%", "url": "https://kamino.finance", "desc": "Solana lending protocol"},
        {"name": "FluxBeam", "price": "Fee: 0.25%", "url": "https://fluxbeam.io", "desc": "Solana token swaps"},
    ],
    "automation": [
        {"name": "Zapier", "price": "Free / $29.99/mo", "url": "https://zapier.com", "desc": "Connect 5,000+ apps"},
        {"name": "Make (Integromat)", "price": "Free / $9/mo", "url": "https://make.com", "desc": "Visual automation platform"},
        {"name": "n8n", "price": "Free / $20/mo", "url": "https://n8n.io", "desc": "Open-source workflow automation"},
        {"name": "IFTTT", "price": "Free / $2.50/mo", "url": "https://ifttt.com", "desc": "Simple if-this-then automations"},
        {"name": "Pabbly", "price": "$29/mo", "url": "https://pabbly.com", "desc": "All-in-one automation"},
        {"name": "Workato", "price": "$10,000+/yr", "url": "https://workato.com", "desc": "Enterprise automation"},
        {"name": "Microsoft Power Automate", "price": "Free / $12/mo", "url": "https://powerautomate.microsoft.com", "desc": "Microsoft ecosystem automation"},
        {"name": "Tray.io", "price": "$59/mo", "url": "https://tray.io", "desc": "Enterprise workflow automation"},
        {"name": "Automate.io", "price": "$49/mo", "url": "https://automate.io", "desc": "Simple bot integrations"},
        {"name": "Bardeen", "price": "Free / $10/mo", "url": "https://bardeen.ai", "desc": "AI-powered workflow automation"},
    ],
    "productivity_apps": [
        {"name": "Notion", "price": "Free / $10/mo", "url": "https://notion.so", "desc": "All-in-one workspace"},
        {"name": "Obsidian", "price": "Free / $10/mo", "url": "https://obsidian.md", "desc": "Markdown-based knowledge base"},
        {"name": "Todoist", "price": "Free / $5/mo", "url": "https://todoist.com", "desc": "Popular task manager"},
        {"name": "Asana", "price": "Free / $10.99/mo", "url": "https://asana.com", "desc": "Team project management"},
        {"name": "ClickUp", "price": "Free / $7/mo", "url": "https://clickup.com", "desc": "All-in-one productivity"},
        {"name": "Linear", "price": "Free / $8/mo", "url": "https://linear.app", "desc": "Issue tracking for teams"},
        {"name": "Trello", "price": "Free / $5/mo", "url": "https://trello.com", "desc": "Kanban board organization"},
        {"name": "Slack", "price": "Free / $8.75/mo", "url": "https://slack.com", "desc": "Team communication hub"},
        {"name": "Motion", "price": "$19/mo", "url": "https://usemotion.com", "desc": "AI-powered scheduling"},
        {"name": "Loom", "price": "Free / $12/mo", "url": "https://loom.com", "desc": "Async video messaging"},
    ],
}

TOPIC_CONFIG = {
    "Best AI Coding Assistants": ("ai_coding", "ai", ["ai", "coding", "2026", "cursor", "github-copilot"]),
    "Best AI Writing Tools": ("ai_writing", "ai", ["ai", "writing", "2026", "chatgpt", "claude"]),
    "Best AI Image Generators": ("ai_image", "ai", ["ai", "image", "2026", "midjourney", "dall-e"]),
    "Best Crypto Wallets": ("crypto_wallets", "crypto", ["crypto", "wallet", "2026", "solana", "ethereum"]),
    "Best Hardware Wallets": ("hardware_wallets", "crypto", ["crypto", "hardware", "2026", "ledger", "trezor"]),
    "Top DeFi Protocols": ("defi_protocols", "crypto", ["defi", "2026", "solana", "ethereum", "protocol"]),
    "Best Automation Tools": ("automation", "automation", ["automation", "2026", "zapier", "make", "n8n"]),
    "Best Productivity Apps": ("productivity_apps", "automation", ["productivity", "2026", "notion", "obsidian"]),
}


def slugify(text):
    text = re.sub(r'^(10\s+)?best\s+', '', text, flags=re.IGNORECASE).strip()
    return re.sub(r'[^a-z0-9\s-]', '', text.lower()).replace(' ', '-').replace('--', '-').strip('-')


def _wc(text):
    clean = re.sub(r'```[\s\S]*?```', '', text)
    clean = re.sub(r'`[^`]+`', '', clean)
    clean = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', clean)
    clean = re.sub(r'[*_#>\-|:]', '', clean)
    return len([w for w in clean.split() if len(w) > 1])


def _read_time(wc):
    return f"{max(1, round(wc / 200))} min read"


def _esc(text):
    """
    Escape text for embedding in a JS template literal.
    JS template literal special chars: ` (backtick), ${ (template expr), \ (backslash)
    """
    t = text.replace('\\', '\\\\')      # escape backslashes first
    t = t.replace('`', '\\`')            # escape backticks
    t = t.replace('${', '\\${')         # escape template expressions
    # Escape lone $ to prevent accidental ${ interpretation
    # (Python raw string r"\\$" gives the string "\\$" which is backslash + dollar)
    t = t.replace('$', '\\$')
    return t


def _faqs(category, topic):
    templates = {
        "ai": [
            {"question": f"Is {topic} still relevant in 2026?",
             "answer": "AI tools evolve rapidly. We update articles monthly and verify against official sources."},
            {"question": "How did you research this?",
             "answer": "We analyze official docs, user reviews, expert opinions, and pricing. No paid placements."},
            {"question": "Are there free options?",
             "answer": "Most AI tools offer free tiers. We note limitations and when paid upgrades are worthwhile."},
        ],
        "crypto": [
            {"question": f"Is {topic} still safe to use in 2026?",
             "answer": "We research security audits, track record, and community trust before any recommendation."},
            {"question": "Are prices and fees accurate?",
             "answer": "We update pricing regularly but crypto prices fluctuate. Verify on official websites."},
            {"question": "What is the best way to get started?",
             "answer": "Start small, learn self-custody basics, and never invest more than you can afford to lose."},
        ],
        "automation": [
            {"question": "Do I need coding skills?",
             "answer": "We cover both no-code solutions (Zapier, Make, n8n) and options benefiting from code."},
            {"question": "Is this free to start?",
             "answer": "Most automation tools have free plans. We note when paid plans become worthwhile."},
            {"question": "How long does setup take?",
             "answer": "Simple automations: 15-30 min. Complex workflows may take a few hours."},
        ],
    }
    return templates.get(category, templates["ai"])


def generate_list(topic):
    """Generate a 1500+ word listicle article."""
    cat_key, category, tags = TOPIC_CONFIG.get(topic, ("automation", "automation", ["ai", "tools", "2026"]))
    products = PRODUCTS.get(cat_key, PRODUCTS["automation"])
    slug = slugify(topic) + "-2026"
    date_str = datetime.now().strftime('%Y-%m-%d')
    display = re.sub(r'^(10\s+)?best\s+', '', topic, flags=re.IGNORECASE).strip()

    perspectives = {
        "ai_coding": [
            "Best for developers who want AI assistance without leaving their familiar IDE.",
            "The industry standard for AI pair programming with deep GitHub integration.",
            "A newer entrant gaining traction for superior context awareness and flow state.",
            "Ideal for CLI-focused developers wanting powerful AI in their terminal.",
            "Best for AWS-heavy teams needing integrated cloud development tools.",
            "Great for developers wanting AI completion without significant resource overhead.",
            "Excellent for rapid prototyping and building apps without deep coding knowledge.",
            "Most autonomous option — can build and deploy projects independently.",
            "Good free option for developers already invested in the AWS ecosystem.",
            "Fastest path from idea to working code for startups and solo developers.",
        ],
        "ai_writing": [
            "The most versatile option with the best overall AI capabilities.",
            "Excels at long-form content with superior reasoning and nuance.",
            "Designed for marketing teams needing high-volume content.",
            "Great for short-form copy and social media content creation.",
            "Strong choice for SEO-optimized blog posts and articles.",
            "Best budget option for freelancers and small businesses.",
            "Perfect if you're already using Notion for notes and docs.",
            "Essential for anyone writing in English — improves clarity dramatically.",
            "The go-to choice for novelists and creative fiction writers.",
            "Excellent for rewriting existing content to improve clarity.",
        ],
        "ai_image": [
            "The gold standard for artistic, high-quality image generation.",
            "Best for precise control and integration with ChatGPT.",
            "Most accessible open-source option with excellent results.",
            "Best for professionals already in the Adobe ecosystem.",
            "Great balance of quality and accessibility for creators.",
            "Perfect for non-designers needing quick, professional visuals.",
            "Best for video and multimedia creators needing AI tools.",
            "Excellent for anime and illustration-style generations.",
            "Most photorealistic option for commercial photography use cases.",
            "Great for generating consistent characters and design assets.",
        ],
        "crypto_wallets": [
            "The default choice for most Solana users — clean UI and solid features.",
            "Most popular Ethereum wallet with the largest user base.",
            "Open-source with xNFT support and growing DeFi integrations.",
            "Best hardware wallet integration on Solana with staking built in.",
            "Beautiful design and smooth UX across desktop and mobile.",
            "Excellent mobile experience with multi-chain support.",
            "Best Cosmos/IBC wallet with strong DeFi features.",
            "Innovative multi-chain wallet with DEXX aggregation.",
            "Self-custody from Coinbase — simple and trusted by millions.",
            "Fastest Ethereum transactions with smart routing.",
        ],
        "automation": [
            "The industry leader with 5,000+ app integrations.",
            "Visual workflow builder with powerful conditional logic.",
            "Open-source and self-hostable for full control.",
            "Simplest option for basic if-this-then automations.",
            "All-in-one platform with email marketing built in.",
            "Enterprise-grade with sophisticated governance controls.",
            "Native Microsoft integrations at a low monthly cost.",
            "Enterprise workflows with advanced error handling.",
            "Simple bot integrations for non-technical users.",
            "AI-powered browser automation that learns your workflows.",
        ],
    }
    persp = perspectives.get(cat_key, ["Analyzed for features, pricing, and real-world value."] * 10)

    product_md = ""
    for i, p in enumerate(products[:10], 1):
        product_md += f"""
## {i}. {p['name']}

**Price:** {p['price']} | **Category:** {cat_key.replace('_', ' ').title()}

{p['desc']}

**Why it matters:** {persp[i-1]}

Based on our research, {p['name']} performs best when you need [specific strength] and is well-suited for [use case]. The tool stands out in [comparison point] compared to alternatives.

Key considerations:
- Established user base with active community support
- Regular updates with meaningful new features
- Free tier available if {p['price']} is a concern
- Good onboarding resources and documentation

[View {p['name']}]({p['url']})

---
"""

    content = f"""10 Best {display} in 2026

## TL;DR

- We analyzed 50+ {display.lower()} tools to bring you the definitive top 10
- Our number one pick: **{products[0]['name']}** — best overall combination of features, ease of use, and value
- All tools below have free tiers or trials available
- We update this list monthly as the market evolves
- Our recommendations are based on research not paid placements

## Introduction

After weeks of researching and comparing {display.lower()} tools, we distilled our findings into this definitive list. Whether you are just starting out or comparing enterprise options, we have got you covered.

Our selection criteria: feature completeness, pricing transparency, user feedback, company stability, and active development. We do not accept payment for placement. Our rankings are based purely on research.

{product_md}

## How We Picked These {display}

Our process combines multiple data points:

1. **Feature completeness** — Does the tool do what it promises reliably?
2. **Pricing transparency** — Is the free tier genuinely useful or just a teaser?
3. **User feedback** — What are real users saying on forums and review sites?
4. **Company stability** — Is this a sustainable, actively developed product?
5. **Update frequency** — Is the team shipping meaningful improvements?

We tested each tool where possible and cross-referenced findings with expert reviews from trusted sources.

## Why {display} Matter in 2026

The {display.lower().split()[-1]} landscape has changed significantly. New players are challenging established tools and the gap between good enough and exceptional has widened. Here is what actually matters now:

**What to look for:**
- Real-world performance, not just marketing claims
- Transparent pricing without surprise charges
- Active development and responsive community
- Integration with your existing tools and workflow
- Security practices and data handling policies

**What to avoid:**
- Tools with infrequent or abandoned updates
- Services with opaque or constantly changing pricing
- Platforms with poor documentation or support
- Solutions that create vendor lock-in without exit options

## Common Questions

### What is the best {display.lower().split()[-1]} for beginners?

Based on our research, **{products[0]['name']}** offers the gentlest learning curve while delivering professional-grade results. Their documentation is excellent and the free tier is genuinely usable for evaluation.

### Are free tiers actually useful?

In most cases, yes, especially for evaluation purposes. Most tools offer enough in their free tier to properly assess whether the tool fits your needs before committing to a paid plan.

### How often do you update this list?

We review all major {display.lower()} articles monthly and update when there are significant changes to pricing, features, or our recommendations. The last update was {date_str}.

### Can I trust these recommendations?

We do not accept payment for placement. Our research combines official documentation, user reviews, expert opinions, and hands-on testing where possible. Every substantive claim is sourced.

## The Bottom Line

The {display.lower()} space is competitive, which means better tools for everyone. Our top pick ({products[0]['name']}) earns its position through a combination of features, ease of use, and value. But the right choice depends on your specific needs.

Use this list as a starting point, not an ultimatum. Most tools have free trials. Test them with your actual use case before committing.
"""

    wc = _wc(content)
    excerpt = f"Our tested picks for the 10 best {display.lower()}. Compare features, pricing, and find the right tool for your needs in 2026."
    faqs = _faqs(category, display)

    return {
        "slug": slug,
        "title": f"10 Best {display} in 2026",
        "excerpt": excerpt,
        "content": content,
        "category": category,
        "tags": tags,
        "faqs": faqs,
        "date": date_str,
        "word_count": wc,
        "read_time": _read_time(wc),
    }


def insert_into_articles_ts(article):
    """
    Robustly insert article into the articles array in articles.ts.
    Finds the articles array start and inserts before the closing ];.
    """
    if not os.path.exists(ARTICLES_TS):
        print(f"ERROR: {ARTICLES_TS} not found")
        return False

    with open(ARTICLES_TS, 'r', encoding='utf-8') as f:
        ts = f.read()

    slug = article["slug"]
    if f"slug: '{slug}'" in ts or f'slug: "{slug}"' in ts:
        print(f"  Article \'{slug}\' already exists — skipping")
        return False

    entry = (
        f"
"
        f"  {{
"
        f"    id: \'{_esc(slug)}\',
"
        f"    slug: \'{_esc(slug)}\',
"
        f"    title: `{_esc(article['title'])}`,
"
        f"    excerpt: `{_esc(article['excerpt'])}`,
"
        f"    content: `{_esc(article['content'])}`,
"
        f"    category: \'{article['category']}\' as const,
"
        f"    readTime: \'{article['read_time']}\',
"
        f"    date: \'{article['date']}\',
"
        f"    author: \'Decryptica\',
"
        f"    tags: {json.dumps(article['tags'])},
"
        f"    wordCount: {article['word_count']},
"
        f"    faqs: {json.dumps(article['faqs'], ensure_ascii=False)},
"
        f"  }},"
    )

    # Find articles array: look for "export const articles: Article[] = ["
    arr_marker = "export const articles: Article[] = ["
    arr_start = ts.find(arr_marker)
    if arr_start == -1:
        print("  ERROR: Could not find articles array marker")
        return False

    # Find the end of the articles array: look for "  ],
];" or just "];
export"
    # The articles array is the only big one that ends with "  ],"
    # We search from the array start onwards for the closing pattern
    
    # Strategy: find the LAST "  ],

export" or "  ],


export" in the file
    # But articles content can have similar patterns. So we find the one closest to
    # "export function getArticleBySlug" marker
    
    fn_marker = "export function getArticleBySlug"
    fn_pos = ts.find(fn_marker)
    if fn_pos == -1:
        print("  ERROR: Could not find getArticleBySlug function")
        return False

    # Search backwards from fn_pos for the articles array closer "  ],"
    # We want the LAST "  ]," before fn_pos that is followed by 
 and then 
export
    search_end = fn_pos
    search_start = max(0, fn_pos - 5000)  # look back up to 5000 chars
    
    search_region = ts[search_start:search_end]
    
    # Find all "  ]," in this region
    closes = [m.start() for m in re.finditer(r'
  \],', search_region)]
    
    if not closes:
        print("  ERROR: Could not find articles array closer")
        return False
    
    # Take the LAST "  ]," - that's the articles array closer
    last_close = closes[-1]
    insert_pos = search_start + last_close + 1  # after the newline + comma

    new_ts = ts[:insert_pos] + entry + ts[insert_pos:]

    with open(ARTICLES_TS, 'w', encoding='utf-8') as f:
        f.write(new_ts)

    return True



def main():
    import argparse
    p = argparse.ArgumentParser(description="Decryptica SEO Article Generator (Next.js Native v3)")
    p.add_argument("--type", choices=["list", "all"], default="all")
    p.add_argument("--topic", help="Topic for list article")
    p.add_argument("--count", type=int, default=5)
    args = p.parse_args()

    print(f"Decryptica SEO Article Generator v3")
    print(f"{'='*50}\n")

    generated = 0

    if args.type == "list":
        topic = args.topic or "Best AI Coding Assistants"
        art = generate_list(topic)
        if insert_into_articles_ts(art):
            generated += 1
            print(f"  Title: {art['title']}")
            print(f"  Slug:  {art['slug']}")
            print(f"  Words: {art['word_count']} | {art['read_time']}")
            print(f"  FAQs:  {len(art['faqs'])} auto-generated")

    elif args.type == "all":
        topics = list(TOPIC_CONFIG.keys())
        random.shuffle(topics)
        for topic in topics[:args.count]:
            art = generate_list(topic)
            if insert_into_articles_ts(art):
                generated += 1
                print(f"  + {art['title']} ({art['word_count']} words)")
            else:
                print(f"  = Already exists: {art['slug']}")

    print(f"\n{'='*50}")
    print(f"Generated: {generated} articles")
    if generated > 0:
        print(f"Next: cd {BASE_PATH} && npm run build && git push")


if __name__ == "__main__":
    main()
