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
  title: string;
  category: string;
  description: string;
  prompt_text: string;
  tools: string[];
  setup_steps: string[];
  trigger: string;
  alert: string;
  submitter_ip: string | null;
  status: string;
  submitted_at: number;
};

const DB_PATH = path.join(process.cwd(), 'data/prompts/prompts.json');

function readDb(): { prompts: Prompt[]; submissions: Submission[]; votes: Record<number, string[]> } {
  const raw = fs.readFileSync(DB_PATH, 'utf8');
  const data = JSON.parse(raw);
  return {
    prompts: (data.prompts || []).map((p: Prompt) => ({
      ...p,
      is_staff_pick: Boolean(p.is_staff_pick),
    })),
    submissions: data.submissions || [],
    votes: data.votes || {},
  };
}

function writeDb(data: any) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export function getPrompts(sort: string = 'recent', category: string = '', voterIp: string = '') {
  const db = readDb();
  let prompts = [...db.prompts];

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

  const votes = db.votes || {};

  return prompts.map(p => ({
    ...p,
    has_voted: votes[p.id]?.includes(voterIp) || false,
  }));
}

export function getPromptBySlug(slug: string, voterIp: string = '') {
  const db = readDb();
  const prompt = db.prompts.find(p => p.slug === slug);
  if (!prompt) return null;
  const votes = db.votes || {};
  return {
    ...prompt,
    has_voted: votes[prompt.id]?.includes(voterIp) || false,
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
  const cats = [...new Set(db.prompts.map(p => p.category))].sort();
  return cats;
}

export function addSubmission(data: any) {
  const db = readDb();
  const submission = {
    id: Date.now(),
    ...data,
    status: 'pending',
    submitted_at: Math.floor(Date.now() / 1000),
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

  const slug = sub.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 60) + '-' + Date.now().toString(36);

  const prompt = {
    id: Date.now(),
    slug,
    title: sub.title,
    category: sub.category,
    description: sub.description || '',
    prompt_text: sub.prompt_text,
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
  return slug;
}

export function rejectSubmission(id: number) {
  const db = readDb();
  const sub = db.submissions.find(s => s.id === id);
  if (!sub) return;
  sub.status = 'rejected';
  writeDb(db);
}
