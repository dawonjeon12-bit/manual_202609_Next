import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.SITE_URL || 'http://localhost:3000';
  return ['', '/product', '/tools', '/customers', '/community', '/pricing', '/contact']
    .map(p => ({ url: base + p, changeFrequency: 'monthly' as const }));
}
