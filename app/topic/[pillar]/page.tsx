import { redirect } from 'next/navigation';

const DEFAULT_SUBPILLAR: Record<string, string> = {
  ai: 'tooling',
  crypto: 'trading',
  automation: 'workflows',
};

export default async function PillarPage({
  params,
}: {
  params: Promise<{ pillar: string }>;
}) {
  const { pillar } = await params;
  const defaultSubpillar = DEFAULT_SUBPILLAR[pillar];
  if (defaultSubpillar) {
    redirect(`/topic/${pillar}/${defaultSubpillar}`);
  }
  // Fallback for unknown pillars
  redirect('/');
}
