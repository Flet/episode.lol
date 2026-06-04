import { useEffect, useState, useCallback } from 'react';
import type { FormEvent } from 'react';
import type { ShowSummary } from '@/lib/types';
import MiniTape from './MiniTape';
import {
  addSearch,
  getPicks,
  getRecentShows,
  getFavorites,
  toggleFavorite,
  type Pick,
  type RecentShow,
  type Favorite,
} from '@/lib/storage';

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ShowSummary[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentShows, setRecentShows] = useState<RecentShow[]>([]);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [featured, setFeatured] = useState<ShowSummary[]>([]);

  const runSearch = useCallback(async (q: string) => {
    const term = q.trim();
    if (!term) return;
    setLoading(true);
    setError(null);
    setResults(null);
    const url = new URL(window.location.href);
    url.searchParams.set('q', term);
    window.history.replaceState({}, '', url);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || 'Search failed.');
      const data = (await res.json()) as ShowSummary[];
      setResults(data);
      addSearch(term);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setRecentShows(getRecentShows());
    setPicks(getPicks());
    setFavorites(getFavorites());
    fetch('/api/featured')
      .then((r) => (r.ok ? r.json() : []))
      .then((d: ShowSummary[]) => setFeatured(Array.isArray(d) ? d : []))
      .catch(() => {});
    const initial = new URL(window.location.href).searchParams.get('q');
    if (initial) {
      setQuery(initial);
      runSearch(initial);
    }
  }, [runSearch]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    runSearch(query);
  };

  const removeFav = (f: Favorite) => {
    const { next } = toggleFavorite(f);
    setFavorites(next);
  };

  const clearResults = () => {
    setResults(null);
    setError(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('q');
    window.history.replaceState({}, '', url);
  };

  return (
    <div>
        <p className="hint">Pick a random episode from a TV show!</p>

      <div className="tuner">
        <form className="searchbar" onSubmit={onSubmit} role="search">
          <label className="clip" htmlFor="show">Search for a show</label>
          <input
            id="show"
            name="show"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter a show name…"
            autoComplete="off"
          />
          <button type="submit">🔎 FIND</button>
        </form>
      </div>

      {loading && <div className="spinner" aria-label="Searching" />}
      {error && <p className="notice err">⚠ {error}</p>}

      {/* search results */}
      {results && !loading && (
        <section style={{ marginTop: 18 }}>
          <span className="eyebrow">Search Results</span>
          {results.length > 0 && (
            <button className="chip" style={{ float: 'right' }} onClick={clearResults}>← back</button>
          )}
          <h2 className="sec-title">{results.length} result{results.length === 1 ? '' : 's'} for “{query}”</h2>
          {results.length === 0 ? (
            <p className="notice">No shows found. Try another title.</p>
          ) : (
            <div className="tape-grid">
              {results.map((s) => (
                <a key={s.id} className="tape-cell" href={`/series/${s.id}`}>
                  <MiniTape title={s.name} poster={s.poster} banner={s.banner} />
                  <div className="tape-cap">
                    {s.name}
                    {s.year && <span className="meta">{s.year}</span>}
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>
      )}

      {/* idle dashboard */}
      {!results && !loading && (
        <>
          {favorites.length > 0 && (
            <section style={{ marginTop: 18 }}>
              <span className="eyebrow">Your Favorites</span>
              <div className="cards" style={{ marginTop: 10 }}>
                {favorites.map((f) => (
                  <div className="mini fav" key={f.epId}>
                    <a href={`/series/${f.seriesId}?ep=${f.epId}`}>
                      <h3>{f.title}</h3>
                      <p>{f.seriesName} · S{f.season} E{f.number}</p>
                    </a>
                    <button className="fav-x" title="Remove from favorites" onClick={() => removeFav(f)}>♥</button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {recentShows.length > 0 && (
            <section style={{ marginTop: 18 }}>
              <span className="eyebrow">Your Recent Shows</span>
              <div className="tape-grid sm" style={{ marginTop: 14 }}>
                {recentShows.map((s) => (
                  <a key={s.id} className="tape-cell" href={`/series/${s.id}`}>
                    <MiniTape title={s.name} poster={s.poster} banner={s.banner} />
                    <div className="tape-cap">{s.name}</div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {picks.length > 0 && (
            <section style={{ marginTop: 22 }}>
              <span className="eyebrow">Your Recent Picks</span>
              <div className="cards" style={{ marginTop: 10 }}>
                {picks.slice(0, 8).map((p) => (
                  <a key={p.epId} className="mini" href={`/series/${p.seriesId}?ep=${p.epId}`}>
                    <h3>{p.title}</h3>
                    <p>{p.seriesName} · S{p.season} E{p.number}</p>
                  </a>
                ))}
              </div>
            </section>
          )}

          {featured.length > 0 && (
            <section style={{ marginTop: 22 }}>
              <span className="eyebrow">Popular</span>
              <div className="tape-grid sm" style={{ marginTop: 14 }}>
                {featured.map((s) => (
                  <a key={s.id} className="tape-cell" href={`/series/${s.id}`}>
                    <MiniTape title={s.name} poster={s.poster} banner={s.banner} />
                    <div className="tape-cap">{s.name}</div>
                  </a>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <section className="shoutouts">
        <span className="eyebrow">Shout-Outs</span>
        <div className="shout-grid">
          <a className="shout-card" href="https://www.munchmybenson.com/" target="_blank" rel="noreferrer">
            <div className="shout-logo">
              <img src="/munch.webp" alt="Munch My Benson - a Law & Order: SVU podcast" loading="lazy" />
            </div>
            <p>
              <b>The inspiration.</b> episode.lol only exists because of <b>Munch My Benson</b>. Listen to Adam and Josh marvel at the insanity of a random episode of Law & Order: SVU.
            </p>
            <span className="shout-cta">▶ munchmybenson.com</span>
          </a>

          <a className="shout-card" href="https://unkindrewind.com/" target="_blank" rel="noreferrer">
            <div className="shout-logo">
              <img src="/unkindrewind.jpg" alt="Unkind Rewind podcast" loading="lazy" />
            </div>
            <p>
             Check out <b>Unkind Rewind</b> with hosts Josh Duggan, Sean McGrath, and a special guest each week. Examining whether their favorite movies have stood the test of time, Unkind Rewind revisits (and potentially ruins) the beloved movies of our youth, one guest at a time. 
            </p>
            <span className="shout-cta">▶ unkindrewind.com</span>
          </a>
        </div>

        <div className="shout-solo">
          <a className="shout-card" href="https://cinequote.net/" target="_blank" rel="noreferrer">
            <div className="shout-logo">
              <img src="/cinequote.png" alt="CineQuote  guess the movie in five quotes or less" loading="lazy" />
            </div>
            <p>
              <b>One for the film buffs.</b> <b>CineQuote</b> challenges you to guess the
              movie in five audio quotes or less with a new game every morning. If you like a good
              daily puzzle, this one's a blast!
            </p>
            <span className="shout-cta">▶ cinequote.net</span>
          </a>
        </div>
      </section>
    </div>
  );
}
