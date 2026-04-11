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

// ─── OTHER ───────────────────────────────────────────────────────────────────

addPrompt({
  title: 'Eisenhower Todo Prioritizer',
  slug: 'eisenhower-todo-prioritizer',
  category: 'Other',
  description: 'Takes your TASKS.md or any task list and reorders it using the urgent/important matrix — tells you what to do first, what to schedule, what to delegate, and what to cut.',
  prompt_text: `Take a task list (from TASKS.md or pasted text) and reorder it using the Eisenhower Matrix — urgent/important grid. Tell you exactly what to do first, what to schedule, what to delegate, and what to eliminate.\n\nEISENHOWER MATRIX DEFINITIONS:\n- QUADRANT 1 (Urgent + Important): Do immediately — crises, deadlines, emergencies\n- QUADRANT 2 (Not Urgent + Important): Schedule — planning, relationships, growth\n- QUADRANT 3 (Urgent + Not Important): Delegate — interruptions, others priorities\n- QUADRANT 4 (Not Urgent + Not Important): Eliminate — timewasters, trivial, escape\n\nINPUT:\nRead TASKS.md from ~/.openclaw/workspace/TASKS.md or use tasks provided by the user.\n\nPROCESS:\n1. Parse all tasks — each line is a task (bullet points, numbered lists, or plain text)\n2. For each task, classify by:\n   - Urgency: Does it have a deadline? Is it blocking others? Is it time-sensitive?\n   - Importance: Does it align with top goals? Does it have high impact if done?\n3. Assign each task to a quadrant\n4. Reorder the task list accordingly\n5. If a task is ambiguous, ask the user to clarify urgency or importance\n\nOUTPUT:\nDisplay the full Eisenhower Matrix with tasks grouped:\n\n🟥 QUADRANT 1 — DO NOW (Urgent + Important)\n  1. [Task text] — deadline: [date if known]\n  2. [Task text] — why urgent: [1 sentence]\n\n🟨 QUADRANT 2 — SCHEDULE (Important, Not Urgent)\n  1. [Task text] — suggested deadline: [3-5 days from now]\n  2. [Task text] — why important: [1 sentence]\n\n🟩 QUADRANT 3 — DELEGATE (Urgent, Not Important)\n  1. [Task text] — can someone else handle this?\n\n🟦 QUADRANT 4 — ELIMINATE (Neither)\n  1. [Task text] — reason: [why this can be dropped]\n\nAlso output a reprioritized task list (top to bottom):\n1. Do first: [Q1 tasks in order]\n2. Then: [Q2 tasks in order]\n3. Consider: [Q3 tasks]\n4. Drop: [Q4 tasks]\n\nTOOLS: read, exec`,
  tools: ['read', 'exec'],
  setup_steps: [
    'Point to your TASKS.md: ~/.openclaw/workspace/TASKS.md',
    'Or paste/send your raw task list as input',
    'Model will parse, classify, and return the full Eisenhower Matrix',
    'Review Q1 tasks — those are your immediate priorities',
    'For Q2 tasks: set concrete deadlines to prevent slippage'
  ],
  trigger: 'eisenhower',
  example_output: `🟥 QUADRANT 1 — DO NOW\n  1. Submit tax extension — deadline: Apr 15\n  2. Fix production bug in swap module — blocking 3 other devs\n\n🟨 QUADRANT 2 — SCHEDULE\n  1. Write Q2 content calendar — blocks strategy meeting\n  2. Review competitor pricing — informs next roadmap decision\n\n🟩 QUADRANT 3 — DELEGATE\n  1. Update investor deck slides — assistant can draft\n\n🟦 QUADRANT 4 — ELIMINATE\n  1. Refactor legacy auth module — not blocking anything`
});

addPrompt({
  title: 'Random Act of Kindness Scheduler',
  slug: 'random-act-of-kindness-scheduler',
  category: 'Other',
  description: 'Daily nudge with a random small kindness idea tailored to your location and timezone — takes 5 minutes or less, makes someone\'s day.',
  prompt_text: `Get a daily nudge with a random small kindness idea tailored to your location and timezone — takes 5 minutes or less and makes someone's day.\n\nPROCESS:\n1. Get current date/time and detect timezone from system or user input\n2. Assess the day context:\n   - Day of week (weekday = professional kindness; weekend = personal)\n   - Time of day (morning = prepare/plan; afternoon = immediate action)\n   - Local context (near a coffee shop? School pickup? Grocery store?)\n3. Pull a random kindness action from the appropriate category below\n4. Personalize it slightly based on context provided\n\nKINDNESS CATEGORIES:\n\nQUICK MORNING (before noon):\n- Pay for the coffee order behind you at the drive-through\n- Leave a positive review for a small local business you visited recently\n- Send a "checking in" text to someone who seemed stressed recently\n- Leave a sticky note with an encouraging message in a public space\n\nMIDDAY (noon - 5pm):\n- Hold the elevator for someone carrying heavy items\n- Leave a generous tip with a note: "Your work matters"\n- Send a specific compliment to a coworker (not generic — mention exact thing)\n- Email or call a family member you have not spoken to in a while\n\nEVENING (after 5pm):\n- Help a neighbor with their garbage bins\n- Leave a package of essentials (water + snack) for your mail carrier\n- Write a 3-sentence thank you note to someone who helped you this week\n- Offer to run a small errand for someone who is busy or unwell\n\nLOCATION TAILORING:\n- Near coffee shop: pay it forward\n- Near school: donate to teacher supply fund\n- Near gym: compliment someone on their dedication\n- Near park: pick up 5 pieces of litter\n\nOUTPUT:\n[Sun/Moon icon] [Day period] Kindness Nudge — [Date]\n\n[Location context if relevant]\n\n✨ Today's idea: [Action name]\nWhy it works — 1 sentence\nTime needed: ~X minutes\n\nExact prompt: How to do this specifically — word for word if applicable\n\nTOOLS: exec, message, cron`,
  tools: ['exec', 'message', 'cron'],
  setup_steps: [
    'Set your timezone in the script (defaults to system timezone)',
    'Configure preferred categories (morning/afternoon/evening)',
    'Set cron to send nudge daily at a preferred time (e.g., 9 AM)',
    'Script: ~/scripts/kindness.sh — run daily',
    'Add to crontab: "0 9 * * *" ~/scripts/kindness.sh',
    'Get your daily nudge via Telegram'
  ],
  trigger: 'kindness',
  example_output: `🌤️ Morning Kindness Nudge — Apr 11 2026\n\n✨ Today's idea: Pay it Forward at Coffee Shop\nYou are near Milford — there is a local shop on Main St. Small gesture, huge mood lift for someone.\nTime needed: ~3 minutes\n\nExact prompt: When you order, say "I am paying for the person behind me too."`
});

addPrompt({
  title: 'Quick Stats Dashboard',
  slug: 'quick-stats-dashboard',
  category: 'Other',
  description: 'Renders a simple text dashboard showing bot P&L, article count, disk usage, cron status — one command to pull all your system stats at a glance.',
  prompt_text: `Run a single command and get a real-time text dashboard of all your system stats: bot P&L, article count, disk usage, cron job status, and any alerts. Everything in one view.\n\nDASHBOARD SECTIONS:\n\n=== SYSTEM OVERVIEW ===\n- Uptime and load average\n- Memory usage\n- Disk usage (root and workspace)\n\n=== CRYPTO BOT STATUS ===\n- Sniper bot: run status check or show "not running"\n- Bot wallet balance: check balances script output\n- Recent P&L: tail last line of pnl log\n- Active positions: count open positions\n\n=== DECRYPTICA CONTENT ===\n- Articles published: count articles in data/articles.json\n- Last article pushed: git log -1 in the decryptica repo\n- Vercel deployment status\n\n=== CRON HEALTH ===\n- Failed cron runs today: grep errors in log files\n- Cron jobs active: crontab -l | grep -v "^#" count\n- Last backup: tail -1 of backup log\n\n=== ALERTS ===\n- Unread error logs: grep ERROR/FATAL\n- Failed API calls: grep 429/500/503 in logs\n\nPROCESS:\n1. Run each check using exec with appropriate commands\n2. Aggregate all outputs into a formatted text table\n3. Color-code if terminal supports it:\n   - 🟢 Green: healthy / expected value\n   - 🟡 Yellow: borderline / watch item\n   - 🔴 Red: problem / needs attention\n4. Display in monospace/fixed-width for readability\n5. End with one-line summary: "System: [HEALTHY/WARNING/CRITICAL] — [top issue if any]"\n\nTOOLS: exec, filesystem`,
  tools: ['exec', 'filesystem'],
  setup_steps: [
    'Verify paths in the script match your actual directory structure',
    'Update crypto bot paths (sniper.py, balances script) to match your setup',
    'Update Vercel API credentials if you want deployment status',
    'Create script: ~/scripts/quick_stats.sh',
    'Make executable: chmod +x ~/scripts/quick_stats.sh',
    'Run with: ~/scripts/quick_stats.sh — displays dashboard immediately'
  ],
  trigger: 'stats',
  example_output: `=== QUICK STATS DASHBOARD === Apr 11 2026 14:00 UTC\n\n🟢 SYSTEM: Healthy\nUptime: 45 days | Load: 0.23 0.19 0.15\nMemory: 6.2G/16G | Disk: 342G/500G (68%)\n\n🟡 CRYPTO: Watch\nSniper bot: RUNNING | Wallet: 0.8 SOL\nP&L today: +$12.40 | Positions: 3 open\n⚠️ One position underwater by $3.20\n\n🟢 DECRYPTICA: Healthy\nArticles: 247 | Last push: 2h ago\nDeploy: production (live)\n\n🟢 CRON: Healthy\nActive jobs: 8 | Failed today: 0\nLast backup: Apr 11 02:00 UTC\n\n=== System: HEALTHY — All nominal ===`
});

fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
console.log('Batch 2 done. Total prompts:', data.prompts.length);
