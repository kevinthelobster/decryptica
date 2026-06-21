import type { Metadata } from 'next';
import PromptDetailPageClient from './PromptDetailPageClient';

type Props = { params: Promise<{ slug: string }> };

function formatPromptTitle(slug: string) {
  return slug
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const title = formatPromptTitle(slug);
  const description = `View the ${title} OpenClaw prompt on Decryptica, including setup steps, tools used, and example output.`;
  const url = `https://decryptica.com/prompts/${slug}`;

  return {
    title,
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

export default function PromptDetailPage(props: Props) {
  return <PromptDetailPageClient {...props} />;
}
