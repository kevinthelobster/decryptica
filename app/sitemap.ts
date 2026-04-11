import { MetadataRoute } from 'next';
import { articles } from './data/articles';
import { SUBPILLARS_BY_PILLAR } from './data/topic-routing';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://decryptica.com';
  const now = new Date();
  
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/articles`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/prompts`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/topic/crypto/trading`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/topic/ai/tooling`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/topic/automation/workflows`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/services/ai-automation-consulting`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/tools/ai-price-calculator`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
  ];

  const subpillarPages: MetadataRoute.Sitemap = (Object.entries(SUBPILLARS_BY_PILLAR) as [string, { slug: string }[]][])
    .flatMap(([pillar, subpillars]) =>
      subpillars.map((subpillar) => ({
        url: `${baseUrl}/topic/${pillar}/${subpillar.slug}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
    );

  // Add blog article pages
  const articlePages: MetadataRoute.Sitemap = articles.map((article) => {
    const articleDate = new Date(article.lastUpdated || article.date);
    const daysSince = (now.getTime() - articleDate.getTime()) / (1000 * 60 * 60 * 24);
    
    return {
      url: `${baseUrl}/blog/${article.slug}`,
      lastModified: articleDate,
      changeFrequency: daysSince < 7 ? 'daily' : daysSince < 30 ? 'weekly' : 'monthly',
      priority: daysSince < 7 ? 0.9 : 0.7,
    };
  });

  return [...staticPages, ...subpillarPages, ...articlePages];
}
