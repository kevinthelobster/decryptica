import type { Article } from './articles';

export type ArticleImage = {
  src: string;
  alt: string;
  credit: string;
  creditUrl: string;
};

const unsplashParams = '?auto=format&fit=crop&w=1600&q=80';

export const imageSet = {
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
  aiWorkspace: {
    src: `https://images.unsplash.com/photo-1745201504924-29f92f9c355e${unsplashParams}`,
    alt: 'A laptop in a bright workspace showing a focused digital interface',
    credit: 'Photo by Yuhun Kim on Unsplash',
    creditUrl: 'https://unsplash.com/photos/a-laptop-screen-displaying-a-login-form-8u9kMalQKnM',
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
  workflowMeeting: {
    src: `https://images.unsplash.com/photo-1542744095-fcf48d80b0fd${unsplashParams}`,
    alt: 'Operators reviewing workflow plans around laptops in a conference room',
    credit: 'Photo by Campaign Creators on Unsplash',
    creditUrl: 'https://unsplash.com/photos/people-sitting-near-table-with-laptop-computer-qCi_MzVODoU',
  },
  operationalWorkspace: {
    src: `https://images.unsplash.com/photo-1551434678-e076c223a692${unsplashParams}`,
    alt: 'A product and operations team reviewing work on laptops around a shared table',
    credit: 'Photo by You X Ventures on Unsplash',
    creditUrl: 'https://unsplash.com/photos/people-sitting-down-near-table-with-assorted-laptop-computers-g1Kr4Ozfoac',
  },
  integrationDashboard: {
    src: `https://images.unsplash.com/photo-1551288049-bebda4e38f71${unsplashParams}`,
    alt: 'A dashboard-style analytics display representing connected business systems',
    credit: 'Photo by Luke Chesser on Unsplash',
    creditUrl: 'https://unsplash.com/photos/JKUTrJ4vK00',
  },
  marketingDashboard: {
    src: `https://images.unsplash.com/photo-1686061594225-3e92c0cd51b0${unsplashParams}`,
    alt: 'A close view of a digital analytics dashboard on a computer screen',
    credit: 'Photo by 1981 Digital on Unsplash',
    creditUrl: 'https://unsplash.com/photos/a-computer-screen-with-a-bunch-of-data-on-it-bMWHu8wU1Vk',
  },
  workflowPlanner: {
    src: `https://images.unsplash.com/photo-1743385779347-1549dabf1320${unsplashParams}`,
    alt: 'A workflow diagram, product brief, and user goals laid out on a desk',
    credit: 'Photo by Kelly Sikkema on Unsplash',
    creditUrl: 'https://unsplash.com/photos/workflow-diagram-product-brief-and-user-goals-are-shown-wdnpaTNwOEQ',
  },
  appDashboard: {
    src: `https://images.unsplash.com/photo-1771922748624-b205cf5d002d${unsplashParams}`,
    alt: 'A laptop and phone showing a business control dashboard',
    credit: 'Photo by Neil Fernandez on Unsplash',
    creditUrl: 'https://unsplash.com/photos/laptop-and-phone-displaying-financial-data-_rAKDw1Fd54',
  },
  hiringDashboard: {
    src: `https://images.unsplash.com/photo-1763718528755-4bca23f82ac3${unsplashParams}`,
    alt: 'A hiring operations dashboard with charts and activity metrics',
    credit: 'Photo by prashant hiremath on Unsplash',
    creditUrl: 'https://unsplash.com/photos/employer-dashboard-showing-application-trends-and-key-metrics-phS1wAgXOQI',
  },
  operatorLaptop: {
    src: `https://images.unsplash.com/photo-1573496130596-7b29974bd137${unsplashParams}`,
    alt: 'A small team discussing work around a laptop',
    credit: 'Photo by Christina @ wocintechchat.com on Unsplash',
    creditUrl: 'https://unsplash.com/photos/person-using-macbook-air-at-the-table-03hBSIiFikE',
  },
  productWorkspace: {
    src: `https://images.unsplash.com/photo-1564424555153-04228f0aa7ee${unsplashParams}`,
    alt: 'A product team member working at a monitor in a shared office',
    credit: 'Photo by Alvaro Reyes on Unsplash',
    creditUrl: 'https://unsplash.com/photos/man-using-monitor-6avV9oeHxfo',
  },
} satisfies Record<string, ArticleImage>;

export type ArticleImageKey = keyof typeof imageSet;

export const articleImageOverrides = {
  'best-ai-coding-tools-what-actually-matters-before-you-pay': imageSet.operatorLaptop,
  'the-compute-cost-problem-limiting-ai-progress': imageSet.hiringDashboard,
  'what-1000-hours-of-ai-assistant-use-taught-me': imageSet.appDashboard,
  'why-junior-developers-should-embrace-ai-coding-tools': imageSet.automation,
  'chatgpt-vs-claude-which-assistant-fits-real-work': imageSet.aiWorkspace,
  'the-10x-developer-myth-what-the-data-actually-shows': imageSet.productWorkspace,
  'zapier-vs-make-vs-n8n-which-automation-platform-fits-your-wo': imageSet.marketingDashboard,
  'zapier-vs-native-integrations-when-the-middleware-is-worth-i': imageSet.workflowPlanner,
  'make-vs-n8n-which-workflow-builder-should-operators-choose': imageSet.workflowMeeting,
  'airtable-vs-notion-which-operational-database-makes-more-sen': imageSet.operationalWorkspace,
} satisfies Record<string, ArticleImage>;

export const articleImagePools = {
  ai: ['aiTools', 'aiWorkspace', 'code', 'aiArt', 'marketingDashboard', 'productWorkspace'],
  automation: [
    'integrationDashboard',
    'workflowPlanner',
    'appDashboard',
    'hiringDashboard',
    'operatorLaptop',
    'workflowMeeting',
    'operationalWorkspace',
    'productWorkspace',
    'automation',
  ],
  crypto: ['crypto', 'analytics', 'appDashboard', 'marketingDashboard', 'code'],
} satisfies Record<Article['category'], ArticleImageKey[]>;

export function getArticleImageCandidateKeys(article: Article): ArticleImageKey[] {
  const haystack = `${article.title} ${article.excerpt} ${(article.tags || []).join(' ')}`.toLowerCase();

  if (haystack.includes('copyright') || haystack.includes('image') || haystack.includes('art')) {
    return ['aiArt', ...articleImagePools.ai.filter((key) => key !== 'aiArt')];
  }

  if (haystack.includes('code') || haystack.includes('coding') || haystack.includes('developer') || haystack.includes('api')) {
    return ['code', ...articleImagePools[article.category].filter((key) => key !== 'code')];
  }

  if (
    article.category === 'crypto' ||
    haystack.includes('crypto') ||
    haystack.includes('defi') ||
    haystack.includes('trading') ||
    haystack.includes('portfolio')
  ) {
    const preferredKey = haystack.includes('tracker') || haystack.includes('analysis') ? 'analytics' : 'crypto';
    return [preferredKey, ...articleImagePools.crypto.filter((key) => key !== preferredKey)];
  }

  return articleImagePools[article.category] || articleImagePools.ai;
}

export function getArticleImageKey(article: Article): ArticleImageKey {
  const override = articleImageOverrides[article.slug as keyof typeof articleImageOverrides];
  if (override) {
    const overrideKey = (Object.entries(imageSet) as [ArticleImageKey, ArticleImage][]).find(([, image]) => image.src === override.src)?.[0];
    if (overrideKey) return overrideKey;
  }

  return getArticleImageCandidateKeys(article)[0] || 'aiTools';
}

export function getArticleImage(article: Article): ArticleImage {
  return imageSet[getArticleImageKey(article)];
}
