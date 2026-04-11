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

// Coding & Automation
addPrompt({
  title: 'Dependency Sentinel',
  slug: 'dependency-sentinel',
  category: 'Coding & Automation',
  description: 'Watches a GitHub repo for outdated packages (npm/pip), opens a PR with the updates automatically — keeps dependencies fresh without manual work.',
  prompt_text: 'Set up an always-on automation that watches a repository for outdated packages (npm/pip) and opens a PR with the updates automatically.\n\nCONFIGURATION:\nCreate ~/configs/dependency_sentinel.json:\n{\n  "repos": [\n    {"path": "/path/to/repo", "type": "npm", "branch": "main"},\n    {"path": "/path/to/python-repo", "type": "pip", "branch": "main"}\n  ],\n  "auto_open_pr": true\n}\n\nPROCESS:\n1. For each repo in config:\n   a. If type == npm: run npm outdated --json > npm_outdated.json\n   b. If type == pip: run pip list --outdated --format=json\n2. Parse output to extract package name, current version, wanted version, latest version\n3. For each outdated package: run npm update or pip install --upgrade\n4. If auto_open_pr: commit to a new branch feat/update-dependencies and open PR\n5. Create PR body with table of updates\n6. Send Telegram summary\n\nALERT FORMAT:\n📦 Dependency Sentinel — [REPO]\nUpdated [N] packages:\n- pkg-a: 1.0.0 → 1.1.0 (moderate)\nPR: [link]',
  tools: ['exec', 'filesystem', 'gh', 'message', 'cron'],
  setup_steps: [
    'Create ~/configs/dependency_sentinel.json with repo paths and package manager types',
    'Ensure gh CLI is authenticated: gh auth status',
    'Create script: ~/scripts/dependency_sentinel.sh',
    'Add to crontab: "0 10 * * 1" to check every Monday',
    'Test manually first, review PRs before merging'
  ],
  trigger: 'dependency-sentinel',
  example_output: '📦 Dependency Sentinel — decryptica\n\nUpdated 4 packages:\n- next: 14.0.0 → 14.2.0\n- react: 18.2.0 → 18.3.0\n\nPR: https://github.com/kevinthelobster/decryptica/pull/247 — Open'
});

addPrompt({
  title: 'README Auto-Generator',
  slug: 'readme-auto-generator',
  category: 'Coding & Automation',
  description: 'Scans a project, reads the code, spits out a clean README with setup instructions, feature list, and architecture overview.',
  prompt_text: 'Set up a one-shot automation that scans a project, reads the code, and generates a clean README.\n\nINPUT:\n- project_path: /path/to/project (e.g., ~/decryptica)\n\nPROCESS:\n1. Scan project structure: find files, list directories, detect project type (npm/Python/Go)\n2. Read key files: entry points, config files, test files\n3. Detect features from function names, route definitions, API endpoints\n4. Generate README sections:\n   a. Project name and one-line description\n   b. Features list (auto-detected from code)\n   c. Architecture (folder structure and main components)\n   d. Setup (installation, env vars, how to run)\n   e. Tech Stack (detected libraries from package.json or imports)\n   f. API Reference (auto-detect API routes)\n5. Output to [project_path]/README_GENERATED.md\n\nTOOLS: exec, filesystem, read',
  tools: ['exec', 'filesystem', 'read'],
  setup_steps: [
    'Provide the project path to scan',
    'Model will read key files and detect project type',
    'Review the generated README_GENERATED.md before replacing README.md',
    'Copy to README.md: mv README_GENERATED.md README.md'
  ],
  trigger: 'readme-gen',
  example_output: 'README Auto-Generator — Apr 11 2026\n\nProject: ~/decryptica\nType: Next.js (Node.js)\n\nGenerated sections: overview, 14 features detected, architecture, setup instructions, tech stack\nOutput: ~/decryptica/README_GENERATED.md'
});

addPrompt({
  title: 'Scheduled Script Runner',
  slug: 'scheduled-script-runner',
  category: 'Coding & Automation',
  description: 'Runs any custom script on a cron schedule, logs output, and alerts if the script fails.',
  prompt_text: 'Set up a reliable scheduled script runner: runs any custom script on a cron schedule, logs all output, and alerts via Telegram if the script fails.\n\nCONFIGURATION:\nCreate ~/configs/script_runner.json:\n{\n  "jobs": [\n    {\n      "name": "daily-article-generator",\n      "script": "/path/to/generate_article.sh",\n      "schedule": "0 6 * * *",\n      "description": "Generates one SEO article",\n      "timeout_minutes": 10\n    }\n  ],\n  "log_dir": "~/logs/script_runner"\n}\n\nPROCESS:\n1. Read jobs from config\n2. For each job:\n   a. Create log file: ~/logs/script_runner/[job_name]_YYYY-MM-DD.log\n   b. Run: timeout [minutes]m [script] >> [log] 2>&1\n   c. Capture exit code\n   d. If exit code != 0 OR timeout: send Telegram alert with error summary\n3. Alert if a job has not run for 2x its schedule interval\n\nALERT FORMAT:\n⚠️ Script Failed — [JOB_NAME]\nExit code: [X] (timeout: YES/NO)\nLast 20 lines of log:\n[log excerpt]\n💡 Check: [script_path]',
  tools: ['exec', 'filesystem', 'cron', 'message'],
  setup_steps: [
    'Create ~/configs/script_runner.json with jobs, scripts, and cron schedules',
    'Ensure all scripts are executable: chmod +x [script_path]',
    'Create log directory: mkdir -p ~/logs/script_runner',
    'Create wrapper script: ~/scripts/script_runner_wrapper.sh',
    'Add to crontab: * * * * * ~/scripts/script_runner_wrapper.sh (runs every minute)',
    'Test manually and verify log files'
  ],
  trigger: 'script-runner',
  example_output: '⚠️ Script Failed — daily-article-generator\n\n🔴 Exit code: 124 (timeout: YES — 10min limit)\nScript: /Users/kevinsimac/decryptica/scripts/generate_article.sh\nSchedule: 0 6 * * *\n\nLast 20 lines:\n[06:00:01] Starting article generation...\n[06:05:00] MiniMax API responding slowly...\n[06:10:00] TIMEOUT — process killed\n\n💡 Check: MiniMax API may be rate-limited.'
});

addPrompt({
  title: 'Codebase Q&A Bot',
  slug: 'codebase-qa-bot',
  category: 'Coding & Automation',
  description: 'Ask it anything about a codebase and it reads the files and answers — no hallucinating, grounded in actual code.',
  prompt_text: 'Answer questions about a codebase accurately by reading the actual files.\n\nINPUT:\n- project_path: /path/to/project (e.g., ~/decryptica)\n- question: user question about the codebase\n\nPROCESS:\n1. Identify relevant files using find and grep\n2. Read the actual files using read tool\n3. Answer with: specific file paths and line numbers, direct quotes from code\n4. If the question cannot be answered: say "I could not find this in the codebase"\n5. Include a code snippet (max 20 lines) to support the answer\n\nRULES:\n- NEVER make up function names, file paths, or line numbers\n- NEVER describe code that is not in the files you read\n- If unsure: say "I am not certain"\n\nANSWER FORMAT:\n## Answer\n[Direct answer]\n\n## Evidence\nFile: [path]:[line]\n[code snippet]\n\n## Confidence\n[High/Medium/Low]',
  tools: ['exec', 'filesystem', 'read'],
  setup_steps: [
    'Provide the project path and your question',
    'Model will search the actual codebase files',
    'Answers are grounded in real code — not hallucinated',
    'Best for: understanding existing code, debugging, architecture questions'
  ],
  trigger: 'code-qa',
  example_output: '## Answer\nThe authentication flow uses JWT tokens stored in httpOnly cookies. Tokens are verified in middleware.ts on every API route.\n\n## Evidence\nFile: app/middleware.ts:12-28\n[typescript snippet showing token verification]\n\n## Confidence\nHigh — found direct evidence in middleware.ts'
});

fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
console.log('Batch 5 done. Total prompts:', data.prompts.length);
