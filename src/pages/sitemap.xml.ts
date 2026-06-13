import type { APIRoute } from 'astro';
import { SHOWS } from '@/lib/shows';
import { seriesPath } from '@/lib/slug';

export const prerender = false;

// The full catalogue is all of TheTVDB, so we can't enumerate it. We seed the
// crawl with the homepage + the curated SHOWS pool (static, no API calls); the
// per-show episode index + "More shows" links on each page then let crawlers
// walk from series to episodes and sideways across the catalogue.
export const GET: APIRoute = async ({ site }) => {
  const base = (site?.toString() ?? 'https://episode.lol/').replace(/\/$/, '');
  const locs = [`${base}/`, ...SHOWS.map((s) => `${base}${seriesPath(s.id, s.name)}`)];

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
