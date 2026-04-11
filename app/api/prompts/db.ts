import fs from 'fs';
import path from 'path';

type Prompt = {
  id: number;
  slug: string;
  title: string;
  category: string;
  description: string;
  prompt_text: string;
  tools: string[];
  setup_steps: string[];
  trigger: string;
  alert: string;
  example_output: string;
  is_staff_pick: boolean;
  vote_count: number;
  created_at: number;
  updated_at: number;
};

type Submission = {
  id: number;
  title?: string;
  category?: string;
  description?: string;
  prompt_text?: string;
  tools?: string[];
  setup_steps?: string[];
  trigger?: string;
  alert?: string;
  submitter_ip: string | null;
  status: string;
  submitted_at: number;
  // Change idea fields
  is_change_idea?: boolean;
  original_prompt_id?: number;
  proposed_change?: string;
};

const DB_PATH = path.join(process.cwd(), 'data/prompts/prompts.json');
const SUBMISSIONS_PATH = '/tmp/decryptica_submissions.json';
const VOTES_PATH = '/tmp/decryptica_votes.json';
const PROMPT_EDITS_PATH = '/tmp/decryptica_prompt_edits.json';

// Telegram bot config
const TELEGRAM_BOT_TOKEN = '8332002226:AAG5PEkMAjgjVtYzQYJ0kEM1XROPN2MxXU8';
const TELEGRAM_CHAT_ID = '8324073314';

async function sendTelegramMessage(text: string) {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const body = JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text });
    const { default: NodeHttp } = await import('http');
    const { default: Https } = await import('https');
    const isHttps = url.startsWith('https://');
    const http = isHttps ? Https : NodeHttp;
    const client = url.startsWith('https://')
      ? await import('node:https')
      : await import('node:http');

    const urlObj = new URL(url);
    const opts = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    };

    return new Promise((resolve) => {
      const req = (isHttps ? Https : NodeHttp).request(urlObj, opts, (res: any) => {
        resolve(res.statusCode === 200);
      });
      req.on('error', () => resolve(false));
      req.write(body);
      req.end();
    });
  } catch {
    return false;
  }
}

function readDb(): { prompts: Prompt[]; submissions: Submission[]; votes: Record<number, string[]> } {
  const raw = fs.readFileSync(DB_PATH, 'utf8');
  const data = JSON.parse(raw);
  let submissions: Submission[] = [];
  let votes: Record<number, string[]> = {};
  let promptEdits: Record<number, Partial<Prompt>> = {};

  try {
    const tmpRaw = fs.readFileSync(SUBMISSIONS_PATH, 'utf8');
    submissions = JSON.parse(tmpRaw);
  } catch {
    // No submissions in /tmp yet
  }
  try {
    const votesRaw = fs.readFileSync(VOTES_PATH, 'utf8');
    votes = JSON.parse(votesRaw);
  } catch {
    votes = data.votes || {};
  }
  try {
    const editsRaw = fs.readFileSync(PROMPT_EDITS_PATH, 'utf8');
    promptEdits = JSON.parse(editsRaw);
  } catch {
    // No edits in /tmp yet
  }

  const mergedPrompts = (data.prompts || []).map((p: Prompt) => {
    const edits = promptEdits[p.id] || {};
    return {
      ...p,
      is_staff_pick: Boolean(edits.is_staff_pick ?? p.is_staff_pick),
      ...edits,
    };
  });

  return {
    prompts: mergedPrompts,
    submissions,
    votes,
  };
}

function writeDb(data: any) {
  // Votes and prompt edits go to /tmp (writable on Vercel)
  fs.writeFileSync(VOTES_PATH, JSON.stringify(data.votes || {}, null, 2));
  fs.writeFileSync(SUBMISSIONS_PATH, JSON.stringify(data.submissions || [], null, 2));
  if (data.promptEdits) {
    fs.writeFileSync(PROMPT_EDITS_PATH, JSON.stringify(data.promptEdits, null, 2));
  }
}

export function getPrompts(sort: string = 'recent', category: string = '', voterIp: string = '') {
  const db = readDb();
  let prompts = [...db.prompts];
  const votes = db.votes || {};

  // Compute live vote counts from the votes object (not from prompts.json which is stale)
  prompts = prompts.map(p => ({
    ...p,
    vote_count: votes[p.id]?.length || 0,
    has_voted: votes[p.id]?.includes(voterIp) || false,
  }));

  if (category) {
    prompts = prompts.filter(p => p.category === category);
  }

  if (sort === 'popular') {
    prompts.sort((a, b) => b.vote_count - a.vote_count);
  } else if (sort === 'staff') {
    prompts.sort((a, b) => (b.is_staff_pick ? 1 : 0) - (a.is_staff_pick ? 1 : 0));
  } else {
    prompts.sort((a, b) => b.created_at - a.created_at);
  }

  return prompts;
}

export function getPromptBySlug(slug: string, voterIp: string = '') {
  const db = readDb();
  const prompt = db.prompts.find(p => p.slug === slug);
  if (!prompt) return null;
  const votes = db.votes || {};
  return {
    ...prompt,
    vote_count: votes[prompt.id]?.length || 0,
    has_voted: votes[prompt.id]?.includes(voterIp) || false,
  };
}

export function getPromptById(id: number) {
  const db = readDb();
  const prompt = db.prompts.find(p => p.id === id) || null;
  if (!prompt) return null;
  const votes = db.votes || {};
  return {
    ...prompt,
    vote_count: votes[prompt.id]?.length || 0,
  };
}

export function toggleVote(promptId: number, voterIp: string) {
  const db = readDb();
  if (!db.votes) db.votes = {};
  if (!db.votes[promptId]) db.votes[promptId] = [];

  const idx = db.votes[promptId].indexOf(voterIp);
  let voted = false;

  if (idx >= 0) {
    db.votes[promptId].splice(idx, 1);
  } else {
    db.votes[promptId].push(voterIp);
    voted = true;
  }

  const prompt = db.prompts.find(p => p.id === promptId);
  if (prompt) {
    const count = (db.votes[promptId] || []).length;
    prompt.vote_count = count;
  }

  writeDb(db);
  return { voted, vote_count: prompt?.vote_count || 0 };
}

export function getCategories() {
  const db = readDb();
  const cats = [...new Set(db.prompts.map(p => p.category))];
  const ALL_CATS = [
    'Memory Management',
    'Monitoring & Health Checks',
    'Communication & Automation',
    'Coding & Automation',
    'Research & Feeds',
    'Other',
  ];
  return [...new Set([...cats, ...ALL_CATS])].sort();
}

// ─── Edit existing prompts ─────────────────────────────────────────────────

// Load prompt edits from /tmp (read-only-safe persistent store)
function loadPromptEdits(): Record<number, Partial<Prompt>> {
  try {
    return JSON.parse(fs.readFileSync(PROMPT_EDITS_PATH, 'utf8'));
  } catch {
    return {};
  }
}

function savePromptEdits(edits: Record<number, Partial<Prompt>>) {
  fs.writeFileSync(PROMPT_EDITS_PATH, JSON.stringify(edits, null, 2));
}

export function updatePrompt(id: number, updates: Partial<Prompt>) {
  const db = readDb();
  const prompt = db.prompts.find(p => p.id === id);
  if (!prompt) return null;

  const edits = loadPromptEdits();
  if (!edits[id]) edits[id] = {};

  const allowed = ['title', 'category', 'description', 'prompt_text', 'tools', 'setup_steps', 'trigger', 'alert', 'is_staff_pick'];
  for (const key of allowed) {
    if (key in updates) {
      (edits[id] as any)[key] = (updates as any)[key];
    }
  }
  (edits[id] as any).updated_at = Math.floor(Date.now() / 1000);

  savePromptEdits(edits);

  // Return the updated prompt merged with base
  return {
    ...prompt,
    ...edits[id],
    is_staff_pick: Boolean(edits[id].is_staff_pick ?? prompt.is_staff_pick),
  };
}

export function toggleStaffPick(id: number) {
  const db = readDb();
  const prompt = db.prompts.find(p => p.id === id);
  if (!prompt) return null;

  const edits = loadPromptEdits();
  if (!edits[id]) edits[id] = {};
  // Toggle: if base is already true, set to false; otherwise set to true
  const currentBase = edits[id].is_staff_pick ?? prompt.is_staff_pick;
  edits[id].is_staff_pick = !currentBase;

  savePromptEdits(edits);

  return {
    ...prompt,
    is_staff_pick: edits[id].is_staff_pick,
  };
}

// ─── Submissions ────────────────────────────────────────────────────────────

export function addSubmission(data: any) {
  const db = readDb();
  const submission: Submission = {
    id: Date.now(),
    submitter_ip: data.submitter_ip || null,
    status: 'pending',
    submitted_at: Math.floor(Date.now() / 1000),
    ...data,
  };
  if (!db.submissions) db.submissions = [];
  db.submissions.push(submission);
  writeDb(db);
  return submission;
}

export function getPendingSubmissions() {
  const db = readDb();
  return (db.submissions || []).filter(s => s.status === 'pending');
}

export function approveSubmission(id: number) {
  const db = readDb();
  const sub = db.submissions.find(s => s.id === id);
  if (!sub) return null;

  // Handle change ideas differently — update the original prompt
  if (sub.is_change_idea && sub.original_prompt_id) {
    const original = db.prompts.find(p => p.id === sub.original_prompt_id);
    if (!original) return null;
    original.prompt_text = sub.proposed_change || original.prompt_text;
    original.updated_at = Math.floor(Date.now() / 1000);
    original.description = sub.description || original.description;
    sub.status = 'approved';
    writeDb(db);
    return { type: 'change_idea', slug: original.slug };
  }

  const slug = sub.title!
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 60) + '-' + Date.now().toString(36);

  const prompt: Prompt = {
    id: Date.now(),
    slug,
    title: sub.title!,
    category: sub.category || 'Other',
    description: sub.description || '',
    prompt_text: sub.prompt_text || '',
    tools: sub.tools || [],
    setup_steps: sub.setup_steps || [],
    trigger: sub.trigger || '',
    alert: sub.alert || '',
    example_output: '',
    is_staff_pick: false,
    vote_count: 0,
    created_at: Math.floor(Date.now() / 1000),
    updated_at: Math.floor(Date.now() / 1000),
  };

  db.prompts.push(prompt);
  sub.status = 'approved';
  writeDb(db);
  return { type: 'new_prompt', slug };
}

export function rejectSubmission(id: number) {
  const db = readDb();
  const sub = db.submissions.find(s => s.id === id);
  if (!sub) return;
  sub.status = 'rejected';
  writeDb(db);
}

// ─── Telegram notifications ──────────────────────────────────────────────────

export async function notifyNewSubmission(submission: Submission) {
  let text: string;

  if (submission.is_change_idea && submission.original_prompt_id) {
    const db = readDb();
    const original = db.prompts.find(p => p.id === submission.original_prompt_id);
    text = `💡 *New Change Idea*\n\n` +
      `Prompt: *${original?.title || 'Unknown'}*\n` +
      `Submitted: ${new Date(submission.submitted_at * 1000).toLocaleString()}\n\n` +
      `*Proposed Change:*\n${(submission.proposed_change || '').substring(0, 300)}${(submission.proposed_change || '').length > 300 ? '...' : ''}\n\n` +
      `Review: https://decryptica.com/prompts/admin`;
  } else {
    text = `📬 *New Prompt Submission*\n\n` +
      `*${submission.title || 'Untitled'}*\n` +
      `Category: ${submission.category || 'Other'}\n` +
      `Tools: ${(submission.tools || []).join(', ') || 'none'}\n\n` +
      `${(submission.description || '').substring(0, 200)}${(submission.description || '').length > 200 ? '...' : ''}\n\n` +
      `Review: https://decryptica.com/prompts/admin`;
  }

  await sendTelegramMessage(text);
}
