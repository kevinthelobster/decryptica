import type { Metadata } from 'next';
import PromptDetailPageClient from './PromptDetailPageClient';
import promptsDb from '../../../data/prompts/prompts.json';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const prompt = promptsDb.prompts.find(item => item.slug === slug);
  const title = prompt?.title || 'OpenClaw Prompt';
  const description = prompt?.description || `View the ${title} OpenClaw prompt on Decryptica, including setup steps, tools used, and example output.`;
  const url = `https://decryptica.com/prompts/${slug}`;

  return {
    title: `${title} | Decryptica Prompt Library`,
    description,
    openGraph: {
      title: `${title} | Decryptica`,
      description,
      url,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Decryptica`,
      description,
    },
  };
}

export function generateStaticParams() {
  return promptsDb.prompts.map(prompt => ({ slug: prompt.slug }));
}

export default function PromptDetailPage(props: Props) {
  return <PromptDetailPageClient {...props} />;
}
