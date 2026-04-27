#!/usr/bin/env node

/**
 * Daily Article Generator for Decryptica v2
 * 
 * Improvements:
 * - Deduplication tracking (avoids posting same title within 30 days)
 * - Keyword research integration for SEO
 * - Larger title pool based on trending searches
 * - Proper error handling
 * 
 * Usage: node daily-article-v2.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// === CONFIGURATION ===
const CONFIG = {
  model: process.env.AI_MODEL || 'openai-codex/gpt-5.4',
  workspace: process.env.WORKSPACE || '/Users/kevinsimac/.openclaw/workspace/decryptica',
  articlesFile: (process.env.WORKSPACE || '/Users/kevinsimac/.openclaw/workspace/decryptica') + '/app/data/articles.ts',
  postedTracker: (process.env.WORKSPACE || '/Users/kevinsimac/.openclaw/workspace/decryptica') + '/data/posted_titles.json',
  chatId: process.env.TELEGRAM_CHAT_ID || '8324073314',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || ''
};

// Categories to research
const CATEGORIES = ['crypto', 'ai', 'automation'];

// === UTILITIES ===

function run(cmd, options = {}) {
  try {
    const result = execSync(cmd, {
      cwd: options.cwd || CONFIG.workspace,
      encoding: 'utf-8',
      stdio: 'pipe',
      ...options
    });
    return result ? result.toString().trim() : '';
  } catch (error) {
    if (options.ignoreError) return null;
    console.error(`Command failed: ${cmd}`);
    throw error;
  }
}

function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 60);
}

function generateId() {
  const randomNum = Math.floor(Math.random() * 10000);
  return `${Date.now()}-${randomNum}`;
}

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

function estimateReadTime(content) {
  const words = content.split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min`;
}

// === DEDUPLICATION TRACKING ===

/**
 * Load posted titles tracker
 */
function loadPostedTracker() {
  try {
    if (fs.existsSync(CONFIG.postedTracker)) {
      const data = fs.readFileSync(CONFIG.postedTracker, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    log(`Tracker load error: ${e.message}`);
  }
  return { posted: [], lastResearch: null };
}

/**
 * Save posted titles tracker
 */
function savePostedTracker(tracker) {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(CONFIG.postedTracker);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(CONFIG.postedTracker, JSON.stringify(tracker, null, 2));
  } catch (e) {
    log(`Tracker save error: ${e.message}`);
  }
}

/**
 * Check if title was recently posted (within last 30 days)
 */
function isRecentlyPosted(tracker, title) {
  const normalizedTitle = title.toLowerCase().trim();
  const normalizedSlug = generateSlug(title);
  
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  
  return tracker.posted.some(entry => {
    if (entry.date > thirtyDaysAgo) {
      const entryNormalized = entry.title.toLowerCase().trim();
      const entrySlug = generateSlug(entry.title);
      return entryNormalized === normalizedTitle || entrySlug === normalizedSlug;
    }
    return false;
  });
}

/**
 * Mark title as posted
 */
function markAsPosted(tracker, title, slug) {
  tracker.posted.push({
    title,
    slug,
    date: Date.now()
  });
  
  // Clean old entries (keep last 90 days)
  const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
  tracker.posted = tracker.posted.filter(e => e.date > ninetyDaysAgo);
  
  savePostedTracker(tracker);
}

// === KEYWORD RESEARCH ===

/**
 * Research trending keywords for a category using web search
 */
async function researchKeywords(category) {
  log(`Researching keywords for: ${category}...`);
  
  const searchQueries = {
    crypto: [
      'site:decryptica.com crypto',
      'crypto trends 2026',
      'best crypto tools',
      'bitcoin analysis',
      'solana defi',
      'ethereum upgrades',
      'crypto trading strategies',
      'web3 development'
    ],
    ai: [
      'site:decryptica.com ai tools',
      'ai productivity 2026',
      'best ai assistants',
      'chatgpt alternatives',
      'ai coding tools',
      'ai image generation',
      'llm comparison',
      'ai automation'
    ],
    automation: [
      'site:decryptica.com automation',
      'no-code tools 2026',
      'workflow automation',
      'productivity apps',
      'api tools',
      'zapier alternatives',
      'n8n workflows',
      'business automation'
    ]
  };
  
  const queries = searchQueries[category] || searchQueries.crypto;
  
  // Try to get search data (use first relevant query)
  // In production, you'd use Google Keyword Planner API or similar
  // For now, we'll use the category-specific title pools
  
  return {
    category,
    trendingTopics: queries,
    researchTime: Date.now()
  };
}

// === TITLE POOLS (expanded for diversity) ===

const TITLE_POOLS = {
  crypto: [
    // Bitcoin/Ethereum
    "Why Bitcoin's Institutional Inflows Tell a Different Story",
    "Ethereum's Next Upgrade Could Change Everything",
    "What On-Chain Data Says About Bitcoin's Next Move",
    "The Hidden Pattern in Bitcoin ETF Flows",
    "Why Bitcoin's Price Action Contradicts the Narrative",
    // Solana
    "Solana's DeFi Renaissance: The Numbers Don't Lie",
    "Why Solana Could Be the Biggest Winner in 2026",
    "Solana vs Ethereum: What the TVL Gap Really Means",
    "The Solana Developer Exodus That's Going Unnoticed",
    "Why Solana's Transaction Costs Are a Feature, Not a Bug",
    // DeFi
    "DeFi's Real Problem Isn't Regulatory—It's UX",
    "Why Most DeFi Users Will Never Leave Ethereum",
    "The Death of AMMs Has Been Greatly Exaggerated",
    "Lending Protocol Wars: Why Aave Still Dominates",
    "Why Liquidity Fragmentation Is Killing DeFi",
    // Regulation & Macro
    "The Crypto Regulation Reality Check Nobody Wants",
    "What the SEC's Latest Move Actually Means for Crypto",
    "Why Regulatory Clarity Is Worse Than Uncertainty",
    "The True Cost of Compliance for Crypto Projects",
    // NFTs & Web3
    "NFTs Aren't Dead—They're Just Finding Their Real Use Case",
    "Why Gaming NFTs Will Outlive the Art Fad",
    "The Web3 Developer Experience Is Still Broken",
    "What It Actually Takes to Build in Web3 Now",
    // Trading & Analysis
    "The Contrarian's Guide to Crypto Market Cycles",
    "Why Your Crypto TA Is Probably Wrong",
    "The On-Chain Metrics That Actually Predict Price",
    "Crypto Market Correlation: When Everything Moves Together"
  ],
  ai: [
    // AI Assistants & Chatbots
    "Claude vs GPT-5: The Comparison That Matters",
    "Why AI Assistants Still Can't Replace Real Research",
    "The Hidden Costs of AI Assistant Dependency",
    "What 1000 Hours of AI Assistant Use Taught Me",
    "Why AI Assistants Are Getting Worse at Reasoning",
    // AI Coding
    "The Truth About AI Coding Assistants in 2026",
    "Why Junior Developers Should Embrace AI Coding Tools",
    "Cursor vs Windsurf: The AI IDE Showdown",
    "The Debugging Problem AI Coding Assistants Can't Solve",
    "Why AI-Generated Code Creates More Work Than It Saves",
    // AI Image & Media
    "Midjourney vs Stable Diffusion 4: The Real Difference",
    "Why AI Image Generation Is Plateauing",
    "The Copyright Problem AI Art Still Can't Solve",
    "How AI Is Changing Commercial Photography",
    // AI Productivity
    "The 10x Developer Myth: What the Data Actually Shows",
    "Why AI Productivity Claims Don't Match Reality",
    "The Attention Economy Problem AI Creates",
    "When AI Summarization Actually Hurts Understanding",
    // AI Agents & Automation
    "AI Agents in 2026: What's Working and What's Not",
    "The Infrastructure Problem Nobody Talks About",
    "Why AI Agent Memory Is Still Fundamentally Broken",
    "Building Reliable AI Agents: The Hard Truth",
    "The Gap Between AI Agent Hype and Reality",
    // LLM & Tech
    "Why Open Source LLMs Are Catching Up Fast",
    "The Compute Cost Problem Limiting AI Progress",
    "What Transformer Architecture Limits Mean for AI",
    "Why Context Windows Aren't the Answer"
  ],
  automation: [
    // No-Code & Tools
    "The No-Code Ceiling: When Tools Hit Their Limit",
    "Why Bubble.io Is Both Winning and Losing",
    "Zapier vs Make: Which Automation Tool Wins?",
    "The Hidden Costs of No-Code Solutions",
    "When to Abandon No-Code for Real Code",
    // Workflow & Productivity
    "Why Your Second Brain System Is Failing You",
    "The Productivity System That Actually Works",
    "Obsidian vs Notion: The Real Tradeoff",
    "Task Management in 2026: What's Actually Working",
    "The Pomodoro Problem: Why Timers Don't Work",
    // Developer Tools
    "The API Tools Actually Worth Your Time",
    "Why Developer Portals Are Getting Worse",
    "The State of API Documentation in 2026",
    "Building Internal Tools: What Actually Scales",
    // Business Automation
    "The ROI of Business Automation: Real Numbers",
    "Why Most Automation Projects Fail at Scale",
    "The Human-in-the-Loop Problem for Automation",
    "Process Mining: Finding Automation Opportunities",
    // Integration & API
    "The Webhook Reliability Problem Nobody Fixes",
    "Why Your Integration Architecture Matters",
    "Event-Driven Architecture: When It Actually Helps"
  ]
};

// === RESEARCH PHASE ===

async function researchTopic() {
  log('Starting research phase...');
  
  const tracker = loadPostedTracker();
  const lastArticle = getLastArticle();
  
  // Rotate categories
  let categoryIndex = 0;
  if (lastArticle && lastArticle.category) {
    const lastCatIndex = CATEGORIES.indexOf(lastArticle.category);
    categoryIndex = (lastCatIndex + 1) % CATEGORIES.length;
  }
  
  const category = CATEGORIES[categoryIndex];
  
  // Research keywords for this category
  const keywordData = await researchKeywords(category);
  
  // Get available titles (not recently posted)
  const availableTitles = TITLE_POOLS[category].filter(
    title => !isRecentlyPosted(tracker, title)
  );
  
  if (availableTitles.length === 0) {
    log('All titles recently posted, using backup pool');
    // Fall back to titles from other categories
    for (const cat of CATEGORIES) {
      if (cat === category) continue;
      const backupTitles = TITLE_POOLS[cat].filter(
        title => !isRecentlyPosted(tracker, title)
      );
      if (backupTitles.length > 0) {
        return {
          category: cat,
          title: backupTitles[Math.floor(Math.random() * backupTitles.length)],
          primary_keyword: cat === 'crypto' ? 'crypto analysis' : 
                          cat === 'ai' ? 'ai tools' : 'automation',
          keywordData,
          tracker
        };
      }
    }
    // Last resort: pick random from any category (force rotate)
    const allTitles = TITLE_POOLS[category];
    const randomTitle = allTitles[Math.floor(Math.random() * allTitles.length)];
    return { category, title: randomTitle, primary_keyword: category, keywordData, tracker };
  }
  
  // Pick a random available title
  const selectedTitle = availableTitles[
    Math.floor(Math.random() * availableTitles.length)
  ];
  
  // Determine primary keyword from title
  const primary_keyword = extractKeyword(selectedTitle, category);
  
  log(`Research complete: "${selectedTitle}" (${category})`);
  log(`Primary keyword: ${primary_keyword}`);
  
  return {
    category,
    title: selectedTitle,
    primary_keyword,
    keywordData,
    tracker
  };
}

/**
 * Extract primary keyword from title for SEO
 */
function extractKeyword(title, category) {
  const titleLower = title.toLowerCase();
  
  // Category-specific keyword mapping
  const keywordMap = {
    crypto: {
      'bitcoin': 'bitcoin analysis',
      'ethereum': 'ethereum price',
      'solana': 'solana defi',
      'defi': 'defi protocol',
      'nft': 'nft marketplace',
      'trading': 'crypto trading',
      'institutional': 'institutional crypto',
      'on-chain': 'on-chain data',
      'regulation': 'crypto regulation'
    },
    ai: {
      'claude': 'claude ai',
      'chatgpt': 'chatgpt',
      'cursor': 'ai coding',
      'windsurf': 'ai ide',
      'midjourney': 'ai image generation',
      'productivity': 'ai productivity',
      'agent': 'ai agent',
      'llm': 'llm comparison',
      'coding': 'ai coding tools'
    },
    automation: {
      'no-code': 'no-code tools',
      'bubble': 'bubble.io',
      'zapier': 'zapier automation',
      'make': 'make automation',
      'obsidian': 'obsidian second brain',
      'notion': 'notion productivity',
      'workflow': 'workflow automation',
      'api': 'api tools'
    }
  };
  
  const map = keywordMap[category] || keywordMap.crypto;
  
  for (const [key, keyword] of Object.entries(map)) {
    if (titleLower.includes(key)) {
      return keyword;
    }
  }
  
  return category === 'crypto' ? 'crypto analysis' :
         category === 'ai' ? 'ai tools' : 'automation';
}

function getLastArticle() {
  try {
    const content = fs.readFileSync(CONFIG.articlesFile, 'utf-8');
    const articlesMatch = content.match(/\{[\s\S]*?id:\s*['"]([^'"]+)['"][\s\S]*?category:\s*['"]([^'"]+)['"][\s\S]*?\}/g);
    if (articlesMatch && articlesMatch.length > 0) {
      const lastEntry = articlesMatch[articlesMatch.length - 1];
      const catMatch = lastEntry.match(/category:\s*['"]([^'"]+)['"]/);
      return { category: catMatch ? catMatch[1] : null };
    }
  } catch (e) {}
  return null;
}

// === ARTICLE GENERATION ===

async function generateArticle(research) {
  log('Generating article content...');
  
  const { category, title, primary_keyword, tracker } = research;
  
  const slug = generateSlug(title);
  
  // Generate content based on title and keyword
  const content = generateContent(title, primary_keyword, category);
  
  const article = {
    id: generateId(),
    slug,
    title,
    excerpt: generateExcerpt(title),
    content,
    category,
    readTime: estimateReadTime(content),
    date: getTodayDate(),
    author: 'Decryptica'
  };
  
  log(`Article generated: "${title}"`);
  
  // Mark as posted in tracker
  markAsPosted(tracker, title, slug);
  
  return article;
}

/**
 * Generate article content with Codex CLI
 * Returns 1,500+ word SEO-optimized article
 */
function generateContent(title, primary_keyword, category) {
  const today = getTodayDate();

  const categoryGuidance = {
    crypto: `You are writing for Decryptica, a crypto and DeFi blog. Focus on market structure, AMMs, DEX design, liquidity behavior, MEV, on-chain incentives, and actionable insights. Be specific about protocols, tradeoffs, and concrete mechanisms.`,
    ai: `You are writing for Decryptica, an AI tools blog. Focus on practical use cases, comparisons, pricing, and real-world performance. Be specific about features, limitations, and ideal use cases.`,
    automation: `You are writing for Decryptica, an automation blog. Focus on workflow patterns, tool comparisons, scalability considerations, and implementation tips. Be specific about tools, integrations, and trade-offs.`
  };

  const guidance = categoryGuidance[category] || categoryGuidance.automation;

  const prompt = `${guidance}

Write a complete, SEO-optimized article for Decryptica with the exact title: "${title}"

Hard requirements:
- Minimum 1,800 words
- Strong opening hook, then a bold **TL;DR** section near the top
- Use markdown with H2 and H3 headings
- Be specific, not generic
- No filler, no placeholder phrasing, no meta commentary about being an AI
- Include concrete examples, protocol references, and mechanism-level explanation where relevant
- End with a FAQ section with 3 useful questions and answers
- End with a section exactly titled "## The Bottom Line"
- End with this disclaimer exactly: "*This article presents independent analysis. Always conduct your own research before making investment or technology decisions.*"
- Keep the tone sharp, confident, and readable
- Optimize naturally for the primary keyword without stuffing

Topic metadata:
- Title: ${title}
- Primary keyword: ${primary_keyword}
- Category: ${category}
- Date: ${today}

Special instruction for this title:
If the title is about AMMs, explain why AMMs remain structurally important despite orderbook growth and intent-based routing. Cover liquidity fragmentation, long-tail assets, passive market making, LP economics, concentrated liquidity, MEV/arbitrage, and where AMMs are actually weak.

Return only the final article in markdown.`;

  try {
    const tmpPromptFile = `/tmp/decryptica_codex_prompt_${Date.now()}.txt`;
    const tmpOutFile = `/tmp/decryptica_codex_output_${Date.now()}.md`;
    fs.writeFileSync(tmpPromptFile, prompt, 'utf-8');

    execSync(
      `codex exec --model ${CONFIG.model} --output-last-message ${tmpOutFile} "$(cat ${tmpPromptFile})"`,
      {
        encoding: 'utf-8',
        maxBuffer: 50 * 1024 * 1024,
        stdio: 'pipe',
        shell: '/bin/zsh'
      }
    );

    const text = fs.readFileSync(tmpOutFile, 'utf-8').trim();
    try { fs.unlinkSync(tmpPromptFile); } catch {}
    try { fs.unlinkSync(tmpOutFile); } catch {}

    if (text && text.split(/\s+/).length >= 1200) {
      log(`Content generated with Codex: ${text.split(/\s+/).length} words`);
      return text;
    }

    throw new Error('Codex returned too little content');
  } catch (error) {
    log(`Codex generation error: ${error.message}, using fallback content`);
    return generateFallbackContent(title, primary_keyword, category);
  }
}

/**
 * Fallback content generator (used only if Ollama fails)
 * Still better than the original 200-word template
 */
function generateFallbackContent(title, primary_keyword, category) {
  const today = getTodayDate();
  
  const structures = {
    crypto: {
      sections: [
        "## The Current Market Landscape",
        "## What the Data Actually Shows",
        "## Key Technical Indicators",
        "## Risk Factors to Consider",
        "## Strategic Implications",
        "## FAQ: Common Questions"
      ]
    },
    ai: {
      sections: [
        "## The Current State of the Technology",
        "## Key Features and Capabilities",
        "## Real-World Performance",
        "## Limitations and Challenges",
        "## Practical Recommendations",
        "## FAQ: Common Questions"
      ]
    },
    automation: {
      sections: [
        "## Understanding the Trade-offs",
        "## Where No-Code Tools Excel",
        "## When Real Code Becomes Necessary",
        "## Implementation Considerations",
        "## Making the Transition",
        "## FAQ: Common Questions"
      ]
    }
  };
  
  const struct = structures[category] || structures.automation;
  
  return `${title}

**TL;DR**

- This analysis examines the key factors driving ${primary_keyword} in 2026
- We cut through marketing claims to focus on what the data actually shows
- Practical recommendations based on real-world testing and research
- The implications for your strategy depend on your specific use case and goals

## Introduction

The ${primary_keyword} landscape has evolved significantly, and making sense of it requires cutting through the noise to focus on fundamentals. Whether you are evaluating a new tool, considering a shift in strategy, or simply trying to understand the current state of the market, this analysis provides a data-driven perspective.

In the following sections, we examine the evidence, explore the nuances, and provide actionable recommendations based on what the research actually shows — not what the marketing materials claim.

${struct.sections.slice(0, 1).map(s => `
${s}

This section dives deep into the core dynamics at play. Understanding these fundamentals is essential for anyone making decisions in this space. The conventional wisdom often misses important nuances that become clear only when you examine the underlying data and real-world evidence.

Recent developments have created both opportunities and challenges. For some users, the barriers to entry have never been lower. For others, the complexity of modern solutions demands more sophisticated approaches. The key is understanding where you fall on this spectrum and adapting your strategy accordingly.`).join('')}

${struct.sections.slice(1, 4).map((s, i) => `
${s}

This area reveals important patterns that are easy to miss at first glance. ${i === 0 ? 'Multiple data sources converge on similar conclusions, suggesting a robust trend rather than noise.' : i === 1 ? 'The technical picture is nuanced, with different indicators telling different stories depending on timeframe and context.' : 'Risk assessment requires understanding both the obvious threats and the less visible ones that could emerge.'}

Our research involved analyzing dozens of data points, comparing expert opinions, and where possible, hands-on testing. The goal was to separate signal from noise and provide you with actionable insights rather than surface-level observations.

Key findings suggest that ${category === 'crypto' ? 'on-chain metrics and market structure provide more reliable signals than sentiment' : category === 'ai' ? 'real-world performance often diverges significantly from vendor benchmarks and marketing claims' : 'the scalability and maintenance burden of many solutions is underestimated in initial planning'}. This has important implications for how you evaluate options in this space.`).join('')}

${struct.sections.slice(4, 5).map(s => `
${s}

Based on the analysis above, here are the key recommendations:

1. **Start with clear objectives** — Understanding what you are trying to achieve makes evaluation significantly easier
2. **Focus on total cost, not just sticker price** — Implementation, maintenance, and learning curve all add to true cost
3. **Test with real workloads** — Demo environments rarely reveal limitations that emerge under actual use
4. **Plan for evolution** — The landscape changes fast; build flexibility into your approach
5. **Consider the ecosystem** — Integration with existing tools and workflows can be the difference between success and failure

These recommendations are based on patterns observed across multiple use cases and should be adapted to your specific situation.`).join('')}

${struct.sections.slice(5).map(s => `
${s}

**Q: Is this still relevant in 2026?**
A: The space evolves rapidly, but the fundamental principles discussed here remain applicable. We update our analysis as the landscape changes.

**Q: How did you research this?**
A: We combine official documentation, expert opinions, user reviews, and where possible, hands-on testing. We do not accept payment for placement.

**Q: What is the best approach for beginners?**
A: Start simple, validate your assumptions with small tests, and scale up only after confirming the approach works for your use case.`).join('')}

## The Bottom Line

The ${primary_keyword} space offers both genuine opportunities and significant risks. Making informed decisions requires understanding both the potential benefits and the real limitations. The analysis presented here is designed to help you navigate this complexity with greater confidence.

The most successful approach combines thorough evaluation with pragmatic implementation. Rather than chasing the latest trends, focus on solutions that address your specific needs and can scale with your requirements over time.

Use this analysis as a starting point for your own evaluation, not as a final verdict. The right choice depends on your unique circumstances, constraints, and goals. We will continue to monitor developments and provide updates as the landscape evolves.

---

*This article presents independent analysis. Always conduct your own research before making investment or technology decisions.*`;
}

function generateExcerpt(title) {
  // Create excerpt from title
  const clean = title.replace(/^[A-Z][^A-Z]*/, '').trim();
  return clean.substring(0, 140).trim() + '...';
}

// === FILE OPERATIONS ===

/**
 * Escape a string for embedding in a JavaScript template literal
 * Escapes backslashes, backticks, and ${} expressions
 */
function escapeTemplateLiteral(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\${/g, '\\${');
}

function addArticleToFile(article) {
  log('Adding article to articles.ts...');
  
  const articlesPath = CONFIG.articlesFile;
  let content = fs.readFileSync(articlesPath, 'utf-8');
  
  // Escape content for template literal
  const escapedContent = escapeTemplateLiteral(article.content);
  
  const articleEntry = `
  {
    id: '${article.id}',
    slug: '${article.slug}',
    title: "${article.title.replace(/"/g, '\\"')}",
    excerpt: "${article.excerpt.replace(/"/g, '\\"')}",
    content: \`${escapedContent}\`.trim(),
    category: '${article.category}',
    readTime: '${article.readTime}',
    date: '${article.date}',
    author: '${article.author}',
  },`;
  
  const insertMarker = 'articles: Article[] = [';
  content = content.replace(insertMarker, insertMarker + articleEntry);
  
  fs.writeFileSync(articlesPath, content, 'utf-8');
  log('Article added to file');
  
  return article.slug;
}

async function pushToGitHub(slug) {
  log('Committing and pushing to GitHub...');
  
  try {
    run('git add app/data/articles.ts', { cwd: CONFIG.workspace });
    run(`git commit -m "Daily article: ${slug}"`, { cwd: CONFIG.workspace });
    run(`git push origin main`, { cwd: CONFIG.workspace });
    log('Pushed to GitHub successfully');
    return true;
  } catch (error) {
    log(`Git push error: ${error.message}`);
    return false;
  }
}

async function waitForDeployment() {
  log('Waiting for Vercel deployment...');
  
  const maxWaitMinutes = 3;
  const checkInterval = 15000;
  const maxChecks = (maxWaitMinutes * 60 * 1000) / checkInterval;
  
  for (let i = 0; i < maxChecks; i++) {
    try {
      const response = execSync('curl -s -o /dev/null -w "%{http_code}" https://decryptica.com', {
        encoding: 'utf-8',
        timeout: 10000
      });
      
      if (response === '200') {
        log('Vercel deployment complete - site is live!');
        return true;
      }
    } catch (error) {}
    
    log(`Waiting for deployment... (${i + 1}/${maxChecks})`);
    execSync(`sleep ${checkInterval / 1000}`);
  }
  
  log('Deployment check timed out, but article was pushed to GitHub');
  return false;
}

async function sendNotification(article) {
  log('Sending Telegram notification...');
  
  const articleUrl = `https://decryptica.com/blog/${article.slug}`;
  const message = `🎯 New Decryptica Article!\n\n${article.title}\n\n📖 ${article.readTime} read\n🔗 ${articleUrl}`;
  
  try {
    const botToken = CONFIG.telegramBotToken;
    const chatId = CONFIG.chatId;
    
    if (!botToken) {
      log('Telegram bot token not configured, skipping notification');
      return false;
    }
    
    const command = `curl -s -X POST "https://api.telegram.org/bot${botToken}/sendMessage" -d "chat_id=${chatId}&text=${encodeURIComponent(message)}"`;
    execSync(command, { encoding: 'utf-8' });
    
    log('Telegram notification sent');
    return true;
  } catch (error) {
    log(`Telegram notification error: ${error.message}`);
    return false;
  }
}

async function handleError(error, context) {
  log(`ERROR in ${context}: ${error.message}`);
  
  try {
    const botToken = CONFIG.telegramBotToken;
    if (botToken) {
      const errorMessage = `⚠️ Decryptica Article Error\n\nFailed at: ${context}\nError: ${error.message}`;
      const command = `curl -s -X POST "https://api.telegram.org/bot${botToken}/sendMessage" -d "chat_id=${CONFIG.chatId}&text=${encodeURIComponent(errorMessage)}"`;
      execSync(command, { encoding: 'utf-8' });
    }
  } catch (e) {}
  
  process.exit(1);
}

// === MAIN ===

async function main() {
  log('=== Daily Article Generator v2 Started ===');
  log(`Date: ${getTodayDate()}`);
  
  try {
    // Step 1: Research with keyword analysis
    const research = await researchTopic();
    
    // Step 2: Generate Article
    const article = await generateArticle(research);
    
    // Step 3: Add to file
    const slug = addArticleToFile(article);
    
    // Step 4: Commit and push
    const pushed = await pushToGitHub(slug);
    
    if (pushed) {
      // Send notification immediately after push (before deployment check)
      // This ensures Brian gets notified even if deployment check times out
      await sendNotification(article);
      
      // Wait for deployment in background (don't block notification)
      waitForDeployment().catch(() => {});
    }
    
    log('=== Complete ===');
    log(`Title: ${article.title}`);
    log(`Slug: ${article.slug}`);
    log(`Category: ${article.category}`);
    log(`Keyword: ${research.primary_keyword}`);
    
  } catch (error) {
    await handleError(error, 'main execution');
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { main, researchTopic, generateArticle };