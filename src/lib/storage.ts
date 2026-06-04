// Small typed localStorage helpers (favorites, pick history, recent searches/shows).
// All guarded for SSR / disabled storage.

export interface Pick {
  epId: string;
  seriesId: string;
  seriesName: string;
  title: string;
  season: number;
  number: number;
  ts: number;
}
export interface Favorite {
  epId: string;
  seriesId: string;
  seriesName: string;
  title: string;
  season: number;
  number: number;
}
export interface RecentShow {
  id: string;
  name: string;
  poster?: string | null;
  banner?: string | null;
}

const KEYS = {
  picks: 'eplol.picks',
  favorites: 'eplol.favorites',
  searches: 'eplol.searches',
  shows: 'eplol.shows',
} as const;

function read<T>(key: string, fallback: T): T {
  if (typeof localStorage === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota / private mode */
  }
}

const cap = <T>(arr: T[], n: number) => arr.slice(0, n);

// ---- picks (random-pick history) ----
export const getPicks = () => read<Pick[]>(KEYS.picks, []);
export function addPick(p: Pick) {
  const next = cap([p, ...getPicks().filter((x) => x.epId !== p.epId)], 30);
  write(KEYS.picks, next);
  return next;
}

// ---- favorites ----
export const getFavorites = () => read<Favorite[]>(KEYS.favorites, []);
export const isFavorite = (epId: string) => getFavorites().some((f) => f.epId === epId);
export function toggleFavorite(f: Favorite) {
  const list = getFavorites();
  const exists = list.some((x) => x.epId === f.epId);
  const next = exists ? list.filter((x) => x.epId !== f.epId) : cap([f, ...list], 60);
  write(KEYS.favorites, next);
  return { next, favorited: !exists };
}

// ---- recent searches ----
export const getSearches = () => read<string[]>(KEYS.searches, []);
export function addSearch(q: string) {
  const t = q.trim();
  if (!t) return getSearches();
  const next = cap([t, ...getSearches().filter((x) => x.toLowerCase() !== t.toLowerCase())], 8);
  write(KEYS.searches, next);
  return next;
}
export function removeSearch(q: string) {
  const next = getSearches().filter((x) => x !== q);
  write(KEYS.searches, next);
  return next;
}

// ---- recent shows visited ----
export const getRecentShows = () => read<RecentShow[]>(KEYS.shows, []);
export function addRecentShow(s: RecentShow) {
  const next = cap([s, ...getRecentShows().filter((x) => x.id !== s.id)], 12);
  write(KEYS.shows, next);
  return next;
}
