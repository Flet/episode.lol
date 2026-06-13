import type { APIRoute } from 'astro';
import { TvdbError } from '@/lib/tvdb';
import { getFeatured } from '@/lib/featured';
import { json, fail } from '@/lib/respond';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    return json(await getFeatured(), 60 * 60 * 24);
  } catch (err) {
    const e = err as TvdbError;
    return fail(e.message || 'Failed to load featured shows.', e.status || 502);
  }
};
