import type { APIRoute } from 'astro';

export const prerender = false;

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
