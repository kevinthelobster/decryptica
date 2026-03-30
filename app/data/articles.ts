export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: 'crypto' | 'ai' | 'automation';
  readTime: string;
  date: string;
  author?: string;
}

export interface Topic {
  slug: string;
  name: string;
  description: string;
  icon: string;
}

export const topics: Topic[] = [
  {
    slug: 'crypto',
    name: 'Crypto & DeFi',
    description: 'Blockchain technology, decentralized finance, and the evolving crypto landscape.',
    icon: '₿',
  },
  {
    slug: 'ai',
    name: 'Artificial Intelligence',
    description: 'Machine learning, AI agents, and the latest in artificial intelligence.',
    icon: '🤖',
  },
  {
    slug: 'automation',
    name: 'Automation',
    description: 'Workflow automation, productivity tools, and scripting solutions.',
    icon: '⚡',
  },
];

export const articles: Article[] = [
  {
    id: '1',
    slug: 'ethereums-make-or-break-moment-is-a-false-narrative',
    title: "Ethereum's 'Make-or-Break' Moment Is a False Narrative",
    excerpt: "The real threat to Ethereum isn't quantum computing or AI competition - it's Layer 2 fragmentation destroying network effects.",
    content: `
Everyone's sweating Ethereum. Headlines scream about "quantum threats" and "AI competition." The consensus is clear: Ethereum is on the ropes.

**I don't buy it.**

The real problem isn't sexy enough for headlines. It's that **Layer 2 chains are fracturing ETH's network effect** while the foundation pretends everything is fine.

## The Layer 2 Fragmentation Problem

Here's what the mainstream misses: Ethereum isn't one blockchain anymore. It's five:

- **Optimism** → $6.5B TVL
- **Arbitrum** → $5.2B TVL
- **Base** → $4.1B TVL
- **Starknet** → $1.8B TVL
- **zkSync** → $1.2B TVL

Each L2 has its own bridge, its own liquidity, its own developer ecosystem. The "Ethereum ecosystem" is now a fragmented mess where moving value between L2s requires jumping through hoops that make CeFi look effortless.

## The Missing AI Story

Here's where Ethereum is genuinely behind: AI integration.

Bitcoin has miners. Ethereum has... nothing.

Solana flipped the narrative by embracing GPU workloads. Meanwhile, ETH's AI story is "we could run AI on the EVM." That's not a strategy - that's cope.

## What Actually Matters

The "make-or-break" framing is noise. The real question: **Can ETH unify its L2 ecosystem before the fragmentation becomes irreversible?**

My read: ETH has 12-18 months to standardize cross-L2 bridging before retail gives up and moves to monolithic chains that "just work."
    `.trim(),
    category: 'crypto',
    readTime: '6 min',
    date: '2026-03-22',
    author: 'Decryptica',
  },
  {
    id: '2',
    slug: 'solana-vs-ethereum-2026',
    title: 'Solana vs Ethereum 2026: The Landscape Shifts',
    excerpt: 'Comparing the two giants: Solana excels at speed and low fees while Ethereum dominates security and ecosystem depth.',
    content: `
In the battle of layer-1 blockchains, 2026 has been a pivotal year. Solana has made significant strides, but Ethereum remains the 800-pound gorilla.

## Speed vs Security

Solana processes transactions in seconds with minimal fees. Ethereum processes them in minutes (or hours during congestion) but with battle-tested security.

## The Ecosystem Question

Ethereum's developer ecosystem is deep. Tooling, documentation, and established patterns make it the default choice for serious DeFi projects. Solana is catching up fast.

## Verdict

Choose Ethereum for maximum security and DeFi depth. Choose Solana for speed and consumer-facing apps.
    `.trim(),
    category: 'crypto',
    readTime: '5 min',
    date: '2026-03-18',
    author: 'Decryptica',
  },
  {
    id: '3',
    slug: 'bitcoin-etf-institutional-inflows',
    title: 'Bitcoin ETF Institutional Inflows: A Deep Dive',
    excerpt: 'BlackRock and Fidelity ETFs have changed the game for institutional Bitcoin adoption.',
    content: `
The approval of spot Bitcoin ETFs in early 2024 marked a watershed moment. Now, 18 months later, the inflows tell a clear story.

## The Numbers

BlackRock's IBIT has accumulated over $20B in assets. Fidelity's FBTC isn't far behind. Combined, spot Bitcoin ETFs now hold over 5% of Bitcoin's total supply.

## What This Means

Institutional money doesn't move like retail money. When BlackRock buys, they hold. This creates structural buying pressure that retail simply can't match.

## The Long Game

ETF inflows are creating a new floor for Bitcoin. Corrections are being absorbed faster than any previous cycle.
    `.trim(),
    category: 'crypto',
    readTime: '4 min',
    date: '2026-03-15',
    author: 'Decryptica',
  },
  {
    id: '4',
    slug: 'ai-agents-the-next-frontier',
    title: 'AI Agents: The Next Frontier in Artificial Intelligence',
    excerpt: 'From Chatbots to autonomous agents - understanding the paradigm shift that\'s reshaping AI.',
    content: `
The AI landscape has evolved beyond simple chatbots. AI agents represent a fundamental shift: from responding to prompts to executing complex, multi-step tasks autonomously.

## What Makes an AI Agent Different?

Traditional AI responds to input. AI agents take action:
- **Goal-oriented**: They work toward objectives, not just answers
- **Memory**: They retain context across interactions
- **Tool use**: They interact with external systems and APIs
- **Autonomy**: They make decisions without constant human input

## Real-World Applications

1. **Research**: Autonomous web scraping and synthesis
2. **Coding**: End-to-end code generation and debugging
3. **Automation**: Workflow execution across multiple platforms

## The Future

By 2027, AI agents will handle the majority of routine digital tasks. The question isn't if this happens, but how quickly enterprises adopt the technology.
    `.trim(),
    category: 'ai',
    readTime: '7 min',
    date: '2026-03-20',
    author: 'Decryptica',
  },
  {
    id: '5',
    slug: 'local-llm-setup-guide',
    title: 'Running LLMs Locally: A Practical Guide',
    excerpt: 'Skip the cloud, own your AI. A comprehensive guide to setting up local language models.',
    content: `
Privacy concerns, cost management, and offline requirements are driving a wave of local LLM adoption. Here's how to set up your own AI infrastructure.

## Why Run Locally?

- **Privacy**: Your data stays on your machine
- **Cost**: One-time hardware investment vs. per-token fees
- **Control**: No API rate limits or dependencies
- **Offline**: Works without internet connection

## Hardware Requirements

For decent performance, you'll need:
- **RAM**: 16GB minimum, 32GB recommended
- **GPU**: NVIDIA with 8GB+ VRAM (RTX 3080 or better)
- **Storage**: 50GB+ for models

## Popular Options

- **Ollama**: Easiest setup, excellent performance
- **LM Studio**: GUI-focused, great for beginners
- **vLLM**: For advanced users needing maximum throughput

## Getting Started

\`\`\`bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull a model
ollama pull llama3.2

# Run it
ollama run llama3.2
\`\`\`

The local AI revolution is just beginning.
    `.trim(),
    category: 'ai',
    readTime: '8 min',
    date: '2026-03-17',
    author: 'Decryptica',
  },
  {
    id: '6',
    slug: 'cursor-vs-windsurf-ai-coding',
    title: 'Cursor vs Windsurf: AI Coding Tools Compared',
    excerpt: 'Two AI-first code editors battle for developer mindshare. Here\'s what you need to know.',
    content: `
The AI coding space has exploded, but two tools stand out: Cursor and Windsurf. Both leverage AI to accelerate development, but they take different approaches.

## Cursor

**Strengths:**
- Best-in-class code completion
- Team features and collaboration
- Strong VS Code compatibility
- Large user base, active development

**Weaknesses:**
- Can be expensive at higher tiers
- Some features locked behind Pro

## Windsurf

**Strengths:**
- Cascade feature is genuinely innovative
- Competitive pricing
- Flow-aware context understanding
- Growing ecosystem

**Weaknesses:**
- Smaller community
- Less mature feature set

## My Verdict

Cursor for professional teams prioritizing reliability. Windsurf for individuals exploring the AI coding frontier.

The best choice depends on your workflow. Try both with their free tiers before committing.
    `.trim(),
    category: 'ai',
    readTime: '5 min',
    date: '2026-03-14',
    author: 'Decryptica',
  },
  {
    id: '7',
    slug: 'n8n-workflow-automation',
    title: 'n8n: Open-Source Workflow Automation That Actually Works',
    excerpt: 'Skip Zapier\'s pricing trap. n8n gives you enterprise automation without the enterprise price tag.',
    content: `
When automation needs scale, Zapier's per-task pricing becomes painful. n8n solves this with a self-hostable, open-source alternative.

## What is n8n?

n8n (pronounced "n-eight-n") is a workflow automation tool that runs on your infrastructure. Connect apps, automate processes, and own your data.

## Key Features

- **1,000+ integrations**: From Slack to Supabase
- **Code execution**: JavaScript and Python nodes
- **Self-hosting**: Full control, no vendor lock-in
- **Visual workflow builder**: No coding required
- **API-first**: Build custom integrations

## Real-World Use Cases

1. **Lead Management**: CRM updates → Slack notifications → Email sequences
2. **Data Sync**: Notion → PostgreSQL → Dashboard
3. **Monitoring**: Health checks → PagerDuty → Incident response

## Deployment Options

- **Cloud**: Managed, starts at $20/month
- **Self-hosted**: Docker compose, own server
- **Enterprise**: Custom solutions for larger orgs

## Getting Started

\`\`\`bash
# Docker compose setup
docker volume create n8n
docker run -d --name n8n -p 5678:5678 n8nio/n8n
\`\`\`

For serious automation needs, n8n is the right tool.
    `.trim(),
    category: 'automation',
    readTime: '6 min',
    date: '2026-03-19',
    author: 'Decryptica',
  },
  {
    id: '8',
    slug: 'github-actions-automation',
    title: 'GitHub Actions: Beyond CI/CD',
    excerpt: 'GitHub Actions can automate almost anything. Here are creative uses beyond standard deployments.',
    content: `
GitHub Actions is often used for CI/CD, but its flexibility makes it capable of much more. Let me share some non-standard automation patterns.

## Beyond Testing

### Automated Issue Management

\`\`\`yaml
name: Auto-label issues
on:
  issues:
    types: [opened]
jobs:
  label:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/issue-metrics@v3
        with:
          only_issues_labeled_with: 'bug'
\`\`\`

### Scheduled Reports

Generate weekly summaries of repository health, dependency updates, and team velocity.

### Community Management

Auto-respond to first-time contributors with onboarding guides and team contacts.

## Advanced Patterns

### Reusable Workflows

Centralize common patterns in .github/workflows/reusable/ and share across repositories.

### Matrix Builds

Test across multiple versions, configurations, or platforms simultaneously.

### Environment Protection

Require approvals for production deployments with environment-specific rules.

## Why GitHub Actions?

- **Native integration**: Triggers on code events
- **Cost-effective**: 2,000 minutes/month free
- **Extensible**: Marketplace of community actions
- **Version controlled**: Workflows as code

The automation possibilities are nearly endless.
    `.trim(),
    category: 'automation',
    readTime: '5 min',
    date: '2026-03-16',
    author: 'Decryptica',
  },
  {
    id: '9',
    slug: 'make-internet-homelab',
    title: 'The Modern Homelab: From Zero to Hero',
    excerpt: 'Building a homelab that actually gets used. Practical advice for infrastructure enthusiasts.',
    content: `
Homelabs fail when they're too complex to maintain. Here's how to build one you'll actually use.

## Start Simple

**Phase 1: The Essentials**
- Single server (NUC, old laptop, or mini PC)
- Proxmox for virtualization
- Pi-hole for network-wide ad blocking
- Nextcloud for personal cloud storage

## Build Incrementally

**Phase 2: Add Value**
- Docker for containerized apps
- pfSense for advanced networking
- Unifi for network management
- TrueNAS for mass storage

## The Goal

Your homelab should automate something you do daily. If it doesn't serve a purpose, it becomes dust collector.

## My Current Setup

- 3-node Proxmox cluster
- 32TB raw storage (12TB usable with parity)
- VLAN-segmented network
- Hardware monitoring with Grafana

The best homelab is one that gets maintained.
    `.trim(),
    category: 'automation',
    readTime: '7 min',
    date: '2026-03-12',
    author: 'Decryptica',
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((article) => article.slug === slug);
}

export function getArticlesByCategory(category: Article['category']): Article[] {
  return articles.filter((article) => article.category === category);
}

export function getTopicBySlug(slug: string): Topic | undefined {
  return topics.find((topic) => topic.slug === slug);
}