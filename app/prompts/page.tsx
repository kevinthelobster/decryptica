import type { Metadata } from 'next';
import PromptsPageClient from './PromptsPageClient';

export const metadata: Metadata = {
  title: 'OpenClaw Prompt Library',
  description:
    'Browse copy-pasteable OpenClaw automations, discover community-submitted prompts, and submit your own workflows.',
  openGraph: {
    title: 'OpenClaw Prompt Library | Decryptica',
    description:
      'Browse copy-pasteable OpenClaw automations, discover community-submitted prompts, and submit your own workflows.',
    url: 'https://decryptica.com/prompts',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OpenClaw Prompt Library | Decryptica',
    description:
      'Browse copy-pasteable OpenClaw automations, discover community-submitted prompts, and submit your own workflows.',
  },
};

export default function PromptsPage() {
  return <PromptsPageClient />;
}
