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
  codeEditor: {
    src: `https://images.unsplash.com/photo-1763568258696-32147bb44379${unsplashParams}`,
    alt: 'A code editor open on a desktop monitor',
    credit: 'Photo by Daniil Komov on Unsplash',
    creditUrl: 'https://unsplash.com/photos/computer-screen-showing-lines-of-code-d75zdRe5g_s',
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
  transformerArchitecture: {
    src: `https://images.unsplash.com/photo-1770210217380-d78a69acdc77${unsplashParams}`,
    alt: 'An abstract grid of connected lights representing model architecture constraints',
    credit: 'Photo by Zach M on Unsplash',
    creditUrl: 'https://unsplash.com/photos/concentric-circles-with-ai-logo-in-center-bUybBtjhqEg',
  },
  aiIntegrationLaptop: {
    src: `https://images.unsplash.com/photo-1758626042818-b05e9c91b84a${unsplashParams}`,
    alt: 'A laptop showing an AI integration interface in a bright workspace',
    credit: 'Photo by Jo Lin on Unsplash',
    creditUrl: 'https://unsplash.com/photos/person-using-laptop-with-ai-integration-logo-displayed-U48gtf_qhVM',
  },
  serverRack: {
    src: `https://images.unsplash.com/photo-1695668548342-c0c1ad479aee${unsplashParams}`,
    alt: 'A server rack with network equipment representing infrastructure limits',
    credit: 'Photo by Kevin Ache on Unsplash',
    creditUrl: 'https://unsplash.com/photos/a-rack-of-servers-in-a-server-room-2JJ3wBHu4_0',
  },
  codeProject: {
    src: `https://images.unsplash.com/photo-1774901128281-a884cd447af5${unsplashParams}`,
    alt: 'A development environment showing source code and project files',
    credit: 'Photo by Bernd Dittrich on Unsplash',
    creditUrl: 'https://unsplash.com/photos/computer-screen-displaying-code-and-project-files-A9jp72Owzvs',
  },
  analyticsMonitor: {
    src: `https://images.unsplash.com/photo-1526628953301-3e589a6a8b74${unsplashParams}`,
    alt: 'A reporting dashboard shown on a laptop screen',
    credit: 'Photo by Stephen Dawson on Unsplash',
    creditUrl: 'https://unsplash.com/photos/turned-on-monitoring-screen-qwtCeJ5cLYs',
  },
  reactCodeEditor: {
    src: `https://images.unsplash.com/photo-1619410283995-43d9134e7656${unsplashParams}`,
    alt: 'A code editor displaying React source code on a laptop',
    credit: 'Photo by Juanjo Jaramillo on Unsplash',
    creditUrl: 'https://unsplash.com/photos/code-editor-displaying-react-source-code-mZnx9429i94',
  },
  aiTabletWorkspace: {
    src: `https://images.unsplash.com/photo-1758626052247-79003b45f802${unsplashParams}`,
    alt: 'Hands holding a tablet displaying an AI software interface',
    credit: 'Photo by Jo Lin on Unsplash',
    creditUrl: 'https://unsplash.com/photos/hands-holding-a-tablet-displaying-ai-logo-Gy1p3CkNLms',
  },
  darkCodeScreen: {
    src: `https://images.unsplash.com/photo-1781787346847-179b5c773b08${unsplashParams}`,
    alt: 'A dark computer screen showing code and development icons',
    credit: 'Photo by MARCO on Unsplash',
    creditUrl: 'https://unsplash.com/photos/computer-code-on-a-dark-screen-with-development-icons-PKqKwpAmr5g',
  },
  warmCodeMonitor: {
    src: `https://images.unsplash.com/photo-1785615795052-bede921957ea${unsplashParams}`,
    alt: 'A monitor showing source code with warm desk lighting',
    credit: 'Photo by Harshit Katiyar on Unsplash',
    creditUrl: 'https://unsplash.com/photos/computer-screen-displaying-lines-of-code-5sLNGV2EFRM',
  },
  aiNetworkLaptop: {
    src: `https://images.unsplash.com/photo-1674027444454-97b822a997b6${unsplashParams}`,
    alt: 'A generated network visualization surrounding a laptop',
    credit: 'Photo by Growtika on Unsplash',
    creditUrl: 'https://unsplash.com/photos/a-computer-generated-image-of-a-network-and-a-laptop-f0JGorLOkw0',
  },
  chatgptLaptopDesk: {
    src: `https://images.unsplash.com/photo-1678347123725-2d0d31bc06bd${unsplashParams}`,
    alt: 'A laptop on a table showing an AI assistant interface',
    credit: 'Photo by Deng Xiang on Unsplash',
    creditUrl: 'https://unsplash.com/photos/a-laptop-computer-sitting-on-top-of-a-table-ILyeoImR8Uk',
  },
  aiScreenCloseup: {
    src: `https://images.unsplash.com/photo-1675557009483-e6cf3867976b${unsplashParams}`,
    alt: 'A close view of an AI interface on a computer screen',
    credit: 'Photo by Jonathan Kemper on Unsplash',
    creditUrl: 'https://unsplash.com/photos/a-close-up-of-a-computer-screen-with-a-blurry-background-MMUzS5Qzuus',
  },
  securityDashboard: {
    src: `https://images.unsplash.com/photo-1667372283536-a832e74401c2${unsplashParams}`,
    alt: 'A security and privacy dashboard shown on a blue computer interface',
    credit: 'Photo by Growtika on Unsplash',
    creditUrl: 'https://unsplash.com/photos/a-blue-and-white-logo-ahgsuFHlIFo',
  },
  circuitControlBoard: {
    src: `https://images.unsplash.com/photo-1782155789492-3ea097e779cf${unsplashParams}`,
    alt: 'A circuit board with a central chip and golden contacts',
    credit: 'Photo by Brecht Corbeel on Unsplash',
    creditUrl: 'https://unsplash.com/photos/a-circuit-board-with-a-central-microchip-and-golden-contacts--Ejdz381VUk',
  },
  automationControlPanel: {
    src: `https://images.unsplash.com/photo-1780034766228-3fd70d9463c3${unsplashParams}`,
    alt: 'An industrial control panel with modules and colorful wiring',
    credit: 'Photo by Raymond Sime on Unsplash',
    creditUrl: 'https://unsplash.com/photos/industrial-control-panel-with-electronic-modules-and-colorful-wiring-UEx6fTODHzI',
  },
  marketInterface: {
    src: `https://images.unsplash.com/photo-1651341050677-24dba59ce0fd${unsplashParams}`,
    alt: 'A trading-style interface with market data and dark charts',
    credit: 'Photo by Anne Nygard on Unsplash',
    creditUrl: 'https://unsplash.com/photos/graphical-user-interface-application-x07ELaNFt34',
  },
  aiKnowledgeGraph: {
    src: `https://images.unsplash.com/photo-1674027444484-cf52149ea050${unsplashParams}`,
    alt: 'A generated network of connected nodes representing AI memory',
    credit: 'Photo by Growtika on Unsplash',
    creditUrl: 'https://unsplash.com/photos/a-computer-generated-image-of-a-ball-of-string-P5mCQ4KACbM',
  },
  darkAutomationDashboard: {
    src: `https://images.unsplash.com/photo-1771923082503-0a3381c46cef${unsplashParams}`,
    alt: 'A modern laptop displaying a dark business automation dashboard',
    credit: 'Photo by Neil Fernandez on Unsplash',
    creditUrl: 'https://unsplash.com/photos/a-modern-laptop-displaying-a-dark-themed-dashboard-6-0ajRI1cgs',
  },
  studentOpsDashboard: {
    src: `https://images.unsplash.com/photo-1763718432504-7716caff6e99${unsplashParams}`,
    alt: 'A blue operations dashboard with quick access panels and alerts',
    credit: 'Photo by prashant hiremath on Unsplash',
    creditUrl: 'https://unsplash.com/photos/student-dashboard-with-quick-access-and-alerts-0pjqSMqYlyU',
  },
} satisfies Record<string, ArticleImage>;

export type ArticleImageKey = keyof typeof imageSet;

export const articleImageOverrides = {
  'building-reliable-ai-agents-the-hard-truth': imageSet.securityDashboard,
  'why-ai-agent-memory-is-still-fundamentally-broken': imageSet.circuitControlBoard,
  'claude-vs-gemini-which-ai-assistant-makes-more-sense': imageSet.serverRack,
  'chatgpt-team-vs-claude-team-which-plan-fits-small-teams': imageSet.codeProject,
  'midjourney-vs-adobe-firefly-which-image-tool-is-safer-for-wo': imageSet.aiIntegrationLaptop,
  'what-transformer-architecture-limits-mean-for-ai': imageSet.transformerArchitecture,
  'claude-vs-gpt-5-the-comparison-that-matters': imageSet.codeEditor,
  'midjourney-vs-stable-diffusion-4-the-real-difference': imageSet.aiArt,
  'perplexity-vs-chatgpt-which-research-tool-is-better': imageSet.marketingDashboard,
  'openai-api-vs-anthropic-api-which-model-stack-fits-your-prod': imageSet.marketingDashboard,
  'why-ai-image-generation-is-plateauing': imageSet.aiWorkspace,
  'the-truth-about-ai-coding-assistants-in-2026': imageSet.marketingDashboard,
  'why-ai-assistants-are-getting-worse-at-reasoning': imageSet.code,
  'cursor-vs-github-copilot-which-coding-assistant-should-you-u': imageSet.codeEditor,
  'why-context-windows-aren-t-the-answer': imageSet.aiArt,
  'when-ai-summarization-actually-hurts-understanding': imageSet.productWorkspace,
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
  ai: [
    'aiKnowledgeGraph',
    'circuitControlBoard',
    'securityDashboard',
    'aiScreenCloseup',
    'chatgptLaptopDesk',
    'aiNetworkLaptop',
    'warmCodeMonitor',
    'darkCodeScreen',
    'aiTabletWorkspace',
    'reactCodeEditor',
    'analyticsMonitor',
    'aiTools',
    'aiWorkspace',
    'aiIntegrationLaptop',
    'code',
    'codeEditor',
    'codeProject',
    'serverRack',
    'aiArt',
    'marketingDashboard',
    'productWorkspace',
  ],
  automation: [
    'studentOpsDashboard',
    'darkAutomationDashboard',
    'automationControlPanel',
    'circuitControlBoard',
    'securityDashboard',
    'aiTabletWorkspace',
    'analyticsMonitor',
    'integrationDashboard',
    'workflowPlanner',
    'appDashboard',
    'hiringDashboard',
    'operatorLaptop',
    'aiIntegrationLaptop',
    'workflowMeeting',
    'operationalWorkspace',
    'productWorkspace',
    'automation',
  ],
  crypto: [
    'marketInterface',
    'securityDashboard',
    'aiNetworkLaptop',
    'analyticsMonitor',
    'darkAutomationDashboard',
    'aiKnowledgeGraph',
    'crypto',
    'analytics',
    'appDashboard',
    'marketingDashboard',
    'code',
  ],
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
