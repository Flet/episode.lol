// Shared series loader: pulls the extended record + all aired episodes from
// TheTVDB and maps them to app types. Consumed by both the /api/series/[id]
// JSON endpoint and the server-rendered series page, so the two never diverge.
import { seriesExtended, seriesEpisodes } from './tvdb';
import { mapSeriesDetail, mapEpisodeSummary } from './map';
import type { EpisodeSummary, SeriesResponse } from './types';

export async function getSeriesData(id: string): Promise<SeriesResponse> {
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

  // Extended record for richer detail (artwork/banner, cast, genres, slug).
  let detailRaw = extendedRaw;
  try {
    detailRaw = await seriesExtended(id);
  } catch {
    /* fall back to the lighter record from the episodes call */
  }

  const detail = mapSeriesDetail(detailRaw ?? { id }, episodes.length);
  return { detail, episodes };
}
