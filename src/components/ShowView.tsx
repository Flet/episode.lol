import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import type { PointerEvent as ReactPointerEvent, KeyboardEvent as ReactKeyboardEvent } from 'react';
import type { SeriesResponse, SeriesDetail, EpisodeSummary, EpisodeDetail as EpDetail } from '@/lib/types';
import VHSTape from './VHSTape';
import EpisodeDetail from './EpisodeDetail';
import { addPick, addRecentShow, isFavorite, toggleFavorite } from '@/lib/storage';
import { seriesPath, episodePath } from '@/lib/slug';

interface Props {
  seriesId: string;
  initialEp?: string | null;
  // server-fetched data (SSR): when present the island skips its own /api fetch
  initialData?: SeriesResponse | null;
  initialPicked?: EpDetail | null;
}
const rand = (n: number) => Math.floor(Math.random() * n);

export default function ShowView({ seriesId, initialEp, initialData = null, initialPicked = null }: Props) {
  const [detail, setDetail] = useState<SeriesDetail | null>(initialData?.detail ?? null);
  const [episodes, setEpisodes] = useState<EpisodeSummary[]>(initialData?.episodes ?? []);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [season, setSeason] = useState<number | 'all'>('all');

  const [revealing, setRevealing] = useState(false);
  const [flash, setFlash] = useState<{ show: string; title: string; meta: string }>({ show: '', title: '', meta: '' });
  const [picked, setPicked] = useState<EpDetail | null>(initialPicked);
  const [favorited, setFavorited] = useState(false);
  const detailRef = useRef<HTMLDivElement>(null);
  const tapStart = useRef<{ x: number; y: number; t: number } | null>(null);

  const seasons = useMemo(
    () => Array.from(new Set(episodes.map((e) => e.season))).sort((a, b) => a - b),
    [episodes],
  );
  const pool = useMemo(
    () => (season === 'all' ? episodes : episodes.filter((e) => e.season === season)),
    [episodes, season],
  );

  const loadEpisode = useCallback(async (epId: string, show: SeriesDetail) => {
    const res = await fetch(`/api/episode/${epId}`);
    if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || 'Could not load episode.');
    const ep = (await res.json()) as EpDetail;
    setPicked(ep);
    setFavorited(isFavorite(ep.id));
    addPick({
      epId: ep.id, seriesId: show.id, seriesName: show.name,
      title: ep.name || `Episode ${ep.number}`, season: ep.season, number: ep.number, ts: Date.now(),
    });
    window.history.replaceState({}, '', episodePath(show.id, show.name, ep));
    return ep;
  }, []);

  // initial series load
  useEffect(() => {
    // SSR path: the page already fetched the series (and maybe the episode), so
    // just record history/favorites client-side and skip the network round-trip.
    if (initialData) {
      addRecentShow({ id: initialData.detail.id, name: initialData.detail.name, poster: initialData.detail.poster, banner: initialData.detail.banner });
      if (initialPicked) {
        setFavorited(isFavorite(initialPicked.id));
        addPick({
          epId: initialPicked.id, seriesId: initialData.detail.id, seriesName: initialData.detail.name,
          title: initialPicked.name || `Episode ${initialPicked.number}`,
          season: initialPicked.season, number: initialPicked.number, ts: Date.now(),
        });
      }
      return;
    }

    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/series/${seriesId}`);
        if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || 'Could not load show.');
        const data = (await res.json()) as SeriesResponse;
        if (!alive) return;
        setDetail(data.detail);
        setEpisodes(data.episodes);
        addRecentShow({ id: data.detail.id, name: data.detail.name, poster: data.detail.poster, banner: data.detail.banner });
        if (initialEp) {
          try { await loadEpisode(initialEp, data.detail); } catch { /* ignore bad deep link */ }
        }
      } catch (e) {
        if (alive) setError((e as Error).message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [seriesId, initialEp, initialData, initialPicked, loadEpisode]);

  const spin = useCallback(async () => {
    if (!detail || pool.length === 0 || revealing) return;
    setRevealing(true);
    const SPIN_MS = 3000; // matches the tape-spin CSS duration
    const started = Date.now();
    const chosen = pool[rand(pool.length)];
    const showFlash = (e: EpisodeSummary) =>
      setFlash({ show: detail.name, title: e?.name || `Episode ${e?.number ?? ''}`, meta: `S${e?.season} · E${e?.number}` });

    // Title flashes that DECELERATE to match the tape easing to a stop:
    // delay grows from ~55ms to ~620ms as the spin winds down, then lands on the pick.
    let flashTimer: ReturnType<typeof setTimeout>;
    let stopped = false;
    const flashStep = () => {
      const t = Math.min(1, (Date.now() - started) / SPIN_MS);
      if (stopped || t >= 1) { showFlash(chosen); return; }
      showFlash(pool[rand(pool.length)]);
      const delay = 55 + 600 * Math.pow(t, 2.4);
      flashTimer = setTimeout(flashStep, delay);
    };
    flashTimer = setTimeout(flashStep, 55);

    try {
      const ep = await loadEpisode(chosen.id, detail);
      await new Promise((r) => setTimeout(r, Math.max(0, SPIN_MS + 150 - (Date.now() - started))));
      stopped = true;
      clearTimeout(flashTimer);
      setRevealing(false);
      setTimeout(() => detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
      void ep;
    } catch (e) {
      stopped = true;
      clearTimeout(flashTimer);
      setRevealing(false);
      setError((e as Error).message);
    }
  }, [detail, pool, revealing, loadEpisode]);

  // Reveal-page tape: tap (click) or horizontal flick triggers the spin.
  const onTapStart = (e: ReactPointerEvent) => {
    tapStart.current = { x: e.clientX, y: e.clientY, t: performance.now() };
  };
  const onTapEnd = (e: ReactPointerEvent) => {
    const s = tapStart.current;
    tapStart.current = null;
    if (!s || revealing) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    const dt = Math.max(1, performance.now() - s.t);
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const tap = absX < 10 && absY < 10; // plain click/tap
    const flick = absX > 28 && absX > absY * 1.4 && absX / dt > 0.35; // horizontal flick
    if (tap || flick) spin();
  };
  const onTapKey = (e: ReactKeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      spin();
    }
  };

  const onToggleFav = () => {
    if (!picked || !detail) return;
    const { favorited: f } = toggleFavorite({
      epId: picked.id, seriesId: detail.id, seriesName: detail.name,
      title: picked.name || `Episode ${picked.number}`, season: picked.season, number: picked.number,
    });
    setFavorited(f);
  };

  const indexInSeries = useMemo(() => {
    if (!picked) return undefined;
    const i = episodes.findIndex((e) => e.id === picked.id);
    return i >= 0 ? i + 1 : undefined;
  }, [episodes, picked]);

  if (loading) return <div className="spinner" aria-label="Loading show" />;
  if (error) return <p className="notice err">⚠ {error}</p>;
  if (!detail) return null;

  return (
    <div>
      {/* series-page state: tape on top, PICK button below (the tape spins when pressed) */}
      {(!picked || revealing) && (
        <div className="pick-zone">
          <div
            className="tape-tap"
            role="button"
            tabIndex={0}
            aria-label="Pick a random episode"
            onPointerDown={onTapStart}
            onPointerUp={onTapEnd}
            onPointerCancel={() => { tapStart.current = null; }}
            onKeyDown={onTapKey}
          >
            <VHSTape
              className="tape-reveal"
              title={flash.show || detail.name}
              poster={detail.poster}
              posterBack={detail.posterAlt}
              banner={detail.banner}
              spinning={revealing}
              hint="Tap or flick the tape to pick"
            />
          </div>
          {revealing ? (
            <div className="reveal">
              <div className="ep-show">{flash.show}</div>
              <div className="ep-title">{flash.title}</div>
              <div className="ep-meta">{flash.meta}</div>
              <div className="hint">▶ tuning in…</div>
            </div>
          ) : (
            <>
              <button className="pick-btn" onClick={spin} disabled={pool.length === 0}>
                ▶ PICK A RANDOM EPISODE
              </button>
              {seasons.length > 1 && (
                <div className="filter-row">
                  <span>Limit to</span>
                  <select
                    value={String(season)}
                    onChange={(e) => setSeason(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  >
                    <option value="all">any season</option>
                    {seasons.map((s) => <option key={s} value={s}>Season {s}</option>)}
                  </select>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* picked: details + a big PICK AGAIN that returns to the series page */}
      {picked && !revealing && (
        <>
          <div ref={detailRef} style={{ marginTop: 18 }}>
            <EpisodeDetail
              show={detail}
              ep={picked}
              indexInSeries={indexInSeries}
              favorited={favorited}
              onToggleFavorite={onToggleFav}
            />
          </div>
          <div className="dial-zone">
            <a className="pick-btn" href={seriesPath(detail.id, detail.name)}>↻ PICK AGAIN</a>
            <a className="pick-btn" href={`/`}>HOME</a>
          </div>
        </>
      )}
    </div>
  );
}
