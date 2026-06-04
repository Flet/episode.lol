import type { APIRoute } from 'astro';
import { searchSeries, seriesExtended, TvdbError } from '@/lib/tvdb';
import { mapSearch, pickBanner } from '@/lib/map';
import { json, fail } from '@/lib/respond';
import type { ShowSummary } from '@/lib/types';

export const prerender = false;

// curated shows resolved to real TheTVDB series so the
// home page can link straight to them. Order is preserved (SVU leads the dial).
const TITLES = [
  'Law & Order: Special Victims Unit',
  'The Office',
  'Seinfeld',
  'The Simpsons',
  'Friends',
  'Breaking Bad',
  "It's Always Sunny in Philadelphia",
  'The X-Files',
  'Cheers',
  'Parks and Recreation',
];

export const GET: APIRoute = async () => {
  try {
    const resolved = await Promise.all(
      TITLES.map(async (title) => {
        try {
          const base = mapSearch(await searchSeries(title, 4))[0];
          if (!base) return null;
          let banner: string | null = null;
          try {
            const ext = await seriesExtended(base.id);
            banner = pickBanner(ext?.artworks);
          } catch {
            /* banner is optional  fall back to the text spine */
          }
          return { ...base, banner } as ShowSummary;
        } catch {
          return null;
        }
      }),
    );
    // dedupe by id, keep order
    const seen = new Set<string>();
    const featured = (resolved.filter(Boolean) as ShowSummary[]).filter((s) => {
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    });
    return json(featured, 60 * 60 * 24);
  } catch (err) {
    const e = err as TvdbError;
    return fail(e.message || 'Failed to load featured shows.', e.status || 502);
  }
};
