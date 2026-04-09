import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '../../data/prompts/prompts.db');

const db = new Database(DB_PATH);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS prompts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    prompt_text TEXT NOT NULL,
    tools TEXT NOT NULL, -- JSON array
    setup_steps TEXT NOT NULL, -- JSON array
    trigger TEXT NOT NULL,
    alert TEXT NOT NULL,
    example_output TEXT NOT NULL,
    description TEXT NOT NULL,
    is_staff_pick INTEGER DEFAULT 0,
    vote_count INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prompt_id INTEGER NOT NULL,
    voter_ip TEXT NOT NULL,
    created_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (prompt_id) REFERENCES prompts(id),
    UNIQUE(prompt_id, voter_ip)
  );

  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    prompt_text TEXT NOT NULL,
    tools TEXT NOT NULL,
    setup_steps TEXT NOT NULL,
    trigger TEXT NOT NULL,
    alert TEXT NOT NULL,
    description TEXT NOT NULL,
    submitter_ip TEXT,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    submitted_at INTEGER DEFAULT (unixepoch()),
    reviewed_at INTEGER,
    reviewed_by TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_prompts_slug ON prompts(slug);
  CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts(category);
  CREATE INDEX IF NOT EXISTS idx_prompts_votes ON prompts(vote_count DESC);
  CREATE INDEX IF NOT EXISTS idx_prompts_staff ON prompts(is_staff_pick);
  CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
`);

// Seed prompts
const prompts = [
  {
    slug: 'nightly-memory-consolidation',
    title: 'Nightly Memory Consolidation',
    category: 'Memory Management',
    description: 'Set up an always-on automation that runs every night at 3 AM to consolidate daily memory files into long-term storage. Finds all daily memory files from the past 24 hours, merges unique entries into your main long-term memory file, deduplicates by content match, and logs the results. Alerts you via Telegram when complete.',
    prompt_text: `Set up an always-on automation that runs every night at 3 AM to consolidate daily memory files into long-term storage.

OBJECTIVE: Find all daily memory files created in the past 24 hours, read their contents, merge unique entries into the main long-term memory file, deduplicate by exact content match, and log the results.

DIRECTORIES:
- Daily memories: memory/daily/*.md
- Main long-term memory: memory/longterm.md
- Log file: memory/consolidation.log

PROCESS:
1. List all files in memory/daily/ modified in the last 24 hours using exec with 'find memory/daily/ -type f -mtime -1'
2. Read each daily file using filesystem
3. Load existing longterm.md
4. For each entry in daily files, check if it already exists in longterm.md (by exact content match)
5. Append only new unique entries to longterm.md
6. Archive processed daily files to memory/archive/YYYY-MM-DD.bak
7. Write consolidation summary to memory/consolidation.log

OUTPUT: A consolidation report: timestamp, files processed, entries examined, new entries added, duplicates skipped, any errors.

TOOLS: exec, cron, filesystem

ALERT: After each run, send a brief Telegram message: 'Memory consolidation complete: X new entries merged, Y duplicates skipped.'`,
    tools: JSON.stringify(['exec', 'cron', 'filesystem', 'message']),
    setup_steps: JSON.stringify([
      'Create directories: memory/daily, memory/archive, memory/',
      'Create longterm.md with header: "# Long-term Memory" if it doesn\'t exist',
      'Create an empty consolidation.log file',
      'Add to crontab: "0 3 * * *" pointing to the consolidation script',
      'Test by running with sample daily files first',
      'Verify log rotation for consolidation.log'
    ]),
    trigger: 'Every night at 3:00 AM (0 3 * * *)',
    alert: 'Telegram: "Memory consolidation complete: X new entries merged, Y duplicates skipped."',
    example_output: `=== Consolidation 2026-04-08 ===
Files: 2 processed
Entries: 34 examined
Added: 12 new
Skipped: 22 duplicates
Next run: 2026-04-09 03:00`,
    is_staff_pick: 1
  },
  {
    slug: 'heartbeat-monitor',
    title: 'Heartbeat Monitor',
    category: 'Monitoring & Health Checks',
    description: 'Set up an always-on automation that pings a configurable list of service URLs every 5 minutes and immediately alerts you via Telegram when any service goes down. Logs all results with timestamps. Handles timeouts, DNS failures, and SSL errors as failures.',
    prompt_text: `Set up an always-on automation that pings a configurable list of service URLs every 5 minutes and alerts you immediately when any service goes down.

CONFIGURATION:
- services.txt: one URL per line (e.g., https://api.yoursite.com/health)
- log file: ~/logs/heartbeat.log

PROCESS:
1. Read all URLs from services.txt
2. For each URL, run: curl -s -o /dev/null -w '%{http_code}' -L --max-time 10 [URL]
3. Log each result with timestamp to heartbeat.log: '[TIME] | [URL] | [STATUS] | [RESPONSE_MS]ms'
4. If status != 200, immediately send Telegram alert via message tool

ALERT FORMAT:
"🚨 Service Down: [URL] returned [STATUS] at [TIME]
Response time: [X]ms"

TOOLS: exec, cron, filesystem, message

The script must handle connection timeouts (status 000), DNS failures, and SSL errors as failures.`,
    tools: JSON.stringify(['exec', 'cron', 'filesystem', 'message']),
    setup_steps: JSON.stringify([
      'Create services.txt with one URL per line',
      'Create script: ~/scripts/heartbeat.sh that loops through services.txt',
      'Make script executable: chmod +x ~/scripts/heartbeat.sh',
      'Add to crontab: "*/5 * * * *" ~/scripts/heartbeat.sh',
      'Test manually: run script and verify log output',
      'Verify Telegram bot is configured in OpenClaw message tool'
    ]),
    trigger: 'Every 5 minutes (*/5 * * * *)',
    alert: 'Telegram: "🚨 Service Down: [URL] returned [STATUS] at [TIME]. Response time: [X]ms"',
    example_output: `14:30:01 | https://api.example.com | 200 | 45ms | OK
14:30:01 | https://db.example.com | 200 | 23ms | OK
14:30:02 | https://backup.example.com | 000 | 0ms | TIMEOUT
[TG ALERT] 🚨 Service Down: https://backup.example.com returned 000 at 14:30:02`,
    is_staff_pick: 1
  },
  {
    slug: 'daily-channel-digest',
    title: 'Daily Channel Digest',
    category: 'Communication & Summarization',
    description: 'Set up an always-on automation that runs every morning at 8 AM, retrieves the previous 24 hours of messages from your Slack or Discord channel, summarizes key discussions and action items, and sends a digest to your Telegram.',
    prompt_text: `Set up an always-on automation that runs every morning at 8 AM, retrieves the previous 24 hours of messages from your configured Slack or Discord channel, summarizes the key discussions, decisions, and action items, and sends a digest to your Telegram.

PROCESS:
1. Use sessions_list to identify active messaging sessions
2. Use sessions_history to fetch messages from the target channel for the last 24 hours
3. Identify: key topics discussed, decisions made, action items assigned, unanswered questions
4. Format as a clean digest: sectioned by topic, bullet points, owner assigned where visible
5. Send digest to Telegram via message tool

TOOLS: sessions_list, sessions_history, message, cron`,
    tools: JSON.stringify(['sessions_list', 'sessions_history', 'message', 'cron']),
    setup_steps: JSON.stringify([
      'Configure your Slack/Discord channel bindings in OpenClaw',
      'Identify the session key for the channel you want to digest',
      'Create a script that fetches 24h of history and formats the digest',
      'Set cron: "0 8 * * *" to run the digest script each morning',
      'Test with --dry-run first to verify correct channel and output format',
      'Verify Telegram bot can send to your chat ID'
    ]),
    trigger: 'Every morning at 8:00 AM (0 8 * * *)',
    alert: 'Telegram digest sent automatically. No alert on failure — digest itself is the signal.',
    example_output: `📊 Channel Digest - Apr 8 2026

🗣️ Top Topics:
- Deploy pipeline: Team discussed moving to canary deployments. Decision deferred to next meeting.
- API rate limits: Engineering flagged customer X hitting 10x quota.

✅ Decisions Made:
- Ship v2.4 by Friday
- Switch to Postgres 16 for all new instances

📋 Action Items:
- Set up canary monitoring → @alice (by Thu)
- Draft rate limit policy → @bob (by Wed)`,
    is_staff_pick: 1
  },
  {
    slug: 'disk-space-alert-system',
    title: 'Disk Space Alert System',
    category: 'Monitoring & Operations',
    description: 'Set up an always-on automation that checks disk usage on all mounted volumes every 10 minutes and alerts you via Telegram when any volume exceeds 85% capacity. Logs all readings. Critical alerts at 90%.',
    prompt_text: `Set up an always-on automation that checks disk usage on all mounted volumes every 10 minutes and alerts you via Telegram when any volume exceeds 85% capacity.

PROCESS:
1. Run: df -h (excluding tmpfs/snap/virtual filesystems)
2. Parse output to extract: filesystem, total size, used space, usage percentage
3. For each volume, check if usage % > 85
4. Log all readings to ~/logs/disk_usage.log with timestamp
5. If any volume > 85%, immediately send Telegram alert

ALERT FORMAT:
"💾 Disk Alert: [VOLUME] at [USAGE]%
Total: [SIZE] | Used: [USED] | Available: [AVAIL]
Time: [TIMESTAMP]"

For volumes > 90%: escalate with '🔴 CRITICAL' prefix.

TOOLS: exec, cron, filesystem, message`,
    tools: JSON.stringify(['exec', 'cron', 'filesystem', 'message']),
    setup_steps: JSON.stringify([
      'Create log directory: mkdir -p ~/logs',
      'Create script: ~/scripts/disk_check.sh that runs df -h and parses output',
      'Make executable: chmod +x ~/scripts/disk_check.sh',
      'Add to crontab: "*/10 * * * *" ~/scripts/disk_check.sh',
      'Test manually: run script and check log file output',
      'Verify Telegram bot is working before enabling alert mode'
    ]),
    trigger: 'Every 10 minutes (*/10 * * * *)',
    alert: 'Telegram: "💾 Disk Alert: /dev/disk1s1 at 87%. Total: 1TB | Used: 912GB | Available: 88GB. Time: 14:40:02"',
    example_output: `14:40:01 | /dev/disk1s1 | 67% | 912GB/1TB | OK
14:40:01 | /dev/disk1s2 | 91% | 455GB/500GB | 🔴 CRITICAL
[TG ALERT] 💾 Disk Alert: /dev/disk1s2 at 91%. Available: 45GB`,
    is_staff_pick: 0
  },
  {
    slug: 'session-health-monitor',
    title: 'Session Health Monitor',
    category: 'Monitoring & Operations',
    description: 'Set up an always-on automation that checks the health of all OpenClaw sessions every 15 minutes, identifies stale or unresponsive sessions, recovers or archives them, and sends you a Telegram digest of what was found.',
    prompt_text: `Set up an always-on automation that checks the health of all OpenClaw sessions every 15 minutes, identifies stale or unresponsive sessions, and either recovers or archives them.

PROCESS:
1. Use sessions_list to retrieve all active sessions with their last activity timestamps
2. For each session, determine if last activity > 30 minutes ago
3. For sessions inactive > 30 min: use sessions_send with a lightweight echo to test responsiveness
4. If no response within 10 seconds: mark as stale
5. For stale sessions: log to ~/logs/stale_sessions.log
6. Archive stale sessions using exec to remove their session files from ~/.openclaw/sessions/
7. Send a summary digest to Telegram

THRESHOLD: 30 minutes of inactivity = stale

TOOLS: sessions_list, sessions_send, exec, filesystem, message, cron`,
    tools: JSON.stringify(['sessions_list', 'sessions_send', 'exec', 'filesystem', 'message', 'cron']),
    setup_steps: JSON.stringify([
      'Verify sessions_list returns all expected sessions',
      'Create ~/logs/ directory for session logs',
      'Create script: ~/scripts/session_health.sh following the PROCESS above',
      'Make executable: chmod +x ~/scripts/session_health.sh',
      'Add to crontab: "*/15 * * * *" ~/scripts/session_health.sh',
      'Test manually with --dry-run first to verify correct session paths',
      'Set up Telegram bot for alert delivery'
    ]),
    trigger: 'Every 15 minutes (*/15 * * * *)',
    alert: 'Telegram digest: "🔍 Session Health - 14:45. Active: 5 | Stale: 2 (archived) | Unresponsive: 0"',
    example_output: `=== Session Health 14:45:01 ===
Active sessions:
  agent:main:session-abc123 (active 2m ago) ✓
  agent:main:session-def456 (active 8m ago) ✓
Stale sessions:
  agent:main:session-xyz789 (inactive 47m) → archived
[TG DIGEST] 2 stale sessions archived. No unresponsive sessions.`,
    is_staff_pick: 0
  },
  {
    slug: 'automated-git-commit-watcher',
    title: 'Automated Git Commit Watcher',
    category: 'Coding & Automation',
    description: 'Set up an always-on automation that watches a specific directory for file changes every 10 minutes and automatically commits any uncommitted changes to git with a timestamped commit message listing exactly which files changed. Never auto-commits to main.',
    prompt_text: `Set up an always-on automation that watches a specific directory (e.g., ~/projects/myapp) for file changes every 10 minutes, and automatically commits any uncommitted changes to git with a timestamped commit message listing exactly which files changed.

PROCESS:
1. Run: cd ~/projects/myapp && git status --porcelain to get list of changed files
2. If no changes: exit silently
3. If changes exist:
   a. git add -A
   b. git commit -m '[AUTOMATED] Updates $(date +%Y-%m-%d_%H:%M): Changed files: [file1], [file2], ...'
   c. git push origin [current-branch]
4. Log commit details to ~/logs/git_auto_commit.log
5. Send Telegram confirmation with file list

EXCLUDE PATTERNS:
- node_modules/
- .git/
- *.log
- .env
- build/dist/ directories

BRANCH HANDLING: Only commit to development or feature branches. Never auto-commit to main/master.

TOOLS: exec, cron, filesystem, message`,
    tools: JSON.stringify(['exec', 'cron', 'filesystem', 'message']),
    setup_steps: JSON.stringify([
      'Navigate to ~/projects/myapp and verify git repo is initialized',
      'Create .gitignore with EXCLUDE PATTERNS above',
      'Create script: ~/scripts/git_watcher.sh following the PROCESS above',
      'Make executable: chmod +x ~/scripts/git_watcher.sh',
      'Add to crontab: "*/10 * * * *" ~/scripts/git_watcher.sh',
      'Test manually: make a change, run script, verify commit appears in git log',
      'Verify Telegram bot is configured for commit notifications'
    ]),
    trigger: 'Every 10 minutes (*/10 * * * *)',
    alert: 'Telegram: "✅ Auto-commit: 3 files changed and pushed to dev. Files: src/index.js, src/utils.js, package.json"',
    example_output: `=== Git Watcher 14:50:01 ===
Changes detected:
  M src/index.js
  M src/utils.js
  A tests/new_test.js
Commit: [AUTOMATED] Updates 2026-04-08_14:50: Changed files: src/index.js, src/utils.js, tests/new_test.js
Branch: development
Pushed: origin/development
[TG] ✅ Auto-commit: 3 files pushed to dev`,
    is_staff_pick: 0
  },
  {
    slug: 'nightly-backup-automation',
    title: 'Nightly Backup Automation',
    category: 'Monitoring & Operations',
    description: 'Set up an always-on automation that runs every night at 2 AM, creates a compressed timestamped backup of your critical directories (workspace, memory, config, scripts), stores it locally, verifies with checksum, and sends you a confirmation via Telegram. Auto-deletes backups older than 30 days.',
    prompt_text: `Set up an always-on automation that runs every night at 2 AM, creates a compressed timestamped backup of your critical directories, stores it locally with a dated filename, and sends you a confirmation when complete.

DIRECTORIES TO BACKUP:
- ~/.openclaw/workspace/
- ~/.openclaw/memory/
- ~/.openclaw/config/
- ~/scripts/

PROCESS:
1. Create backup directory: ~/backups/
2. Create filename: backup_YYYY-MM-DD.tar.gz
3. Run: tar -czf ~/backups/backup_YYYY-MM-DD.tar.gz [directories above]
4. Verify backup with: tar -tzf filename.tar.gz | wc -l (confirm file count)
5. Calculate checksum: shasum -a 256 filename.tar.gz
6. Log backup details to ~/logs/backups.log
7. Send Telegram confirmation with backup size, file count, and checksum

RETENTION: Delete backups older than 30 days automatically.

TOOLS: exec, cron, filesystem, message`,
    tools: JSON.stringify(['exec', 'cron', 'filesystem', 'message']),
    setup_steps: JSON.stringify([
      'Create ~/backups/ directory',
      'Create ~/logs/ directory if not exists',
      'Create script: ~/scripts/nightly_backup.sh following the PROCESS above',
      'Make executable: chmod +x ~/scripts/nightly_backup.sh',
      'Test manually: run script, verify backup file in ~/backups/',
      'Add to crontab: "0 2 * * *" ~/scripts/nightly_backup.sh',
      'Verify Telegram notifications are working'
    ]),
    trigger: 'Every night at 2:00 AM (0 2 * * *)',
    alert: 'Telegram: "✅ Backup complete: backup_2026-04-08.tar.gz | Size: 234MB | Files: 1,847 | SHA256: a3f8..."',
    example_output: `=== Nightly Backup 02:00:15 ===
Directories: workspace, memory, config, scripts
Backup: ~/backups/backup_2026-04-08.tar.gz
Size: 234MB
Files archived: 1,847
Checksum: a3f8d2c9...
Retention: 2 old backups purged
[TG] ✅ Backup complete: backup_2026-04-08.tar.gz (234MB, 1,847 files)`,
    is_staff_pick: 0
  },
  {
    slug: 'openclaw-access-counter',
    title: 'OpenClaw Access Counter',
    category: 'Memory Management',
    description: 'Set up an always-on automation that tracks how often each of your memory files is accessed. Every read gets logged. Runs a daily analysis that identifies your most-accessed and never-accessed files, so you know what to promote to long-term memory and what to archive. Results sent to Telegram.',
    prompt_text: `Set up an always-on automation that tracks how often each of your memory files is accessed. Every time a memory file is read, append an entry to an access log. Run a daily analysis that identifies your most-accessed and never-accessed files, so you can decide what to promote to long-term memory and what to archive.

LOG FORMAT (access_log.jsonl):
{"timestamp": "ISO8601", "file": "memory/path/to/file.md", "action": "read", "access_count": 1}

PROCESS:
1. Create access_log.jsonl in memory/ directory
2. Create a tracking wrapper script that: reads target memory file, increments access count for that file in access_log.jsonl, returns content
3. For each read operation on memory files, use the wrapper instead of direct filesystem reads
4. Daily at midnight: run analysis on access_log.jsonl
5. Generate report: files accessed >10 times this week (hot), files accessed 0 times in 30 days (cold)
6. Send report to Telegram

ANALYSIS:
- Hot files (>10 accesses): promote to long-term memory
- Cold files (0 accesses in 30 days): consider archiving

TOOLS: exec, filesystem, cron, message`,
    tools: JSON.stringify(['exec', 'filesystem', 'cron', 'message']),
    setup_steps: JSON.stringify([
      'Create memory/access_log.jsonl with header: {"access_log": []}',
      'Create tracking script: ~/scripts/memory_tracker.sh',
      'Update relevant memory read operations to use the tracker wrapper',
      'Create analysis script: ~/scripts/memory_stats.sh for midnight analysis',
      'Add to crontab: "0 0 * * *" for daily analysis',
      'Test by manually triggering analysis and checking output',
      'Verify Telegram bot receives the daily report'
    ]),
    trigger: 'Daily at midnight for analysis (0 0 * * *). Access logging runs continuously on every memory read.',
    alert: 'Telegram: "📊 Memory Stats - Apr 8: Hot (12 files): memory/project-a.md (47 reads)... Cold (5 files): memory/old-notes.md (0 reads/30d)"',
    example_output: `=== Memory Access Stats - Apr 8 ===
HOT (most accessed this week):
  memory/project-a.md: 47 reads
  memory/todos.md: 31 reads
  memory/contacts.md: 22 reads

COLD (not accessed in 30 days):
  memory/old-ideas-2025.md: 0 reads
  memory/archived-notes.md: 0 reads

Recommendation: Archive cold files. Promote hot files to long-term memory.`,
    is_staff_pick: 0
  }
];

// Insert prompts
const insertStmt = db.prepare(`
  INSERT OR REPLACE INTO prompts (slug, title, category, description, prompt_text, tools, setup_steps, trigger, alert, example_output, is_staff_pick, vote_count, created_at, updated_at)
  VALUES (@slug, @title, @category, @description, @prompt_text, @tools, @setup_steps, @trigger, @alert, @example_output, @is_staff_pick, 0, unixepoch(), unixepoch())
`);

for (const prompt of prompts) {
  insertStmt.run(prompt);
}

console.log(`Seeded ${prompts.length} prompts into ${DB_PATH}`);
console.log('Prompt slugs:', prompts.map(p => p.slug).join(', '));
