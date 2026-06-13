// Curated "popular" shows, resolved to real TheTVDB series so the home page,
// sitemap and server-rendered popular list can all link straight to them.
// Shared by /api/featured, the home page and sitemap.xml.
import { searchSeries, seriesExtended } from './tvdb';
import { mapSearch, pickBanner } from './map';
import type { ShowSummary } from './types';

// Order is preserved (SVU leads the dial).
export const FEATURED_TITLES = [
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

export async function getFeatured(): Promise<ShowSummary[]> {
  const resolved = await Promise.all(
    FEATURED_TITLES.map(async (title) => {
      try {
        const base = mapSearch(await searchSeries(title, 4))[0];
        if (!base) return null;
        let banner: string | null = null;
        try {
          const ext = await seriesExtended(base.id);
          banner = pickBanner(ext?.artworks);
        } catch {
          /* banner is optional — fall back to the text spine */
        }
        return { ...base, banner } as ShowSummary;
      } catch {
        return null;
      }
    }),
  );
  // dedupe by id, keep order
  const seen = new Set<string>();
  return (resolved.filter(Boolean) as ShowSummary[]).filter((s) => {
    if (seen.has(s.id)) return false;
    seen.add(s.id);
    return true;
  });
}
