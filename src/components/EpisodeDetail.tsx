import { useState } from 'react';
import type { SeriesDetail, EpisodeDetail as EpDetail } from '@/lib/types';
import VHSTape from './VHSTape';

interface Props {
  show: SeriesDetail;
  ep: EpDetail;
  indexInSeries?: number; // 1-based
  favorited: boolean;
  onToggleFavorite: () => void;
}

const pad = (n: number) => String(n).padStart(2, '0');
const initials = (name: string) =>
  name.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');

export default function EpisodeDetail({
  show, ep, indexInSeries, favorited, onToggleFavorite,
}: Props) {
  const [copied, setCopied] = useState(false);
  const still = ep.image || show.banner || show.poster || null;
  const airedYear = ep.aired ? new Date(ep.aired).getFullYear() : null;
  const airedNice = ep.aired
    ? new Date(ep.aired).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : '-';

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* ignore */ }
  };
  // TheTVDB dereferrer resolves an episode id straight to its canonical page.
  const tvdb = `https://www.thetvdb.com/dereferrer/episode/${ep.id}`;
  const imdbPerson = (name: string) => `https://www.imdb.com/find/?q=${encodeURIComponent(name)}&s=nm`;
  const peopleLinks = (names: string[]) =>
    names.map((n, i) => (
      <span key={`${n}-${i}`}>
        {i > 0 ? ', ' : ''}
        <a href={imdbPerson(n)} target="_blank" rel="noreferrer">{n}</a>
      </span>
    ));

  return (
    <div className="detail">
      <VHSTape
        className="ep-tape"
        title={show.name}
        poster={show.poster}
        posterBack={show.posterAlt}
        banner={show.banner}
        enableFlip
        hint="Drag to spin · tap to flip"
      />
      <div className="detail-hero">
        {still ? <div className="still"><img src={still} alt={`${show.name} — ${ep.name || `Episode ${ep.number}`} still`} /></div> : <div className="still" />}
        <div className="hero-grad" />
        <div className="hero-osd"><span className="pulse">●</span> NOW PLAYING{ep.runtime ? ` · ${ep.runtime} MIN` : ''}</div>
        {ep.rating != null && (
          <div className="rating-badge"><b>{ep.rating}</b><small>★ TVDB</small></div>
        )}

        <div className="hero-title">
          <span className="se">S{pad(ep.season)} · E{pad(ep.number)}</span>
          <div className="show">{show.name}{airedYear ? ` (${airedYear})` : ''}</div>
          <h2>{ep.name || `Episode ${ep.number}`}</h2>
        </div>
      </div>

      <div className="detail-body">
        <div className="detail-main">
          {ep.overview && (
            <div className="section-block">
              <div className="lab">▸ Overview</div>
              <p>{ep.overview}</p>
            </div>
          )}

          {(ep.directors.length > 0 || ep.writers.length > 0) && (
            <div className="section-block">
              <div className="lab">▸ Credits</div>
              <div className="credit-grid">
                {ep.directors.length > 0 && (
                  <div className="who"><b>Directed by</b>{peopleLinks(ep.directors)}</div>
                )}
                {ep.writers.length > 0 && (
                  <div className="who"><b>Written by</b>{peopleLinks(ep.writers)}</div>
                )}
              </div>
            </div>
          )}

          {ep.guests.length > 0 && (
            <div className="section-block">
              <div className="lab">▸ Guest Stars</div>
              <p>{peopleLinks(ep.guests.map((g) => g.name))}</p>
            </div>
          )}

        </div>

        <aside className="info-panel">
          <div className="ipt">◍ Episode Info</div>
          <div className="irow"><span className="k">First Aired</span><span className="v">{airedNice}</span></div>
          {ep.runtime != null && <div className="irow"><span className="k">Runtime</span><span className="v">{ep.runtime} min</span></div>}
          {(ep.network || show.network) && <div className="irow"><span className="k">Network</span><span className="v">{ep.network || show.network}</span></div>}
          <div className="irow"><span className="k">Season</span><span className="v">{ep.season}</span></div>
          <div className="irow"><span className="k">Episode</span><span className="v">{ep.number}</span></div>
          {ep.productionCode && <div className="irow"><span className="k">Prod. Code</span><span className="v">{ep.productionCode}</span></div>}
          {ep.rating != null && <div className="irow"><span className="k">Rating</span><span className="v">★ {ep.rating}</span></div>}
          {show.genres.length > 0 && (
            <div className="genre-tags">{show.genres.slice(0, 4).map((g) => <span key={g}>{g}</span>)}</div>
          )}
          {indexInSeries && show.episodeCount > 0 && (
            <div className="progress">
              <div className="irow" style={{ paddingBottom: 4 }}><span className="k">In the series</span></div>
              <div className="bar"><i style={{ width: `${Math.round((indexInSeries / show.episodeCount) * 100)}%` }} /></div>
              <small>Episode {indexInSeries} of {show.episodeCount}</small>
            </div>
          )}
        </aside>
      </div>

      {show.cast.length > 0 && (
        <div className="section-block cast-wide">
          <div className="lab">▸ Cast</div>
          <div className="cast-row">
            {show.cast.map((c, i) => (
              <a
                className="cast-card"
                key={`${c.name}-${i}`}
                href={imdbPerson(c.name)}
                target="_blank"
                rel="noreferrer"
                title={`Find ${c.name} on IMDb`}
              >
                <div className="avatar">
                  {c.image ? <img src={c.image} alt={c.name} loading="lazy" /> : initials(c.name)}
                </div>
                <div className="actor">{c.name}</div>
                {c.role && <div className="role">{c.role}</div>}
              </a>
            ))}
          </div>
        </div>
      )}
          <div className="action-strip">
            <button className={favorited ? 'on' : ''} onClick={onToggleFavorite}>
              {favorited ? '♥ FAVORITED' : '♡ FAVORITE'}
            </button>
            <button onClick={share}>{copied ? '✓ COPIED' : '∞ SHARE PICK'}</button>
            <a className="action-strip-link" href={tvdb} target="_blank" rel="noreferrer">
              <button>↗ TVDB</button>
            </a>
          </div>
    </div>
  );
}
