// ---------------------------------------------------------------------------
// TheTVDB v4 server-side client.
// Runs only inside Netlify Functions (/api/* endpoints) so the API key and
// bearer token never reach the browser. Token is cached in module memory and
// reused across warm invocations (valid ~1 month).
// Docs: https://thetvdb.github.io/v4-api/
// ---------------------------------------------------------------------------

const BASE = 'https://api4.thetvdb.com/v4';
const ARTWORK_HOST = 'https://artworks.thetvdb.com';

let cachedToken: string | null = null;
let tokenFetchedAt = 0;
const TOKEN_TTL_MS = 24 * 24 * 60 * 60 * 1000; // refresh well before the ~1 month expiry

export class TvdbError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.name = 'TvdbError';
    this.status = status;
  }
}

function creds() {
  const apikey = import.meta.env.TVDB_API_KEY ?? process.env.TVDB_API_KEY;
  const pin = import.meta.env.TVDB_PIN ?? process.env.TVDB_PIN;
  if (!apikey) {
    throw new TvdbError(
      'TVDB_API_KEY is not set. Add it in Netlify → Site settings → Environment variables.',
      500,
    );
  }
  return { apikey, pin: pin || undefined };
}

async function login(): Promise<string> {
  const { apikey, pin } = creds();
  const res = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pin ? { apikey, pin } : { apikey }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new TvdbError(`TheTVDB login failed (${res.status}). ${body}`.trim(), 502);
  }
  const json = (await res.json()) as { data?: { token?: string } };
  const token = json?.data?.token;
  if (!token) throw new TvdbError('TheTVDB login returned no token.', 502);
  cachedToken = token;
  tokenFetchedAt = Date.now();
  return token;
}

async function token(): Promise<string> {
  if (cachedToken && Date.now() - tokenFetchedAt < TOKEN_TTL_MS) return cachedToken;
  return login();
}

/** Authenticated GET against the v4 API with one automatic re-login on 401. */
async function get<T = unknown>(path: string, retry = true): Promise<T> {
  const t = await token();
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${t}`, Accept: 'application/json' },
  });
  if (res.status === 401 && retry) {
    cachedToken = null;
    return get<T>(path, false);
  }
  if (res.status === 404) throw new TvdbError('Not found on TheTVDB.', 404);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new TvdbError(`TheTVDB request failed (${res.status}). ${body}`.trim(), 502);
  }
  const json = (await res.json()) as { data?: T };
  return json.data as T;
}

/** Normalise possibly-relative artwork paths to absolute URLs. */
export function img(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${ARTWORK_HOST}${url.startsWith('/') ? '' : '/'}${url}`;
}

// ---- Raw endpoint wrappers (return TheTVDB's `data` payload) ----------------

export interface TvdbSearchResult {
  tvdb_id?: string;
  id?: string;
  name?: string;
  image_url?: string;
  overview?: string;
  year?: string;
  network?: string;
  country?: string;
  primary_language?: string;
}

export function searchSeries(query: string, limit = 24) {
  const qs = new URLSearchParams({ query, type: 'series', limit: String(limit) });
  return get<TvdbSearchResult[]>(`/search?${qs.toString()}`);
}

export function seriesBase(id: string | number) {
  return get<any>(`/series/${id}`);
}

export function seriesExtended(id: string | number) {
  return get<any>(`/series/${id}/extended?meta=translations&short=false`);
}

export function seriesEpisodes(id: string | number, page = 0, seasonType = 'default') {
  return get<any>(`/series/${id}/episodes/${seasonType}?page=${page}`);
}

export function episodeExtended(id: string | number) {
  return get<any>(`/episodes/${id}/extended`);
}
