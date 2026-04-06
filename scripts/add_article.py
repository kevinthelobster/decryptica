#!/usr/bin/env python3
"""
Decryptica SEO Article Generator — Simple Stable Version
Adds articles to articles.ts which automatically get all SEO features.

Usage:
  python3 scripts/add_article.py --topic "AI Coding Assistants"
  python3 scripts/add_article.py --all 3
"""
import os, re, json, random
from datetime import datetime

BASE = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(BASE)
ARTICLES_TS = os.path.join(BASE_DIR, "app/data/articles.ts")

PRODUCTS = {
    "ai_coding": [
        {"name": "Cursor", "price": "Free / $20/mo", "url": "https://cursor.sh", "desc": "AI-first code editor built on VS Code"},
        {"name": "GitHub Copilot", "price": "$10/mo", "url": "https://github.com/features/copilot", "desc": "AI pair programmer from GitHub"},
        {"name": "Windsurf", "price": "$15/mo", "url": "https://windsurf.ai", "desc": "AI-powered IDE from Codeium"},
        {"name": "Claude Code", "price": "Free", "url": "https://claude.ai/claude-code", "desc": "Anthropic CLI for coding"},
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
        {"name": "Zapier", "price": "Free / $29.99/mo", "url": "https://zapier.com", "desc": "Connect 5000+ apps"},
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


def wc(text):
    clean = re.sub(r'```[\s\S]*?```', '', text)
    clean = re.sub(r'`[^`]+`', '', clean)
    clean = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', clean)
    clean = re.sub(r'[*_#>\-|:]', '', clean)
    return len([w for w in clean.split() if len(w) > 1])


def generate_article(topic):
    cat_key, category, tags = TOPIC_CONFIG.get(topic, ("automation", "automation", ["ai", "tools", "2026"]))
    products = PRODUCTS.get(cat_key, PRODUCTS["automation"])
    slug = slugify(topic) + "-2026"
    date_str = datetime.now().strftime("%Y-%m-%d")
    display = re.sub(r'^(10\s+)?best\s+', '', topic, flags=re.IGNORECASE).strip()

    persp = {
        "ai_coding": ["Best for developers who want AI assistance without leaving their familiar IDE.", "The industry standard for AI pair programming with deep GitHub integration.", "A newer entrant gaining traction for superior context awareness.", "Ideal for CLI-focused developers wanting powerful AI in their terminal.", "Best for AWS-heavy teams needing integrated cloud development tools.", "Great for developers wanting AI completion without significant resource overhead.", "Excellent for rapid prototyping and building apps without deep coding knowledge.", "Most autonomous option — can build and deploy projects independently.", "Good free option for developers already in the AWS ecosystem.", "Fastest path from idea to working code for startups and solo developers."],
        "ai_writing": ["The most versatile option with the best overall AI capabilities.", "Excels at long-form content with superior reasoning and nuance.", "Designed for marketing teams needing high-volume content.", "Great for short-form copy and social media content creation.", "Strong choice for SEO-optimized blog posts and articles.", "Best budget option for freelancers and small businesses.", "Perfect if you are already using Notion for notes and docs.", "Essential for anyone writing in English — improves clarity dramatically.", "The go-to choice for novelists and creative fiction writers.", "Excellent for rewriting existing content to improve clarity."],
        "ai_image": ["The gold standard for artistic, high-quality image generation.", "Best for precise control and integration with ChatGPT.", "Most accessible open-source option with excellent results.", "Best for professionals already in the Adobe ecosystem.", "Great balance of quality and accessibility for creators.", "Perfect for non-designers needing quick, professional visuals.", "Best for video and multimedia creators needing AI tools.", "Excellent for anime and illustration-style generations.", "Most photorealistic option for commercial photography use cases.", "Great for generating consistent characters and design assets."],
        "crypto_wallets": ["The default choice for most Solana users — clean UI and solid features.", "Most popular Ethereum wallet with the largest user base.", "Open-source with xNFT support and growing DeFi integrations.", "Best hardware wallet integration on Solana with staking built in.", "Beautiful design and smooth UX across desktop and mobile.", "Excellent mobile experience with multi-chain support.", "Best Cosmos/IBC wallet with strong DeFi features.", "Innovative multi-chain wallet with DEXX aggregation.", "Self-custody from Coinbase — simple and trusted by millions.", "Fastest Ethereum transactions with smart routing."],
        "automation": ["The industry leader with 5000+ app integrations.", "Visual workflow builder with powerful conditional logic.", "Open-source and self-hostable for full control.", "Simplest option for basic if-this-then automations.", "All-in-one platform with email marketing built in.", "Enterprise-grade with sophisticated governance controls.", "Native Microsoft integrations at a low monthly cost.", "Enterprise workflows with advanced error handling.", "Simple bot integrations for non-technical users.", "AI-powered browser automation that learns your workflows."],
    }.get(cat_key, ["Analyzed for features, pricing, and real-world value."] * 10)

    product_md = ""
    for i, p in enumerate(products[:10], 1):
        product_md += """

## {}. {}

**Price:** {} | **Category:** {}

{}

**Why it matters:** {}

Based on our research, {} performs best when you need [specific strength] and is well-suited for [use case].

Key considerations:
- Established user base with active community support
- Regular updates with meaningful new features
- Free tier available if pricing is a concern
- Good onboarding resources and documentation

[View {}]({})

---
""".format(i, p['name'], p['price'], cat_key.replace('_', ' ').title(), p['desc'], persp[i-1], p['name'], p['name'], p['url'])

    content = (
        "10 Best " + display + " in 2026\n\n"
        "## TL;DR\n\n"
        "- We analyzed 50+ " + display.lower() + " tools to bring you the definitive top 10\n"
        "- Our number one pick: **" + products[0]["name"] + "** — best overall combination of features, ease of use, and value\n"
        "- All tools below have free tiers or trials available\n"
        "- We update this list monthly as the market evolves\n"
        "- Our recommendations are based on research not paid placements\n\n"
        "## Introduction\n\n"
        "After weeks of researching and comparing " + display.lower() + " tools, we distilled our findings into this definitive list. "
        "Whether you are just starting out or comparing enterprise options, we have got you covered.\n\n"
        "Our selection criteria: feature completeness, pricing transparency, user feedback, company stability, and active development. "
        "We do not accept payment for placement.\n\n"
        + product_md + "\n\n"
        "## How We Picked These " + display + "\n\n"
        "1. **Feature completeness** — Does the tool do what it promises reliably?\n"
        "2. **Pricing transparency** — Is the free tier genuinely useful?\n"
        "3. **User feedback** — What are real users saying on forums and review sites?\n"
        "4. **Company stability** — Is this a sustainable, actively developed product?\n"
        "5. **Update frequency** — Is the team shipping meaningful improvements?\n\n"
        "## Why " + display + " Matter in 2026\n\n"
        "The " + display.lower() + " landscape has changed significantly. "
        "New players are challenging established tools and the gap between good enough and exceptional has widened.\n\n"
        "**What to look for:**\n"
        "- Real-world performance, not just marketing claims\n"
        "- Transparent pricing without surprise charges\n"
        "- Active development and responsive community\n"
        "- Integration with your existing tools and workflow\n\n"
        "**What to avoid:**\n"
        "- Tools with infrequent or abandoned updates\n"
        "- Services with opaque or constantly changing pricing\n"
        "- Platforms with poor documentation or support\n\n"
        "## Common Questions\n\n"
        "### What is the best " + display.lower() + " for beginners?\n\n"
        "Based on our research, **" + products[0]["name"] + "** offers the gentlest learning curve while delivering professional-grade results.\n\n"
        "### Are free tiers actually useful?\n\n"
        "In most cases, yes, especially for evaluation purposes.\n\n"
        "### How often do you update this list?\n\n"
        "We review all major " + display.lower() + " articles monthly and update when there are significant changes.\n\n"
        "### Can I trust these recommendations?\n\n"
        "We do not accept payment for placement.\n\n"
        "## The Bottom Line\n\n"
        "The " + display.lower() + " space is competitive, which means better tools for everyone. "
        "Our top pick (" + products[0]["name"] + ") earns its position through a combination of features, ease of use, and value. "
        "But the right choice depends on your specific needs. Use this list as a starting point."
    )

    word_count = wc(content)
    excerpt = "Our tested picks for the 10 best {}. Compare features, pricing, and find the right tool for your needs in 2026.".format(display.lower())
    read_time = "{} min read".format(max(1, round(word_count / 200)))

    faqs = {
        "ai": [
            {"question": "Is {} still relevant in 2026?".format(display), "answer": "AI tools evolve rapidly. We update articles monthly and verify against official sources."},
            {"question": "How did you research this?", "answer": "We analyze official docs, user reviews, expert opinions, and pricing. No paid placements."},
            {"question": "Are there free options?", "answer": "Most AI tools offer free tiers. We note limitations and when paid upgrades are worthwhile."},
        ],
        "crypto": [
            {"question": "Is {} still safe to use in 2026?".format(display), "answer": "We research security audits, track record, and community trust before any recommendation."},
            {"question": "Are prices and fees accurate?", "answer": "We update pricing regularly but crypto prices fluctuate. Verify on official websites."},
            {"question": "What is the best way to get started?", "answer": "Start small, learn self-custody basics, and never invest more than you can afford to lose."},
        ],
        "automation": [
            {"question": "Do I need coding skills?", "answer": "We cover both no-code solutions (Zapier, Make, n8n) and options benefiting from code."},
            {"question": "Is this free to start?", "answer": "Most automation tools have free plans. We note when paid plans become worthwhile."},
            {"question": "How long does setup take?", "answer": "Simple automations: 15-30 min. Complex workflows may take a few hours."},
        ],
    }.get(category, [
        {"question": "Is {} still relevant in 2026?".format(display), "answer": "We update articles regularly to reflect the latest developments."},
        {"question": "How did you research this?", "answer": "We analyze official docs, user reviews, and expert opinions. No paid placements."},
        {"question": "Are there free options?", "answer": "Most tools offer free tiers or trials. We always note any limitations."},
    ])

    return {
        "slug": slug,
        "title": "10 Best {} in 2026".format(display),
        "excerpt": excerpt,
        "content": content,
        "category": category,
        "tags": tags,
        "faqs": faqs,
        "date": date_str,
        "word_count": word_count,
        "read_time": read_time,
    }


def insert_article(article):
    with open(ARTICLES_TS, "r", encoding="utf-8") as f:
        ts = f.read()

    slug = article["slug"]
    if "slug: '" + slug + "'" in ts:
        return False

    # Build TypeScript entry using json.dumps for safe string escaping
    def js_str(s):
        return json.dumps(s)[1:-1]  # Remove surrounding quotes from json.dumps output

    tags_json = json.dumps(article["tags"])
    faqs_json = json.dumps(article["faqs"], ensure_ascii=False)

    entry_lines = [
        "  {",
        "    id: '" + js_str(slug) + "',",
        "    slug: '" + js_str(slug) + "',",
        "    title: " + json.dumps(article["title"]) + ",",
        "    excerpt: " + json.dumps(article["excerpt"]) + ",",
        "    content: " + json.dumps(article["content"]) + ",",
        "    category: '" + article["category"] + "' as const,",
        "    readTime: '" + article["read_time"] + "',",
        "    date: '" + article["date"] + "',",
        "    author: 'Decryptica',",
        "    tags: " + tags_json + ",",
        "    wordCount: " + str(article["word_count"]) + ",",
        "    faqs: " + faqs_json + ",",
        "  }",
    ]
    entry = "\n".join(entry_lines)

    # Find the articles array closer by searching for the specific pattern
    # that comes right before "export function getArticleBySlug"
    # The articles closer is: "  },\n];\n\nexport function getArticleBySlug"
    pattern = "  },\n];\n\nexport function getArticleBySlug"
    replacement = "  },\n  " + entry + ",\n];\n\nexport function getArticleBySlug"

    if pattern not in ts:
        print("ERROR: articles closer not found (pattern='  },\n];\n\nexport function...')")
        return False

    new_ts = ts.replace(pattern, replacement, 1)

    with open(ARTICLES_TS, "w", encoding="utf-8") as f:
        f.write(new_ts)

    return True


def main():
    import argparse
    p = argparse.ArgumentParser(description="Add SEO articles to Decryptica")
    p.add_argument("--topic", help="Specific topic")
    p.add_argument("--all", type=int, metavar="N", help="Generate N random articles")
    args = p.parse_args()

    topics = list(TOPIC_CONFIG.keys())
    added = 0

    if args.topic:
        art = generate_article(args.topic)
        if insert_article(art):
            print("+ {} ({} words)".format(art["title"], art["word_count"]))
            added = 1
        else:
            print("Already exists: {}".format(art["slug"]))
    elif args.all:
        n = args.all
        random.shuffle(topics)
        for topic in topics[:n]:
            art = generate_article(topic)
            if insert_article(art):
                print("+ {} ({} words)".format(art["title"], art["word_count"]))
                added += 1
            else:
                print("= Already exists: {}".format(art["slug"]))
    else:
        print("Usage: add_article.py --topic 'Best AI Coding Assistants'")
        print("       add_article.py --all 5")
        return

    print("\nAdded {} articles".format(added))
    if added > 0:
        print("Next: cd {} && npm run build && git push".format(BASE_DIR))


if __name__ == "__main__":
    main()
