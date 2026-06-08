import type { APIRoute } from 'astro';
import { seriesExtended, seriesEpisodes, TvdbError } from '@/lib/tvdb';
import { mapSeriesDetail, mapEpisodeSummary } from '@/lib/map';
import { json, fail } from '@/lib/respond';
import type { EpisodeSummary, SeriesResponse } from '@/lib/types';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const id = params.id?.trim();
  if (!id) return fail('Missing series id.', 400);

  try {
    // Pull all aired episodes (paged) + the extended record (cast, artwork, genres).
    const episodes: EpisodeSummary[] = [];
    let extendedRaw: any = null;

    // Follow TheTVDB's own pagination (`links.next`) until there are no more pages.
    for (let page = 0; ; page++) {
      const data = await seriesEpisodes(id, page);
      if (page === 0) extendedRaw = data?.series ?? null;
      const batch: any[] = Array.isArray(data?.episodes) ? data.episodes : [];
      for (const e of batch) {
        const ep = mapEpisodeSummary(e);
        // skip "specials" (season 0) from the random pool, but keep real episodes
        if (ep.season > 0) episodes.push(ep);
      }
      if (!data.hasNext || batch.length === 0) break;
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
