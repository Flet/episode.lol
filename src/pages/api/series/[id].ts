import type { APIRoute } from 'astro';
import { seriesExtended, seriesEpisodes, TvdbError } from '@/lib/tvdb';
import { mapSeriesDetail, mapEpisodeSummary } from '@/lib/map';
import { json, fail } from '@/lib/respond';
import type { EpisodeSummary, SeriesResponse } from '@/lib/types';

export const prerender = false;

const MAX_PAGES = 25;

export const GET: APIRoute = async ({ params }) => {
  const id = params.id?.trim();
  if (!id) return fail('Missing series id.', 400);

  try {
    // Pull all aired episodes (paged) + the extended record (cast, artwork, genres).
    const episodes: EpisodeSummary[] = [];
    let extendedRaw: any = null;

    for (let page = 0; page < MAX_PAGES; page++) {
      const data = await seriesEpisodes(id, page);
      if (page === 0) extendedRaw = data?.series ?? null;
      const batch: any[] = Array.isArray(data?.episodes) ? data.episodes : [];
      if (batch.length === 0) break;
      for (const e of batch) {
        const ep = mapEpisodeSummary(e);
        // skip "specials" (season 0) from the random pool, but keep real episodes
        if (ep.season > 0) episodes.push(ep);
      }
      if (batch.length < 100) break; // last page
    }

    // Extended record for richer detail (artwork/banner for the VHS tape, cast, genres).
    let detailRaw = extendedRaw;
    try {
      detailRaw = await seriesExtended(id);
    } catch {
      /* fall back to the lighter record from the episodes call */
    }

    const detail = mapSeriesDetail(detailRaw ?? { id }, episodes.length);
    const body: SeriesResponse = { detail, episodes };
    return json(body, 60 * 60 * 24);
  } catch (err) {
    const e = err as TvdbError;
    return fail(e.message || 'Failed to load series.', e.status || 502);
  }
};
