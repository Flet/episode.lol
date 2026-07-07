import type { APIRoute } from 'astro';

// Prerendered to a static dist/robots.txt at build time — no runtime data, so
// there's no reason to serve it from an on-demand function.
export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const base = (site?.toString() ?? 'https://episode.lol/').replace(/\/$/, '');
  const body = `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${base}/sitemap.xml
`;
  return new Response(body, {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
