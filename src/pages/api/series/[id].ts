import type { APIRoute } from 'astro';
import { TvdbError } from '@/lib/tvdb';
import { getSeriesData } from '@/lib/series';
import { json, fail } from '@/lib/respond';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const id = params.id?.trim();
  if (!id) return fail('Missing series id.', 400);

  try {
    const body = await getSeriesData(id);
    return json(body, 60 * 60 * 24);
  } catch (err) {
    const e = err as TvdbError;
    return fail(e.message || 'Failed to load series.', e.status || 502);
  }
};
