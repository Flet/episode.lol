import type { APIRoute } from 'astro';
import { episodeExtended, TvdbError } from '@/lib/tvdb';
import { mapEpisodeDetail } from '@/lib/map';
import { json, fail } from '@/lib/respond';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const id = params.id?.trim();
  if (!id) return fail('Missing episode id.', 400);
  try {
    const raw = await episodeExtended(id);
    return json(mapEpisodeDetail(raw), 60 * 60 * 24);
  } catch (err) {
    const e = err as TvdbError;
    return fail(e.message || 'Failed to load episode.', e.status || 502);
  }
};
