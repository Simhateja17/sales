import type { MetadataRoute } from 'next';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://circleon.ai';
const PATHS = ['', '/lead-generation', '/voice-agent', '/follow-up', '/pricing', '/demo', '/about', '/safety', '/stories', '/blog', '/help', '/contact', '/privacy', '/pdpa', '/dnc-policy', '/terms'];

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.map(path => ({ url: `${SITE}${path}`, changeFrequency: 'monthly', priority: path === '' ? 1 : 0.7 }));
}
