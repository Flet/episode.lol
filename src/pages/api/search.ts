import type { APIRoute } from 'astro';
import { searchSeries, TvdbError } from '@/lib/tvdb';
import { mapSearch } from '@/lib/map';
import { json, fail } from '@/lib/respond';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const q = url.searchParams.get('q')?.trim();
  if (!q) return fail('Missing query parameter "q".', 400);
  try {
    const raw = await searchSeries(q);
    return json(mapSearch(raw), 60 * 60 * 24); // cache 1 day at the edge
  } catch (err) {
    const e = err as TvdbError;
    return fail(e.message || 'Search failed.', e.status || 502);
  }
};
