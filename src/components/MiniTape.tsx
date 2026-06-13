// Lightweight static VHS box for dense home-page grids. A minimal real 3D box
// (front + perpendicular spine + thin top edge)  NOT the full VHSTape (no back,
// no cassette, no sheen, no float animation). Static + `will-change` lets the
// compositor cache it as one layer, so scrolling many of them stays smooth.
import type { CSSProperties } from 'react';

interface Props {
  title: string;
  poster?: string | null;
  banner?: string | null; // spine art; falls back to vertical text
  className?: string;
  style?: CSSProperties;
}

export default function MiniTape({ title, poster, banner, className, style }: Props) {
  const artLabel = title.toUpperCase();
  return (
    <div className={`mini-tape ${className ?? ''}`} style={style}>
      <div className="mt-box">
        {/* FRONT = poster sleeve */}
        <div className="mt-front">
          {poster ? <img className="mt-poster" src={poster} alt={`${title} poster`} loading="lazy" /> : null}
          <div className="mt-band">★ VHS · episode.lol ★</div>
          {!poster ? <div className="mt-art">{artLabel}</div> : <div className="mt-art" />}
        </div>
        {/* SPINE = banner (rotated). Both sides rendered; whichever faces the
            viewer at this angle shows (the other is hidden via backface). */}
        <div className="mt-spine mt-spine-r">
          <div className="mt-spine-inner">
            <div className="mt-sp-band" />
            {banner ? (
              <img className="mt-spine-img" src={banner} alt={`${title} banner`} loading="lazy" />
            ) : (
              <span className="mt-sp-title">{artLabel} · episode.lol</span>
            )}
            {banner ? <div className="mt-vhs-logo"><span>VHS</span></div> : null}
          </div>
        </div>
        <div className="mt-spine mt-spine-l">
          <div className="mt-spine-inner">
            <div className="mt-sp-band" />
            {banner ? (
              <img className="mt-spine-img" src={banner} alt={`${title} banner`} loading="lazy" />
            ) : (
              <span className="mt-sp-title">{artLabel} · episode.lol</span>
            )}
            {banner ? <div className="mt-vhs-logo"><span>VHS</span></div> : null}
          </div>
        </div>
        {/* thin top edge for depth */}
        <div className="mt-top" />
      </div>
    </div>
  );
}
