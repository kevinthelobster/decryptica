import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const TTL_90_DAYS = 60 * 60 * 24 * 90;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

type AutomationAuditLead = {
  name: string;
  email: string;
  teamSize: string;
  workflow: string;
  stack: string;
  monthlySavings?: number;
  annualRoi?: number;
};

function normalizeLead(raw: unknown): AutomationAuditLead | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Record<string, unknown>;

  const name = String(data.name || '').trim();
  const email = String(data.email || '').trim().toLowerCase();
  const teamSize = String(data.teamSize || '').trim();
  const workflow = String(data.workflow || '').trim();
  const stack = String(data.stack || '').trim();

  if (!name || !email || !teamSize || !workflow || !stack) return null;

  const monthlySavings = Number(data.monthlySavings);
  const annualRoi = Number(data.annualRoi);

  return {
    name,
    email,
    teamSize,
    workflow,
    stack,
    monthlySavings: Number.isFinite(monthlySavings) ? monthlySavings : undefined,
    annualRoi: Number.isFinite(annualRoi) ? annualRoi : undefined,
  };
}

export async function POST(request: NextRequest) {
  try {
    const payload = normalizeLead(await request.json());
    if (!payload) {
      return NextResponse.json({ error: 'Missing required lead fields' }, { status: 400 });
    }

    const ts = new Date().toISOString();
    const key = `lead:automation_audit:${Date.now()}:${Math.random().toString(16).slice(2, 10)}`;
    await kv.set(
      key,
      JSON.stringify({
        ...payload,
        createdAt: ts,
        source: 'services/ai-automation-consulting',
      }),
      { ex: TTL_90_DAYS }
    );

    const day = ts.split('T')[0];
    await kv.incr(`lead:counter:automation_audit:${day}`);
    await kv.expire(`lead:counter:automation_audit:${day}`, TTL_90_DAYS);
    await notifyLead({ ...payload, createdAt: ts });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[Automation Audit API] POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function notifyLead(payload: AutomationAuditLead & { createdAt: string }): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('[Automation Audit API] Telegram notification skipped: missing bot token or chat ID');
    return;
  }

  const message = [
    'New Decryptica automation lead',
    '',
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Team size: ${payload.teamSize}`,
    `Workflow: ${payload.workflow}`,
    `Current stack / outcome: ${payload.stack}`,
    payload.monthlySavings !== undefined ? `Estimated monthly savings: $${payload.monthlySavings.toLocaleString()}` : null,
    payload.annualRoi !== undefined ? `Projected annual ROI: ${payload.annualRoi}%` : null,
    `Submitted: ${payload.createdAt}`,
  ].filter(Boolean).join('\n');

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        disable_web_page_preview: true,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error('[Automation Audit API] Telegram notification failed:', response.status, body.slice(0, 200));
    }
  } catch (error) {
    console.error('[Automation Audit API] Telegram notification error:', error);
  }
}
