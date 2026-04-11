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

// ─── MONITORING & HEALTH CHECKS ────────────────────────────────────────────

addPrompt({
  title: 'Cron Watchdog',
  slug: 'cron-watchdog',
  category: 'Monitoring & Health Checks',
  description: 'Checks system cron logs every 15 minutes, alerts immediately if a scheduled job missed or errored out — keeps your automation reliable.',
  prompt_text: `Set up an always-on automation that checks system cron logs every 15 minutes and alerts immediately if a scheduled job missed or errored out.\n\nCONFIGURATION:\n- log_file: ~/logs/cron_watchdog.log\n- alert_threshold: 1 (alert on first error)\n- known_jobs: list of expected cron job identifiers\n\nPROCESS:\n1. Run: grep -i "error\\|failed\\|missed\\|no crontab" /var/log/syslog 2>/dev/null OR grep -r "ERROR\\|FAILED" ~/logs/*.log 2>/dev/null\n2. Also check: crontab -l to list active jobs, compare against known_jobs\n3. For each error found:\n   a. Extract: timestamp, job name, error message\n   b. Classify severity: WARNING (non-critical) vs ERROR (job failed) vs MISSED (job did not run)\n4. Log all findings to ~/logs/cron_watchdog.log with timestamp\n5. If any ERROR or MISSED found:\n   a. Send Telegram alert immediately\n   b. Include: job name, error message, timestamp, suggested fix\n\nALERT FORMAT:\n🐕 Cron Watchdog Alert — [TIMESTAMP]\n\n🚨 Job Failed: [job_name]\nCommand: [cron command]\nError: [error message]\nLast run: [timestamp]\n\n💡 Fix: [suggested action]\n\n✅ OK jobs: [list of jobs that ran successfully]\n\nTOOLS: exec, cron, filesystem, message`,
  tools: ['exec', 'cron', 'filesystem', 'message'],
  setup_steps: [
    'Create ~/logs/ directory if not exists',
    'Verify cron is running: ps aux | grep cron',
    'Create script: ~/scripts/cron_watchdog.sh',
    'Make executable: chmod +x ~/scripts/cron_watchdog.sh',
    'Add to crontab: "*/15 * * * *" ~/scripts/cron_watchdog.sh',
    'Test: intentionally break a cron job, verify alert fires within 15 minutes'
  ],
  trigger: 'cron-watchdog',
  example_output: `🐕 Cron Watchdog Alert — Apr 11 2026 14:00 UTC\n\n🚨 Job Failed: nightly-backup\nCommand: ~/scripts/nightly_backup.sh\nError: disk quota exceeded: no space left on device\nLast run: Apr 11 02:00 UTC\n\n💡 Fix: Delete backups older than 30 days: find ~/backups -mtime +30 -delete\n\n✅ OK jobs (last 15min): heartbeat-monitor, memory-consolidation, sentiment-tracker`
});

addPrompt({
  title: 'SSL Expiry Tracker',
  slug: 'ssl-expiry-tracker',
  category: 'Monitoring & Health Checks',
  description: 'Monitors SSL certificate expiration dates across all your domains, pings you 30 days, 7 days, and 1 day before expiry — no more surprise certificate outages.',
  prompt_text: `Set up an always-on automation that monitors SSL certificate expiration dates across all your domains and alerts you 30 days, 7 days, and 1 day before expiry.\n\nCONFIGURATION:\nCreate ~/configs/ssl_domains.json:\n{\n  "domains": [\n    {"name": "decryptica.com", "port": 443},\n    {"name": "api.decryptica.com", "port": 443}\n  ],\n  "alert_days": [30, 7, 1],\n  "state_file": "~/.openclaw/ssl_state.json"\n}\n\nPROCESS:\n1. Load domains from config\n2. For each domain:\n   a. Run: openssl s_client -connect DOMAIN:PORT -servername DOMAIN 2>/dev/null | openssl x509 -noout -dates 2>/dev/null\n   b. Extract: notBefore (issue date), notAfter (expiry date)\n   c. Calculate: days_until_expiry = (notAfter - now) / 86400\n3. Load state_file\n4. For each domain:\n   - If days_until_expiry in [30, 7, 1]: and not yet alerted at this threshold → trigger alert\n   - Update state_file with latest check timestamp and expiry dates\n5. If days_until_expiry <= 0: CRITICAL — certificate has expired\n6. Send appropriate Telegram alert\n\nALERT FORMAT (30/7 day warning):\n🔒 SSL Expiry Warning — [DOMAIN]\n\n⚠️ Certificate for [DOMAIN] expires in [X] days\nExpires: [YYYY-MM-DD HH:MM UTC]\nIssued: [YYYY-MM-DD]\n\n💡 Action: Renew certificate before [date]\n\nALERT FORMAT (1 day / CRITICAL):\n🔒🔒 CRITICAL: SSL Certificate EXPIRED — [DOMAIN]\n\nCertificate expired [X] days ago!\nRenew immediately to restore HTTPS.\n\nTOOLS: exec, filesystem, cron, message`,
  tools: ['exec', 'filesystem', 'cron', 'message'],
  setup_steps: [
    'Create ~/configs/ssl_domains.json with your domains and ports',
    'Test manually: openssl s_client -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates',
    'Create script: ~/scripts/ssl_expiry.sh',
    'Make executable: chmod +x ~/scripts/ssl_expiry.sh',
    'Add to crontab: "0 9 * * *" to check every morning at 9 AM',
    'Verify Telegram bot is configured'
  ],
  trigger: 'ssl-tracker',
  example_output: `🔒 SSL Expiry Warning — decryptica.com\n\n⚠️ Certificate for decryptica.com expires in 7 days\nExpires: 2026-04-18 23:59 UTC\nIssued: 2026-01-18\n\n💡 Action: Renew certificate before Apr 18 to avoid outage`
});

addPrompt({
  title: 'API Latency Monitor',
  slug: 'api-latency-monitor',
  category: 'Monitoring & Health Checks',
  description: 'Polls a list of API endpoints every 5 minutes, tracks latency over time, and alerts when performance degrades below your threshold.',
  prompt_text: `Set up an always-on automation that polls a list of API endpoints every 5 minutes, tracks latency over time, and alerts when performance degrades.\n\nCONFIGURATION:\nCreate ~/configs/api_endpoints.json:\n{\n  "endpoints": [\n    {"name": "Decryptica API", "url": "https://decryptica.com/api/health", "timeout_ms": 5000},\n    {"name": "Helius RPC", "url": "https://mainnet.helius-rpc.com", "timeout_ms": 3000}\n  ],\n  "latency_threshold_ms": 2000,\n  "history_file": "~/.openclaw/api_latency.json"\n}\n\nLATENCY HISTORY FORMAT:\n{\n  "decryptica.com_api": {\n    "checks": [\n      {"timestamp": 1744156800, "latency_ms": 145, "status": 200},\n      {"timestamp": 1744157100, "latency_ms": 1890, "status": 200},\n      {"timestamp": 1744157400, "latency_ms": 5000, "status": 503}\n    ],\n    "p95_latency_1h": 480,\n    "alert_sent_today": false\n  }\n}\n\nPROCESS:\n1. Load endpoints from config and history from history_file\n2. For each endpoint:\n   a. Run: curl -o /dev/null -s -w "latency_ms:%{time_total} http_code:%{http_code}" [URL]\n   b. Record: timestamp, latency_ms, http_status\n   c. Append to checks[] array in history (keep last 1000 entries)\n3. Calculate:\n   - p50, p95, p99 latency from last 1 hour\n   - Error rate: % of non-200 responses in last hour\n   - Trend: p95_latency_1h vs p95_latency_previous_hour\n4. Check thresholds:\n   - If any latency > threshold_ms AND alert_sent_today == false → ALERT\n   - If error rate > 5% → ALERT\n   - If p95 degraded > 50% vs previous hour → DEGRADATION ALERT\n5. Send Telegram alert\n6. Update state and reset alert_sent_today at midnight\n\nALERT FORMAT:\n📉 API Latency Alert — [ENDPOINT_NAME]\n\n🔴 Current latency: [X]ms (threshold: [Y]ms)\n📊 p95 (1h): [X]ms | p99 (1h): [X]ms\n⚠️ Error rate: [X]% (5xx count: [N])\n📉 Trend: p95 +[X]% vs last hour\n\n💡 Check: [endpoint] may be overloaded or experiencing issues.\n\nTOOLS: exec, filesystem, cron, message`,
  tools: ['exec', 'filesystem', 'cron', 'message'],
  setup_steps: [
    'Create ~/configs/api_endpoints.json with your endpoints, names, and timeout thresholds',
    'Test manually: curl each endpoint and verify you get latency and status codes',
    'Create script: ~/scripts/api_latency.sh',
    'Make executable: chmod +x ~/scripts/api_latency.sh',
    'Add to crontab: "*/5 * * * *" ~/scripts/api_latency.sh',
    'Test degradation alert: artificially slow an endpoint and verify alert fires within 10 minutes'
  ],
  trigger: 'api-latency',
  example_output: `📉 API Latency Alert — Helius RPC\n\n🔴 Current latency: 4890ms (threshold: 3000ms)\n📊 p95 (1h): 3200ms | p99 (1h): 5100ms\n⚠️ Error rate: 8.3% (5xx count: 14)\n📉 Trend: p95 +67% vs last hour\n\n💡 Check: Helius RPC may be overloaded or experiencing upstream issues.`
});

addPrompt({
  title: 'Bot Wallet Health Check',
  slug: 'bot-wallet-health-check',
  category: 'Monitoring & Health Checks',
  description: 'Monitors your sniper/scaler bot wallets for balance changes, large transactions, failed swaps, and suspicious activity — alerts same-channel when something looks off.',
  prompt_text: `Set up an always-on automation that monitors your sniper and scaler bot wallets for balance changes, large transactions, failed swaps, and suspicious activity — alerts on the same channel when something looks wrong.\n\nCONFIGURATION:\nCreate ~/configs/wallet_config.json:\n{\n  "wallets": [\n    {"name": "Sniper Bot", "address": "5NPSXWar19xrmHTsELnRjnbH13T9NVGMPiQ4nUe621vu", "chain": "solana"},\n    {"name": "Polygon Wallet", "address": "0x28aD2F2B72eC57c05Bd03a33080390235D57C92c", "chain": "polygon"}\n  ],\n  "alert_threshold_usd": 100,\n  "state_file": "~/.openclaw/wallet_state.json"\n}\n\nWALLET STATE:\n{\n  "5NPSXWar19xrmHTsELnRjnbH13T9NVGMPiQ4nUe621vu": {\n    "last_balance": 0.8,\n    "last_check": 1744156800,\n    "last_txs": ["tx1hash", "tx2hash"],\n    "alert_sent": false\n  }\n}\n\nPROCESS:\n1. For each wallet:\n   a. Fetch current balance using appropriate RPC/API:\n      - Solana: curl -X POST -H 'Content-Type: application/json' -d '{"jsonrpc":"2.0","id":1,"method":"getBalance","params":["ADDRESS"]}' https://api.mainnet-beta.solana.com\n      - Polygon: curl -X POST -H 'Content-Type: application/json' -d '{"jsonrpc":"2.0","id":1,"method":"eth_getBalance","params":["ADDRESS","latest"]}' https://polygon-rpc.com\n   b. Fetch recent transactions (last 10): use blockchain explorer API or RPC\n   c. Compare to last_check state:\n      - Balance change > alert_threshold_usd in value → LARGE CHANGE ALERT\n      - New tx not in last_txs → NEW TRANSACTION (check if expected)\n      - Failed tx (status: failed) → FAILED TX ALERT\n      - Balance decreased significantly with no tx → SUSPICIOUS\n2. Update state_file with new balances and tx hashes\n3. Send Telegram alert for any anomalies\n\nALERT FORMAT:\n💰 Bot Wallet Alert — [WALLET_NAME]\n\n🔴 LARGE BALANCE CHANGE\nBefore: [X] SOL | After: [Y] SOL\nChange: [+-Z] SOL ([$VALUE])\n\n⚠️ NEW TRANSACTION:\nType: [swap/send/receive] | Amount: [X]\nTX: [explorer link]\n\n🔴 FAILED TX:\nTX: [hash]\nError: [reason if available]\n\nTOOLS: exec, filesystem, cron, message`,
  tools: ['exec', 'filesystem', 'cron', 'message'],
  setup_steps: [
    'Create ~/configs/wallet_config.json with your wallet addresses and chains',
    'Get RPC endpoints for each chain (public or private RPCs)',
    'Create script: ~/scripts/wallet_health.sh',
    'Make executable: chmod +x ~/scripts/wallet_health.sh',
    'Add to crontab: "*/15 * * * *" ~/scripts/wallet_health.sh',
    'Test manually: run script and verify it reads correct balances',
    'Verify Telegram bot sends to the correct channel'
  ],
  trigger: 'wallet-health',
  example_output: `💰 Bot Wallet Alert — Sniper Bot\n\n🔴 LARGE BALANCE CHANGE\nBefore: 0.8 SOL | After: 0.32 SOL\nChange: -0.48 SOL ($87.20)\n\n⚠️ NEW TRANSACTION:\nType: JUP swap | Amount: 0.48 SOL → [token]\nTX: https://solscan.io/tx/xxxxx\n\n⚠️ NOTE: This matches a recent sniper transaction. OK if expected.`
});

fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
console.log('Batch 4 done. Total prompts:', data.prompts.length);
