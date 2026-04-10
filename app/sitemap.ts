import { MetadataRoute } from 'next';
import { articles, topics } from './data/articles';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.decryptica.com';
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
      url: `${baseUrl}/topic/crypto`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/topic/ai`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/topic/automation`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
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
  ];

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

  return [...staticPages, ...articlePages];
}
