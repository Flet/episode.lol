import type { APIRoute } from 'astro';
import { getFeatured } from '@/lib/featured';
import { seriesPath } from '@/lib/slug';

export const prerender = false;

// The full catalogue is all of TheTVDB, so we can't enumerate it. We seed the
// crawl with the homepage + curated popular shows; the per-show episode index
// (real <a> links on each series page) lets crawlers walk deeper from there.
export const GET: APIRoute = async ({ site }) => {
  const base = (site?.toString() ?? 'https://episode.lol/').replace(/\/$/, '');
  const locs = [`${base}/`];
  try {
    const featured = await getFeatured();
    for (const s of featured) locs.push(`${base}${seriesPath(s.id, s.name)}`);
  } catch {
    /* still emit at least the homepage */
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${locs.map((loc) => `  <url><loc>${loc}</loc><changefreq>weekly</changefreq></url>`).join('\n')}
</urlset>
`;
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400',
      'Netlify-CDN-Cache-Control': 'public, durable, s-maxage=86400',
    },
  });
};
