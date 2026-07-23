import type { Article } from './articles';

export type ArticleImage = {
  src: string;
  alt: string;
  credit: string;
  creditUrl: string;
};

const unsplashParams = '?auto=format&fit=crop&w=1600&q=80';

const imageSet = {
  aiArt: {
    src: `https://images.unsplash.com/photo-1675557009317-bb59e35aba82${unsplashParams}`,
    alt: 'A laptop displaying an AI interface in a clean workspace',
    credit: 'Photo by Jonathan Kemper on Unsplash',
    creditUrl: 'https://unsplash.com/photos/a-computer-screen-with-a-quote-on-it-urlFSUT2zyM',
  },
  aiTools: {
    src: `https://images.unsplash.com/photo-1775440285627-ce48346bc58c${unsplashParams}`,
    alt: 'An AI assistant interface open on a laptop screen',
    credit: 'Photo by Planet Volumes on Unsplash',
    creditUrl: 'https://unsplash.com/photos/gemini-ai-interface-asking-where-should-we-start--watxsKZK9E',
  },
  code: {
    src: `https://images.unsplash.com/photo-1774901128187-22df3f261ad8${unsplashParams}`,
    alt: 'A computer screen showing code in an engineering workspace',
    credit: 'Photo by Bernd Dittrich on Unsplash',
    creditUrl: 'https://unsplash.com/photos/computer-screen-displaying-lines-of-code-AAMq3jN2B3E',
  },
  crypto: {
    src: `https://images.unsplash.com/photo-1748439435495-722cc1728b7e${unsplashParams}`,
    alt: 'A trading desk with market charts on multiple screens',
    credit: 'Photo by Jakub Zerdzicki on Unsplash',
    creditUrl: 'https://unsplash.com/photos/a-traders-desk-is-lit-up-with-charts-aGKspo5OIyg',
  },
  analytics: {
    src: `https://images.unsplash.com/photo-1635236198091-33d5aa8466cc${unsplashParams}`,
    alt: 'A laptop showing a financial chart and analytics dashboard',
    credit: 'Photo by rc.xyz NFT gallery on Unsplash',
    creditUrl: 'https://unsplash.com/photos/a-person-using-a-laptop-computer-with-a-chart-on-the-screen-InWI1lteYfU',
  },
  automation: {
    src: `https://images.unsplash.com/photo-1573164574572-cb89e39749b4${unsplashParams}`,
    alt: 'A team working together around laptops in a modern office',
    credit: 'Photo by Christina @ wocintechchat.com on Unsplash',
    creditUrl: 'https://unsplash.com/photos/group-of-people-sitting-beside-rectangular-wooden-table-with-laptops-faEfWCdOKIg',
  },
} satisfies Record<string, ArticleImage>;

export function getArticleImage(article: Article): ArticleImage {
  const haystack = `${article.title} ${article.excerpt} ${(article.tags || []).join(' ')}`.toLowerCase();

  if (haystack.includes('copyright') || haystack.includes('image') || haystack.includes('art')) {
    return imageSet.aiArt;
  }

  if (haystack.includes('code') || haystack.includes('coding') || haystack.includes('developer') || haystack.includes('api')) {
    return imageSet.code;
  }

  if (
    article.category === 'crypto' ||
    haystack.includes('crypto') ||
    haystack.includes('defi') ||
    haystack.includes('trading') ||
    haystack.includes('portfolio')
  ) {
    return haystack.includes('tracker') || haystack.includes('analysis') ? imageSet.analytics : imageSet.crypto;
  }

  if (article.category === 'automation' || haystack.includes('workflow') || haystack.includes('automation')) {
    return imageSet.automation;
  }

  return imageSet.aiTools;
}
