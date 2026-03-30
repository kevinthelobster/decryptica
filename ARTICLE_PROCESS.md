# Decryptica Article Creation Process

## Step 1: The Researcher (Scraper & Data Extractor)

**Input:** Trending URLs or RSS feeds.

**Role:** Senior Research Agent (Crypto/AI/Automation)

**Objective:** Identify a high-traffic topic from the last 24 hours that lacks technical depth in mainstream reporting.

**Task:**
1. Scrape [CoinDesk, The Defiant, AI News, GitHub Trending, Substack] for the top 3 stories.
2. For the most relevant story, identify the "Mainstream Consensus" (the common narrative).
3. Find "The Gap": A specific technical detail, a failed logic in the consensus, or a specific Python/Solidity library mentioned in the fine print.

**Output (JSON):**
```json
{
  "topic": "",
  "consensus": "",
  "the_gap": "",
  "technical_entity": "Specific tool/repo",
  "primary_keyword": ""
}
```

## Step 2: The Architect (Outline & Perspective)

**Input:** Output from Step 1.

**Role:** Content Strategist & SEO Architect

**Task:** Create an article outline that prioritizes "Information Gain."

**Requirements:**

- **Contrarian Title:** Create a headline that challenges the {{consensus}}.
- **H2/H3 Structure:** Each header must answer a "People Also Ask" query but provide a unique, data-driven answer based on {{the_gap}}.
- **The 'Value Block':** Design a section for a "Quick-Start Automation Logic" or a "Risk/Reward Table" for the {{technical_entity}}.
- **Internal Link Logic:** Identify a placeholder for an internal link to a previous post (referencing {{site_inventory}}).

## Step 3: The Ghostwriter (Content Generation)

**Input:** Outline from Step 2.

**Role:** Senior Technical Investigative Journalist

**Tone:** No-nonsense, skeptical, first-person ("I noticed," "In my build")

**Negative Constraints (DO NOT USE):**
- Phrases: "In today's fast-paced world," "Delve," "Unlock," "Testament to," "Game-changer," "Revolutionizing," "In summary."

**Style:** No flowery metaphors. No generic fluff. No "concluding" with a recap of what was just said.

**Style Enforcements:**
- **Sentence length:** Mix 5-word "punch" sentences with 25-word technical explanations.
- **Format:** Use Markdown. Use bolding for Technical Keywords only.
- **Content:** You must explain how to implement the {{technical_entity}} mentioned in the research.
- **Word Count:** 1,200+ words of high-density utility.

## Step 4: The SEO Optimizer (Final Polish & Internal Linking)

**Input:** Draft from Step 3 + {{site_inventory}}

**Role:** LSI & Internal Link Optimizer

**Task:**
1. Scan the draft for the {{primary_keyword}} and ensure it appears in the first H2 and naturally in the text (1% density).
2. Select 1 relevant article from {{site_inventory}} and embed a natural link using "Descriptive Anchor Text" (e.g., "how we automated [Topic B]").
3. Add a "Technical TL;DR" box at the top with 3 bullet points.
4. Add a placeholder [AFFILIATE_LINK: ToolName] where the reader would naturally look for a solution.

## Step 5: The Deployer (Commit & Publish)

**Input:** Final article ready in `/app/blog/[slug]/page.tsx`

**Task:**
1. Commit the article to git with a descriptive message.
2. Push to GitHub.
3. Deploy to Vercel production.
4. Verify the build succeeds.
