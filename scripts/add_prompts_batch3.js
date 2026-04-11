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

// ─── MEMORY MANAGEMENT ───────────────────────────────────────────────────────

addPrompt({
  title: 'Memory Decay Detector',
  slug: 'memory-decay-detector',
  category: 'Memory Management',
  description: 'Flags memory files untouched for 30+ days, suggests what is stale and ready to archive — keeps your knowledge base lean and relevant.',
  prompt_text: `Set up an always-on automation that scans your memory files, flags anything untouched for 30+ days, and suggests what is stale and ready to archive.\n\nCONFIGURATION:\n- memory_dir: ~/.openclaw/memory/\n- state_file: ~/.openclaw/memory/memory_decay_state.json\n- threshold_days: 30\n\nSTATE FILE FORMAT:\n{\n  "files": {\n    "memory/YYYY-MM-DD.md": {\n      "last_modified": 1744156800,\n      "last_accessed": 1744156800,\n      "word_count": 450,\n      "access_count": 3\n    }\n  },\n  "archive_candidates": []\n}\n\nPROCESS:\n1. List all files in ~/.openclaw/memory/ recursively (/*.md and /*/*.md)\n2. For each file, get: last modified timestamp (stat -c %Y), file size, word count (wc -w)\n3. Load state_file — if file is new, add entry. If file was previously seen, update.\n4. For each file, calculate days_since_access = (now - last_modified) / 86400\n5. Flag files where days_since_access > 30 as STALE\n6. Also flag files with word_count < 50 and access_count == 1 as LOW_VALUE\n7. Build archive_candidates list sorted by: (days_since_access DESC, access_count ASC)\n8. Save updated state_file\n9. Send Telegram digest\n\nDIGEST FORMAT:\n🧠 Memory Decay Report — [DATE]\n\n{count} files untouched for 30+ days:\n1. [filename] — {days} days stale | {access_count} accesses | {word_count} words\n   Suggestion: [ARCHIVE/KEEP/MERGE]\n\n{count} low-value files (short + rarely accessed):\n1. [filename] — {word_count} words, accessed {access_count}x\n   Suggestion: MERGE into a related file or DELETE\n\nTOOLS: exec, filesystem, cron, message`,
  tools: ['exec', 'filesystem', 'cron', 'message'],
  setup_steps: [
    'Create ~/.openclaw/memory/ directory if it does not exist',
    'Initialize ~/.openclaw/memory/memory_decay_state.json with {"files": {}, "archive_candidates": []}',
    'Create script: ~/scripts/memory_decay.sh',
    'Make executable: chmod +x ~/scripts/memory_decay.sh',
    'Add to crontab: "0 9 * * 1" to run every Monday morning',
    'Test: run manually and review the decay report',
    'Verify Telegram notifications work'
  ],
  trigger: 'memory-decay',
  example_output: `🧠 Memory Decay Report — Apr 11 2026\n\n3 files untouched for 30+ days:\n1. memory/2025-11-project-x.md — 47 days stale | 2 accesses | 120 words\n   Suggestion: ARCHIVE — project is inactive\n2. memory/2025-12-ideas.md — 38 days stale | 1 access | 80 words\n   Suggestion: MERGE — small file, can combine with memory/2026-01-ideas.md\n3. memory/2026-01-old-process.md — 32 days stale | 5 accesses | 340 words\n   Suggestion: KEEP — referenced often, update before archiving\n\n1 low-value file:\n1. memory/2025-10-note.md — 22 words, accessed 1x\n   Suggestion: DELETE — single throwaway note`
});

addPrompt({
  title: 'Duplicate Detective',
  slug: 'duplicate-detective',
  category: 'Memory Management',
  description: 'Scans your memory files for near-duplicate entries and proposes merges — keeps your knowledge base clean and avoids fragmented thinking.',
  prompt_text: `Set up an always-on automation that scans your memory files for near-duplicate entries and proposes merges.\n\nCONFIGURATION:\n- memory_dir: ~/.openclaw/memory/\n- similarity_threshold: 0.75 (75% similarity = candidate)\n- output_file: ~/logs/duplicates_report.txt\n\nPROCESS:\n1. List all *.md files in ~/.openclaw/memory/ recursively\n2. For each pair of files (or sections within files):\n   a. Read file content\n   b. Normalize: lowercase, remove punctuation, collapse whitespace\n   c. Calculate simple similarity: Jaccard index of word sets\n   d. Also check for: same header/title, same date prefix, shared key phrases\n3. Flag any pair with similarity > 0.75 as a DUPLICATE_CANDIDATE\n4. For each duplicate candidate:\n   - Identify the PRIMARY (older/more complete) vs DUPLICATE (newer/shorter)\n   - Extract: which paragraphs differ, which are identical\n   - Propose a MERGE recommendation\n5. Write report to output_file\n6. Send Telegram summary if duplicates found\n\nREPORT FORMAT:\n🔍 Duplicate Detective Report — [DATE]\n\nFound {count} duplicate pairs:\n\n[{count}]. [file-A.md] vs [file-B.md]\n    Similarity: {XX%} | Created: {date} vs {date}\n    Overlap: {description of shared content}\n    Recommendation: MERGE into [PRIMARY], delete [DUPLICATE]\n    Merge plan:\n      - Keep: [paragraph from A]\n      - Add from B: [paragraph from B not in A]\n      - Delete: [duplicate paragraphs]\n\nTOOLS: exec, filesystem, cron, message`,
  tools: ['exec', 'filesystem', 'cron', 'message'],
  setup_steps: [
    'Verify memory directory and list current files',
    'Create script: ~/scripts/duplicate_detective.sh',
    'Make executable: chmod +x ~/scripts/duplicate_detective.sh',
    'Add to crontab: "0 10 * * 1" to run every Monday at 10 AM',
    'Test: run manually and review proposed merges',
    'For each merge: manually review before deleting duplicates'
  ],
  trigger: 'duplicates',
  example_output: `🔍 Duplicate Detective Report — Apr 11 2026\n\nFound 2 duplicate pairs:\n\n[1]. memory/2026-03-tasks.md vs memory/TASKS.md\n    Similarity: 82% | Created: Mar 15 vs Mar 20\n    Overlap: Both contain the same project milestones section\n    Recommendation: MERGE into memory/2026-03-tasks.md (older, more complete), archive TASKS.md\n    Merge plan:\n      - Keep: Full project milestones from 2026-03-tasks.md\n      - Add from TASKS.md: [Daily standup notes section not in primary]\n      - Delete: Duplicate project overview paragraphs`
});

addPrompt({
  title: 'Memory Usage Leaderboard',
  slug: 'memory-usage-leaderboard',
  category: 'Memory Management',
  description: 'Ranks which memory files get accessed the most, so you know what is actually useful versus sitting there untouched — guides what to promote to long-term memory.',
  prompt_text: `Set up an always-on automation that tracks how often each memory file is accessed and ranks them by usefulness — so you know what to promote to long-term memory and what to archive.\n\nCONFIGURATION:\n- memory_dir: ~/.openclaw/memory/\n- access_log: ~/.openclaw/memory/access_log.jsonl\n- leaderboard_file: ~/.openclaw/memory/usage_leaderboard.json\n- lookback_days: 30\n\nACCESS LOG FORMAT (one JSON object per line):\n{"timestamp": "ISO8601", "file": "memory/path/file.md", "action": "read", "bytes_read": 1024}\n\nPROCESS:\n1. Ensure access_log.jsonl exists in ~/.openclaw/memory/\n2. Filter access_log to last {lookback_days} days\n3. Group by file: for each unique file, count total accesses and sum bytes_read\n4. Calculate:\n   - access_count: number of times opened\n   - total_bytes: total bytes read\n   - last_accessed: most recent access timestamp\n   - access_rate: accesses per week\n5. Rank files by access_count DESC\n6. Identify:\n   - HOT: top 5 by access count\n   - COLD: bottom 5 by access count (excluding files created in last 7 days)\n   - GROWING: files with access_count increasing week-over-week\n   - DECLINING: files with access_count decreasing week-over-week\n7. Save leaderboard to leaderboard_file\n8. Send Telegram leaderboard digest\n\nDIGEST FORMAT:\n🏆 Memory Leaderboard — Last 30 Days\n\n📈 HOTTEST (Most Accessed):\n  1. memory/todos.md — {count} accesses | avg {X}KB/read\n  2. memory/project-a.md — {count} accesses | avg {X}KB/read\n\n❄️ COLDEST (Least Accessed):\n  1. memory/old-notes.md — {count} accesses — consider archiving\n\n📊 TRENDS:\n  🚀 Growing: memory/quarterly-planning.md (+40% vs last period)\n  📉 Declining: memory/legacy-arch.md (-60% vs last period)\n\n💡 RECOMMENDATIONS:\n- Promote HOT files to long-term memory\n- Archive or delete COLD files not referenced in 30+ days\n\nTOOLS: exec, filesystem, cron, message`,
  tools: ['exec', 'filesystem', 'cron', 'message'],
  setup_steps: [
    'Ensure access_log.jsonl exists: touch ~/.openclaw/memory/access_log.jsonl',
    'Create script: ~/scripts/memory_leaderboard.sh',
    'Make executable: chmod +x ~/scripts/memory_leaderboard.sh',
    'Add to crontab: "0 8 * * *" to run every morning at 8 AM',
    'Instrument your memory reads to log to access_log.jsonl (wrap fs reads with logging)',
    'Test: run manually and review the leaderboard'
  ],
  trigger: 'memory-leaderboard',
  example_output: `🏆 Memory Leaderboard — Last 30 Days\n\n📈 HOTTEST (Most Accessed):\n  1. memory/todos.md — 47 accesses | avg 2.3KB/read\n  2. memory/project-a.md — 31 accesses | avg 8.4KB/read\n  3. memory/people.md — 22 accesses | avg 1.1KB/read\n\n❄️ COLDEST (Least Accessed):\n  1. memory/old-2024-notes.md — 0 accesses — consider archiving\n  2. memory/deprecated-process.md — 1 access — likely stale\n\n📊 TRENDS:\n  🚀 Growing: memory/quarterly-planning.md (+40% vs last period)\n  📉 Declining: memory/legacy-arch.md (-60% vs last period)\n\n💡 RECOMMENDATIONS:\n- Promote memory/project-a.md to long-term memory (consistently hot)\n- Archive memory/old-2024-notes.md (0 references in 30 days)`
});

addPrompt({
  title: 'Onboarding Memory Seeder',
  slug: 'onboarding-memory-seeder',
  category: 'Memory Management',
  description: 'Creates a fresh memory scaffold for a new team member from your existing knowledge base — generates MEMORY.md, PERSONA.md, and key context files automatically.',
  prompt_text: `Take an existing knowledge base and automatically generate a complete onboarding memory scaffold for a new team member — generates all essential memory files from your existing knowledge.\n\nINPUT:\n- Existing memory files: ~/.openclaw/memory/*.md\n- Company/persona files: any existing SOUL.md, IDENTITY.md, USER.md, AGENTS.md\n- Task: Generate a new team member onboarding package\n\nPROCESS:\n1. Scan existing memory files and extract:\n   a. Project context: what projects exist, current status, key files\n   b. People context: who is who, roles, contact patterns\n   c. Process context: recurring workflows, tools used, conventions\n   d. Preferences: coding style, communication preferences, working hours\n2. Generate the following files for the new member:\n\na) ONBOARDING_{name}.md:\n   - Welcome and role overview\n   - Key projects and their current status\n   - Immediate priorities for week 1\n   - Key contacts and their roles\n   - Important quirks/preferences from existing memory\n\nb) CONTEXT_{name}.md:\n   - Company/project background\n   - Relevant history from long-term memory\n   - Active decisions and their rationale\n   - Known issues and ongoing concerns\n\nc) QUICKSTART_{name}.md:\n   - Top 5 things to do in the first week\n   - Key files to read immediately\n   - Whom to talk to first\n   - What to avoid (known gotchas)\n   - Tools setup and access needed\n\n3. Output each file to ~/.openclaw/memory/onboarding/\n4. Print a summary of what was created\n\nOUTPUT FORMAT:\n📋 Onboarding Memory Seeder — [DATE]\n\nGenerated for: [New Member Name]\nRole: [Their Role]\n\nFiles created:\n1. onboarding/ONBOARDING_{name}.md — {XX} words\n2. onboarding/CONTEXT_{name}.md — {XX} words\n3. onboarding/QUICKSTART_{name}.md — {XX} words\n\nKey extracted context:\n- {N} projects identified\n- {N} people identified\n- {N} active processes documented\n\nTOOLS: exec, filesystem, read`,
  tools: ['exec', 'filesystem', 'read'],
  setup_steps: [
    'Ensure your existing memory files are populated in ~/.openclaw/memory/',
    'Have existing SOUL.md, IDENTITY.md, USER.md, AGENTS.md ready',
    'Run with: provide new team member name and role',
    'Model will scan existing knowledge base and generate onboarding files',
    'Review generated files before handing off to new team member',
    'Store in: ~/.openclaw/memory/onboarding/'
  ],
  trigger: 'onboard',
  example_output: `📋 Onboarding Memory Seeder — Apr 11 2026\n\nGenerated for: Sarah (New Developer)\nRole: Full-stack Engineer\n\nFiles created:\n1. onboarding/ONBOARDING_Sarah.md — 520 words\n2. onboarding/CONTEXT_Sarah.md — 380 words\n3. onboarding/QUICKSTART_Sarah.md — 290 words\n\nKey extracted context:\n- 4 projects identified (Decryptica, Renegade Reels, Sniper Bot, Kroger Auto-cart)\n- 3 people identified (Brian as primary stakeholder, Kevin as CEO, various contractors)\n- 7 active processes documented (article publishing, bot management, content pipeline)`
});

fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
console.log('Batch 3 done. Total prompts:', data.prompts.length);
