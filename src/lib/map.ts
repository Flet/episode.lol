// Defensive mappers: TheTVDB raw payloads -> normalised app types.
// Field names in v4 vary a little by record, so we read several fallbacks.
import { img } from './tvdb';
import type {
  ShowSummary,
  SeriesDetail,
  EpisodeSummary,
  EpisodeDetail,
  Person,
} from './types';

// TheTVDB v4 series artwork type ids
const ART_BANNER = 1;
const ART_POSTER = 2;

function pickArtwork(artworks: any[] | undefined, type: number): string | null {
  if (!Array.isArray(artworks)) return null;
  const best = artworks
    .filter((a) => a?.type === type && (a?.image || a?.thumbnail))
    .sort((a, b) => (b?.score ?? 0) - (a?.score ?? 0))[0];
  return img(best?.image ?? best?.thumbnail);
}

const ratioOf = (a: any): number | null =>
  a?.width && a?.height ? a.width / a.height : null;

// The spine wants the real graphical "banner" (type 1, a ~5:1 image with a
// background) NOT a clearlogo (also wide, but a transparent logo that often
// outscores the banner). Prefer type 1, then fall back to any very-wide art.
export function pickBanner(artworks: any[] | undefined): string | null {
  if (!Array.isArray(artworks)) return null;
  const byScore = (a: any, b: any) => (b?.score ?? 0) - (a?.score ?? 0);
  const withImg = artworks.filter((a) => a?.image || a?.thumbnail);

  const banner = withImg.filter((a) => a?.type === ART_BANNER).sort(byScore)[0];
  if (banner) return img(banner.image ?? banner.thumbnail);

  // No banner on file: fall back to any very-wide artwork (avoids posters/backgrounds).
  const wide = withImg
    .filter((a) => {
      const r = ratioOf(a);
      return r !== null && r >= 2.5;
    })
    .sort(byScore)[0];
  return img(wide?.image ?? wide?.thumbnail);
}

// A second, different portrait poster for the back of the sleeve.
function pickPosterAlt(artworks: any[] | undefined, frontUrl: string | null): string | null {
  if (!Array.isArray(artworks)) return null;
  const posters = artworks
    .filter((a) => a?.image || a?.thumbnail)
    .filter((a) => {
      const r = ratioOf(a);
      return r !== null ? r > 0.5 && r < 0.85 : a?.type === ART_POSTER; // portrait
    })
    .sort((a, b) => (b?.score ?? 0) - (a?.score ?? 0))
    .map((a) => img(a.image ?? a.thumbnail));
  return posters.find((u) => u && u !== frontUrl) ?? posters[0] ?? null;
}

function networkName(raw: any): string | undefined {
  return (
    raw?.latestNetwork?.name ||
    raw?.originalNetwork?.name ||
    raw?.network ||
    (Array.isArray(raw?.companies?.network) ? raw.companies.network[0]?.name : undefined) ||
    undefined
  );
}

export function mapSearch(raw: any[]): ShowSummary[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((r) => {
      const id = String(r?.tvdb_id ?? r?.id ?? '').replace(/^series-/, '');
      if (!id) return null;
      return {
        id,
        name: r?.name ?? 'Untitled',
        year: r?.year,
        network: r?.network,
        overview: r?.overview,
        poster: img(r?.image_url ?? r?.thumbnail),
      } as ShowSummary;
    })
    .filter(Boolean) as ShowSummary[];
}

export function mapSeriesDetail(raw: any, episodeCount: number): SeriesDetail {
  const cast: Person[] = Array.isArray(raw?.characters)
    ? raw.characters
        .filter((c: any) => (c?.peopleType ?? c?.type) === 'Actor' && c?.personName)
        .sort((a: any, b: any) => (a?.sort ?? 999) - (b?.sort ?? 999))
        .slice(0, 24)
        .map((c: any) => ({
          name: c.personName,
          role: c.name || undefined,
          image: img(c.personImgURL),
        }))
    : [];

  const poster = pickArtwork(raw?.artworks, ART_POSTER) ?? img(raw?.image);
  return {
    id: String(raw?.id ?? ''),
    name: raw?.name ?? 'Untitled',
    slug: raw?.slug || undefined,
    overview: raw?.overview,
    poster,
    posterAlt: pickPosterAlt(raw?.artworks, poster),
    banner: pickBanner(raw?.artworks),
    network: networkName(raw),
    year: raw?.year ?? (raw?.firstAired ? String(raw.firstAired).slice(0, 4) : undefined),
    genres: Array.isArray(raw?.genres) ? raw.genres.map((g: any) => g?.name).filter(Boolean) : [],
    cast,
    episodeCount,
  };
}

export function mapEpisodeSummary(e: any): EpisodeSummary {
  return {
    id: String(e?.id ?? ''),
    name: e?.name ?? undefined,
    season: e?.seasonNumber ?? e?.airedSeason ?? 0,
    number: e?.number ?? e?.airedEpisodeNumber ?? 0,
    aired: e?.aired ?? e?.firstAired ?? undefined,
    image: img(e?.image),
  };
}

export function mapEpisodeDetail(raw: any): EpisodeDetail {
  const chars: any[] = Array.isArray(raw?.characters) ? raw.characters : [];
  const byType = (t: string) =>
    chars.filter((c) => (c?.peopleType ?? c?.type) === t);

  const directors = byType('Director').map((c) => c.personName).filter(Boolean);
  const writers = byType('Writer').map((c) => c.personName).filter(Boolean);
  const guests: Person[] = byType('Guest Star').map((c) => ({
    name: c.personName,
    role: c.name || undefined,
    image: img(c.personImgURL),
  }));

  const network =
    networkName(raw) ||
    (Array.isArray(raw?.networks) ? raw.networks[0]?.name : undefined);

  return {
    id: String(raw?.id ?? ''),
    seriesId: String(raw?.seriesId ?? ''),
    seriesName: raw?.seriesName,
    name: raw?.name ?? undefined,
    season: raw?.seasonNumber ?? raw?.airedSeason ?? 0,
    number: raw?.number ?? raw?.airedEpisodeNumber ?? 0,
    aired: raw?.aired ?? raw?.firstAired ?? undefined,
    runtime: raw?.runtime ?? undefined,
    overview: raw?.overview ?? undefined,
    image: img(raw?.image),
    network,
    rating: typeof raw?.score === 'number' ? raw.score : null,
    productionCode: raw?.productionCode ?? undefined,
    directors,
    writers,
    guests,
    genres: [],
  };
}
