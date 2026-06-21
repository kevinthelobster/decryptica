export const SITE_URL = 'https://decryptica.com';
export const SITE_NAME = 'Decryptica';
export const ORG_NAME = 'Renegade Reels LLC';

export function absoluteUrl(path = '/') {
  if (!path || path === '/') return SITE_URL;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function jsonLdScript(data: Record<string, unknown> | Record<string, unknown>[]) {
  return {
    __html: JSON.stringify(data),
  };
}

export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: ORG_NAME,
    alternateName: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: ['https://x.com/decryptica', 'https://github.com/decryptica'],
    email: 'hello@decryptica.com',
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'hello@decryptica.com',
        url: `${SITE_URL}/contact`,
        availableLanguage: ['en'],
      },
      {
        '@type': 'ContactPoint',
        contactType: 'sales',
        email: 'brian@renegadereels.com',
        url: `${SITE_URL}/contact`,
        availableLanguage: ['en'],
      },
    ],
    address: {
      '@type': 'PostalAddress',
      addressRegion: 'OH',
      addressCountry: 'US',
    },
  };
}

export function getWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    publisher: {
      '@id': `${SITE_URL}/#organization`,
    },
    inLanguage: 'en-US',
  };
}

export function getBreadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function getCollectionPageSchema({
  name,
  description,
  path,
}: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url: absoluteUrl(path),
    isPartOf: {
      '@id': `${SITE_URL}/#website`,
    },
  };
}
