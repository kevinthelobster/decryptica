import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'OpenClaw Prompt Library — Automations That Run Forever',
  description: 'Copy-pasteable OpenClaw automation setups. Heartbeat monitors, memory consolidation, daily digests, and more. Submit your own or browse community prompts.',
};

export default function PromptsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
