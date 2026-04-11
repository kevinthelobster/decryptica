const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/prompts/prompts.json');
const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
const now = Math.floor(Date.now() / 1000);

function addPrompt(p) {
  const id = Math.max(...data.prompts.map(x => x.id)) + 1;
  data.prompts.push({
    id,
    slug: p.slug,
    title: p.title,
    category: p.category,
    description: p.description,
    prompt_text: p.prompt_text,
    tools: p.tools || ['exec'],
    setup_steps: p.setup_steps,
    trigger: p.trigger || p.slug.split('-')[0],
    example_output: p.example_output || '',
    is_staff_pick: false,
    vote_count: 0,
    created_at: now,
    updated_at: now,
  });
  console.log('Added:', p.title);
}

// ─── COMMUNICATION & AUTOMATION ─────────────────────────────────────────────

addPrompt({
  title: 'Email Digest Bridge',
  slug: 'email-digest-bridge',
  category: 'Communication & Automation',
  description: 'Forwards your unread emails to Telegram as a daily digest — sender, subject, and one-line preview so you can triage without opening your inbox.',
  prompt_text: `Set up a daily email digest that pulls your unread emails, formats them as a clean Telegram digest with sender, subject, and one-line preview — triage without opening your inbox.\n\nCONFIGURATION:\nCreate ~/configs/email_digest_config.json:\n{\n  \"provider\": \"gmail\",\n  \"email\": \"your@gmail.com\",\n  \"max_emails\": 15,\n  \"filter\": \"is:unread newer_than:1d\",\n  \"include_senders\": [\"important-sender@domain.com\"],\n  \"exclude_senders\": [\"no-reply@spam.com\", \"newsletter@uncsubs.com\"],\n  \"telegram_chat_id\": \"YOUR_CHAT_ID\"\n}\n\nPROCESS:\n1. Authenticate with Gmail using imaplib (Python) or via Gmail API:\n   a. Python approach: use imaplib with app password\n   b. Or: use curl with Gmail API v1 with OAuth2 token\n2. Search emails with filter: is:unread newer_than:1d\n3. For each email (max max_emails):\n   a. Extract: From, Subject, Date, Snippet (first 150 chars of body)\n   b. Filter: skip if sender in exclude_senders OR not in include_senders (if include_senders is non-empty)\n4. Sort by: sender importance (if known VIP senders), then by date DESC\n5. Format the digest\n\nDIGEST FORMAT:\n📧 Email Digest — [DATE] ([N] unread)\n\n👤 [Sender Name] <sender@email.com>\n   Subject: [Subject Line]\n   Preview: [First 150 chars of email body...]\n   Time: [relative time, e.g. \"3 hours ago\"]\n\n[Repeat for each email]\n\n⏭️ [N] more unread emails (not shown)\n\nTOOLS: exec, filesystem, cron, message`,
  tools: ['exec', 'filesystem', 'cron', 'message'],
  setup_steps: [
    'Set up a Gmail App Password: myaccount.google.com → Security → App passwords',
    'Create ~/configs/email_digest_config.json with your email and credentials',
    'Create script: ~/scripts/email_digest.sh using Python imaplib',
    'Make executable: chmod +x ~/scripts/email_digest.sh',
    'Add to crontab: "0 8,18 * * *" to send digest morning and evening',
    'Test manually: run script and verify it fetches recent unread emails',
    'Verify Telegram bot sends the digest correctly'
  ],
  trigger: 'email-digest',
  example_output: `📧 Email Digest — Apr 11 2026 (7 unread)\n\n👤 GitHub <notifications@github.com>\n   Subject: [kevinthelobster] PR #247: Update dependencies\n   Preview: The following dependencies have been updated: next@14.2.0, react@18.3.0. Please review and merge when ready...\n   Time: 2 hours ago\n\n👤 Vercel <no-reply@vercel.com>\n   Subject: Deploy successful: decryptica\n   Preview: Your project was deployed to production. Preview: https://decryptica-xxxx.vercel.app...\n   Time: 5 hours ago\n\n👤 Brian Erickson <brian@gmail.com>\n   Subject: Re: Article ideas for next week\n   Preview: Hey — I was thinking we could cover the new Jupiter features. Let me know what you think...\n   Time: yesterday`
});

addPrompt({
  title: 'Meeting Prep Agent',
  slug: 'meeting-prep-agent',
  category: 'Communication & Automation',
  description: 'Before any meeting, pulls relevant files, emails, and context so you walk in prepared — never be caught off guard in a meeting again.',
  prompt_text: `Before any meeting, automatically pull relevant files, emails, and context so you walk in prepared.\n\nINPUT:\n- meeting_title or calendar event name: provided by user or read from calendar\n- meeting_time: provided by user\n\nPROCESS:\n1. Parse the meeting:\n   a. Extract key topics/keywords from meeting title (e.g., "Q2 Planning Review" → Q2, planning, review)\n   b. Identify attendees if provided (names or email handles)\n2. Pull relevant context:\n   a. Read any files in memory/workspace related to the topics (e.g., memory/Q2-planning.md)\n   b. Search email: web_search for recent emails with meeting title keywords (or read from email if connected)\n   c. Check project management tools: read any relevant task lists or docs\n3. Generate prep brief:\n\na) Meeting overview:\n   - Title: [provided or extracted]\n   - Time: [provided]\n   - Attendees: [provided or TBD]\n\nb) Relevant background:\n   - Recent decisions: [from memory files]\n   - Current status: [from project files]\n   - Open questions: [from memory/email]\n\nc) Things to remember:\n   - Past commitments: [from memory — what you or team promised last time]\n   - Ongoing concerns: [from memory — known issues with the topic]\n\nd) Suggested agenda:\n   - Topic 1: [what to cover, ~X minutes]\n   - Topic 2: [what to cover, ~X minutes]\n\n4. Output a clean prep brief\n\nOUTPUT FORMAT:\n📋 Meeting Prep — [MEETING TITLE]\n\n**When:** [date/time]\n**Attendees:** [names]\n\n**Background**\n[Key context from relevant files and past discussions]\n\n**Things to Remember**\n- [From past meetings or commitments]\n- [Known concerns or open issues]\n\n**Suggested Agenda**\n1. [Topic] — ~[X] min — [what to accomplish]\n2. [Topic] — ~[X] min — [what to accomplish]\n\n**Prep Files**\n- memory/quarterly-planning.md (last modified: Mar 15)\n\nTOOLS: read, filesystem, exec`,
  tools: ['read', 'filesystem', 'exec'],
  setup_steps: [
    'Provide meeting title and time',
    'Model will search relevant memory files and project docs',
    'Review the generated brief before the meeting',
    'Best used the morning of or the night before a meeting',
    'Point to your memory directory for personal context'
  ],
  trigger: 'meeting-prep',
  example_output: `📋 Meeting Prep — Q2 Strategy Review\n\n**When:** Apr 15, 2026 at 2:00 PM\n**Attendees:** Brian, Sarah (PM), David (Eng)\n\n**Background**\nFrom memory/quarterly-planning.md (last updated Mar 28):\n- Q1 goals: 50 articles published, $2K revenue target\n- Actual: 47 articles, $1,340 revenue\n- Content cluster strategy launched in Feb, still building authority\n\n**Things to Remember**\n- Brian mentioned at the Mar 28 sync that ad revenue is underperforming\n- Sarah flagged that Decryptica needs more backlink outreach\n- Last action: Kevin to explore programmatic SEO opportunities\n\n**Suggested Agenda**\n1. Q1 retro — 15 min — what worked/what did not\n2. Q2 revenue target — 20 min — need $5K/mo target, how?\n3. Backlink strategy — 15 min — Sarah has outreach contacts\n4. Content priorities — 10 min — which clusters next`
});

addPrompt({
  title: 'Cross-Post Engine',
  slug: 'cross-post-engine',
  category: 'Communication & Automation',
  description: 'Takes one message and posts it to multiple channels — Discord, Slack, Telegram — with platform-appropriate formatting automatically applied.',
  prompt_text: `Take one message and cross-post it to multiple channels (Discord, Slack, Telegram) with platform-appropriate formatting applied automatically.\n\nINPUT:\n- message_content: the message to post\n- channels: array of target channels\n- format_type: announcement | update | question | alert\n\nCONFIGURATION:\nCreate ~/configs/crosspost_channels.json:\n{\n  \"defaults\": {\n    \"discord_webhook\": \"https://discord.com/api/webhooks/YOUR/WEBHOOK\",\n    \"slack_channel\": \"#general\",\n    \"telegram_chat_id\": \"YOUR_CHAT_ID\"\n  },\n  \"platform_limits\": {\n    \"discord\": {\"max_length\": 2000, \"supports_markdown\": true},\n    \"slack\": {\"max_length\": 3000, \"supports_markdown\": true},\n    \"telegram\": {\"max_length\": 4096, \"supports_markdown\": true}\n  }\n}\n\nPROCESS:\n1. Analyze message content and format_type\n2. Adapt format for each platform:\n\na) DISCORD:\n   - Use **bold** for headings (not #)\n   - Use > for block quotes\n   - Use code blocks for technical content\n   - Split long messages at 2000 chars with [...continued]\n   - Send via webhook: POST to discord_webhook URL\n\nb) SLACK:\n   - Use *bold* for headings\n   - Keep bullet points with - or •\n   - @ mentions for specific people\n   - Split at 3000 chars\n   - Send via Slack API: chat.postMessage to channel\n\nc) TELEGRAM:\n   - Use *bold* for emphasis\n   - Use _italic_ sparingly\n   - Use \\n for line breaks (no markdown lists — plain text bullets)\n   - Split at 4096 chars\n   - Send via message tool\n\n3. For each platform:\n   a. Format message appropriately\n   b. Send to channel\n   c. Log success/failure with timestamp\n4. Print summary: what was sent where and final status\n\nOUTPUT FORMAT:\n📤 Cross-Post Summary — [timestamp]\n\n✅ Discord: Posted to #general\n   Delivered: 1,247 chars\n\n✅ Slack: Posted to #general\n   Delivered: 1,247 chars\n\n✅ Telegram: Sent to 8324073314\n   Delivered: 1,247 chars\n\nTOOLS: exec, message, filesystem`,
  tools: ['exec', 'message', 'filesystem'],
  setup_steps: [
    'Set up Discord webhook: Discord server → Channel settings → Integrations → Webhooks',
    'Set up Slack bot: api.slack.com → Create App → Bot Token → chat:write permission',
    'Configure ~/configs/crosspost_channels.json with your webhooks and tokens',
    'Create script: ~/scripts/crosspost.sh',
    'Make executable: chmod +x ~/scripts/crosspost.sh',
    'Test: send a test message to all channels and verify formatting',
    'Use for: announcements, project updates, team-wide communications'
  ],
  trigger: 'crosspost',
  example_output: `📤 Cross-Post Summary — Apr 11 2026 14:00 UTC\n\n✅ Discord: Posted to #announcements\n   Delivered: 847 chars | Format: announcement\n\n✅ Slack: Posted to #general\n   Delivered: 847 chars | Format: announcement\n\n✅ Telegram: Sent to 8324073314\n   Delivered: 847 chars | Format: announcement\n\nNote: Telegram formatting simplified (no markdown lists)`
});

addPrompt({
  title: 'Weekly Voice Summary',
  slug: 'weekly-voice-summary',
  category: 'Communication & Automation',
  description: 'Uses TTS to read your week\'s summary aloud and sends as a voice message to Telegram — consume your weekly recap while driving or walking.',
  prompt_text: `Set up a weekly recap that synthesizes your week\'s activity — articles published, bot performance, meetings, decisions — and uses TTS to read it aloud as a voice message.\n\nINPUT:\n- week_start: YYYY-MM-DD (start of the week to summarize)\n\nPROCESS:\n1. Gather data from the past week:\n\na) DECRYPTICA:\n   - Git log for the week: git -C ~/decryptica log --since="[week_start]" --oneline\n   - Count: articles published, deploys made\n   - Read memory files for any notable decisions or context\n\nb) CRYPTO BOTS:\n   - Read P&L logs: tail -50 ~/logs/sniper_pnl.log from the past week\n   - Summarize: total P&L, biggest win, biggest loss, new positions opened/closed\n\nc) COMMUNITY/ENGAGEMENT:\n   - Memory files: any notes about calls, meetings, or decisions from the week\n   - Any pending items flagged\n\nd) TASKS:\n   - Read TASKS.md: what was completed, what is still pending\n\n2. Synthesize into a coherent weekly narrative:\n\nWEEKLY SUMMARY TEMPLATE:\n\"This week: [biggest accomplishment]. On Decryptica: [N] articles published, [N] deploys. Bot performance: [P&L summary]. Key decision: [from memory]. Looking ahead: [priorities for next week]. Pending: [items requiring your attention].\"\n\n3. Convert to TTS:\n   a. Use the tts tool with the synthesized summary text\n   b. Save audio output\n4. Send audio as voice message to Telegram via message tool with asVoice: true\n\nVOICE MESSAGE TEXT (for TTS):\n[Weekly Summary for the week of April 7th, 2026]\n\n[Generated narrative following the template above]\n\n[End with:] That's your week in review. Have a great week ahead.\n\nOUTPUT:\n📊 Weekly Voice Summary — Week of [DATE]\n\nGenerated summary ({char_count} chars):\n[Text preview of the summary]\n\n🎙️ Voice message: Generated ({audio_duration}s)\n📨 Telegram: Sent as voice message\n\nTOOLS: exec, filesystem, read, tts, message`,
  tools: ['exec', 'filesystem', 'read', 'tts', 'message'],
  setup_steps: [
    'Point to your decryptica repo, logs directory, and memory files',
    'Model will synthesize the week from git log, P&L logs, and memory',
    'TTS voice message is generated and sent to Telegram',
    'Best run: Sunday evening before the new week starts',
    'Set cron: "0 18 * * 0" (Sunday 6 PM) to generate weekly recap',
    'Verify TTS tool is configured with your preferred voice'
  ],
  trigger: 'voice-summary',
  example_output: `📊 Weekly Voice Summary — Week of Apr 7, 2026\n\nGenerated summary (847 chars):\nThis week was solid. On Decryptica, you published 14 articles including the Solana DeFi deep dive which got the most engagement. Three deploys to production. The sniper bot had a quiet week — plus $23 in P&L, one new position opened and closed. One decision made: shifting to the topical cluster content strategy starting next week. Looking ahead: focus on backlink outreach and 5 more articles in the AI tools cluster.\n\nPending: Kroger auto-cart script needs testing, and Sarah is waiting on the Q2 content calendar.\n\n🎙️ Voice message: Generated (47s audio)\n📨 Telegram: Sent as voice message`
});

fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
console.log('Batch 6 done. Total prompts:', data.prompts.length);
