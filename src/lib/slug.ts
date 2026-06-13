// URL helpers for human-readable, keyword-bearing paths.
// Scheme is hybrid slug + id: the slug is cosmetic (good for SEO/readability)
// while the trailing numeric TheTVDB id is the canonical, load-bearing token.
//   series   -> /series/breaking-bad-70572
//   episode  -> /series/breaking-bad-70572/s01e05-pilot
// Because the id is always the final token, slugs can drift (shows get renamed)
// without breaking the URL, and there's no extra lookup to resolve a slug.

const pad = (n: number) => String(n).padStart(2, '0');

/** lowercase, strip diacritics, collapse non-alphanumerics to single dashes. */
export function slugify(input: string | null | undefined): string {
  return (input ?? '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // drop combining diacritical marks
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** /series/{slug}-{id} (falls back to /series/{id} when there's no usable name). */
export function seriesPath(id: string | number, name?: string | null): string {
  const s = slugify(name);
  return s ? `/series/${s}-${id}` : `/series/${id}`;
}

export interface EpisodeRef {
  season: number;
  number: number;
  name?: string | null;
}

/** /series/{slug}-{id}/s{SS}e{EE}-{episode-slug} */
export function episodePath(
  id: string | number,
  name: string | null | undefined,
  ep: EpisodeRef,
): string {
  const code = `s${pad(ep.season)}e${pad(ep.number)}`;
  const epSlug = slugify(ep.name);
  return `${seriesPath(id, name)}/${epSlug ? `${code}-${epSlug}` : code}`;
}

/** Pull the canonical numeric id from the trailing token of a series param. */
export function parseSeriesParam(param: string | undefined): string | null {
  if (!param) return null;
  const m = param.match(/(\d+)$/);
  return m ? m[1] : null;
}

/** Parse the `s01e05-...` episode token into a season/number pair. */
export function parseEpisodeParam(
  param: string | undefined,
): { season: number; number: number } | null {
  if (!param) return null;
  const m = param.match(/^s(\d+)e(\d+)/i);
  if (!m) return null;
  return { season: Number(m[1]), number: Number(m[2]) };
}
