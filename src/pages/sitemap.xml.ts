import type { APIRoute } from 'astro';
import { SHOWS } from '@/lib/shows';
import { seriesPath } from '@/lib/slug';

// Prerendered to a static dist/sitemap.xml at build time (data is the static
// SHOWS pool — no API, no secrets). Serving it as a plain file off the CDN, not
// an on-demand function, is what search engines expect: no cold-start/timeout
// failures, which is what "Sitemap could not be read" in Search Console means.
export const prerender = true;

// The full catalogue is all of TheTVDB, so we can't enumerate it. We seed the
// crawl with the homepage + the curated SHOWS pool (static, no API calls); the
// per-show episode index + "More shows" links on each page then let crawlers
// walk from series to episodes and sideways across the catalogue.
export const GET: APIRoute = async ({ site }) => {
  const base = (site?.toString() ?? 'https://episode.lol/').replace(/\/$/, '');
  const locs = [`${base}/`, ...SHOWS.map((s) => `${base}${seriesPath(s.id, s.name)}`)];

  // W3C date (YYYY-MM-DD) — the build date. Google uses <lastmod>; it ignores
  // <changefreq> and <priority>, so we omit those per its build-sitemap doc.
  const lastmod = new Date().toISOString().slice(0, 10);

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${locs.map((loc) => `  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod></url>`).join('\n')}
</urlset>
`;
  return new Response(body, {
    status: 200,
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
