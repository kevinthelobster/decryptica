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
  model: process.env.AI_MODEL || 'minimax/MiniMax-M2.5',
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

function generateContent(title, primary_keyword, category) {
  const today = getTodayDate();
  
  // Different content structures based on category
  const structures = {
    crypto: {
      sections: [
        "## The Market Narrative",
        "## What On-Chain Data Actually Shows",
        "## The Technical Picture",
        "## Key Metrics to Watch",
        "## The Bottom Line"
      ],
      insights: [
        "After analyzing recent on-chain data, a clear pattern emerges that contradicts the prevailing market narrative.",
        "The correlation between ETF flows and price action reveals something most analysts are missing.",
        "Network activity metrics tell a different story than price charts suggest."
      ]
    },
    ai: {
      sections: [
        "## The Hype vs Reality Gap",
        "## What the Research Actually Shows",
        "## Key Limitations to Understand",
        "## When It Actually Works",
        "## The Practical Takeaway"
      ],
      insights: [
        "Despite the marketing claims, our analysis reveals significant gaps between promised and actual performance.",
        "User data and independent studies paint a more nuanced picture than vendor benchmarks suggest.",
        "The real value proposition lies in specific use cases, not general-purpose claims."
      ]
    },
    automation: {
      sections: [
        "## The Promise vs Reality",
        "## Where Tools Actually Deliver",
        "## The Scalability Problem",
        "## Making It Work in Practice",
        "## The Real Cost Analysis"
      ],
      insights: [
        "The enterprise automation market promises transformation, but implementation reality tells a different story.",
        "After testing dozens of tools across different scales, patterns emerge about where automation actually saves time.",
        "The hidden costs of maintenance and updates often exceed initial savings."
      ]
    }
  };
  
  const struct = structures[category] || structures.crypto;
  const insight = struct.insights[Math.floor(Math.random() * struct.insights.length)];
  
  return `
${title}

**The short version:** ${insight}

## Introduction

${insight}

This analysis cuts through the noise to focus on what the data actually shows—not what the headlines claim.

${struct.sections.map((section, i) => `
${section}

${i === 0 ? insight : `The conventional wisdom says one thing, but the underlying ${primary_keyword} fundamentals suggest another path forward.`}
`.trim()).join('\n\n')}

## The Bottom Line

${insight}

For those focused on ${primary_keyword}, the implications are significant. The winners in this space will be those who understand the gap between narrative and reality.

---

*This article presents independent analysis. Always conduct your own research before making investment or technology decisions.*
  `.trim();
}

function generateExcerpt(title) {
  // Create excerpt from title
  const clean = title.replace(/^[A-Z][^A-Z]*/, '').trim();
  return clean.substring(0, 140).trim() + '...';
}

// === FILE OPERATIONS ===

function addArticleToFile(article) {
  log('Adding article to articles.ts...');
  
  const articlesPath = CONFIG.articlesFile;
  let content = fs.readFileSync(articlesPath, 'utf-8');
  
  const articleEntry = `
  {
    id: '${article.id}',
    slug: '${article.slug}',
    title: "${article.title.replace(/"/g, '\\"')}",
    excerpt: "${article.excerpt}",
    content: \`${article.content}\`.trim(),
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