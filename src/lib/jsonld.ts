// Schema.org JSON-LD builders for series and episode pages. Output is injected
// into <head> as <script type="application/ld+json"> so search engines can show
// rich results (show name, cast, episode, air date, etc.).
import type { SeriesDetail, EpisodeDetail } from './types';

// Home › Series › Episode trail. BreadcrumbList IS rich-results-eligible, so
// Google can show the breadcrumb path in search results.
export function breadcrumbLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

export function tvSeriesLd(detail: SeriesDetail, url?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TVSeries',
    name: detail.name,
    ...(detail.overview ? { description: detail.overview } : {}),
    ...(detail.poster ? { image: detail.poster } : {}),
    ...(detail.genres.length ? { genre: detail.genres } : {}),
    ...(detail.episodeCount ? { numberOfEpisodes: detail.episodeCount } : {}),
    ...(detail.cast.length
      ? { actor: detail.cast.slice(0, 12).map((c) => ({ '@type': 'Person', name: c.name })) }
      : {}),
    ...(url ? { url } : {}),
  };
}

export function tvEpisodeLd(detail: SeriesDetail, ep: EpisodeDetail, url?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TVEpisode',
    ...(ep.name ? { name: ep.name } : {}),
    episodeNumber: ep.number,
    partOfSeason: { '@type': 'TVSeason', seasonNumber: ep.season },
    partOfSeries: { '@type': 'TVSeries', name: detail.name },
    ...(ep.aired ? { datePublished: ep.aired } : {}),
    ...(ep.overview ? { description: ep.overview } : {}),
    ...(ep.image ? { image: ep.image } : {}),
    ...(ep.directors.length
      ? { director: ep.directors.map((n) => ({ '@type': 'Person', name: n })) }
      : {}),
    ...(ep.writers.length
      ? { creator: ep.writers.map((n) => ({ '@type': 'Person', name: n })) }
      : {}),
    ...(url ? { url } : {}),
  };
}
