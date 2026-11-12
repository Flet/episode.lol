// Shout-outs: the sister projects and podcasts we link out to. Shared by the
// big homepage cards (Home.tsx) and the compact strip on series/episode pages
// (ShoutStrip.astro) so the links and tracking stay in one place.

export type ShoutId = 'cinequote' | 'unkindrewind' | 'munch';
export type ShoutPlacement = 'home' | 'series' | 'episode';

export interface Shout {
  id: ShoutId;
  name: string;
  /** Bare domain shown in the call to action. */
  domain: string;
  url: string;
  /** Small logo used by the compact strip. */
  thumb: string;
  thumbWidth: number;
  thumbHeight: number;
  blurb: string;
}

export const SHOUTS: Record<ShoutId, Shout> = {
  cinequote: {
    id: 'cinequote',
    name: 'CineQuote',
    domain: 'cinequote.net',
    url: 'https://cinequote.net/',
    thumb: '/shout/cinequote.webp',
    thumbWidth: 360,
    thumbHeight: 86,
    blurb: 'Guess the movie in five audio quotes or less. New game every morning.',
  },
  unkindrewind: {
    id: 'unkindrewind',
    name: 'Unkind Rewind',
    domain: 'unkindrewind.com',
    url: 'https://unkindrewind.com/',
    thumb: '/shout/unkindrewind.webp',
    thumbWidth: 192,
    thumbHeight: 192,
    blurb: 'The podcast that revisits (and potentially ruins) the beloved movies of our youth.',
  },
  munch: {
    id: 'munch',
    name: 'Munch My Benson',
    domain: 'munchmybenson.com',
    url: 'https://www.munchmybenson.com/',
    thumb: '/shout/munch.webp',
    thumbWidth: 360,
    thumbHeight: 163,
    blurb: 'The podcast that inspired this site: Adam and Josh marvel at a random Law & Order: SVU episode.',
  },
};

/**
 * Outbound link for a shout-out, tagged so the destination's analytics can
 * attribute the visit to episode.lol and to the page type it came from.
 */
export const shoutHref = (id: ShoutId, placement: ShoutPlacement): string => {
  const url = new URL(SHOUTS[id].url);
  url.searchParams.set('utm_source', 'episode.lol');
  url.searchParams.set('utm_medium', 'referral');
  url.searchParams.set('utm_campaign', 'shoutout');
  url.searchParams.set('utm_content', placement);
  return url.toString();
};

/**
 * The compact strip's line-up, in display order. Munch My Benson leads: the
 * podcast is why the site exists.
 */
export const STRIP_SHOUTS: Shout[] = [SHOUTS.munch, SHOUTS.cinequote, SHOUTS.unkindrewind];
