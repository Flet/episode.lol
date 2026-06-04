// Reusable 3D VHS tape. Poster -> sleeve face, banner -> spine.
// Pass `poster`/`banner` image URLs (from TheTVDB) or fall back to CSS gradients.
import { useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from 'react';

interface Props {
  title: string; // shown on the front + spine
  poster?: string | null;
  posterBack?: string | null; // alternate poster shown on the back of the sleeve
  banner?: string | null;
  ejected?: boolean;
  spinning?: boolean;
  enableFlip?: boolean; // details page: drag to rotate sideways, tap to flip front<->back
  id?: string;
  className?: string; // e.g. "tape-hero" | "tape-reveal"
  style?: CSSProperties;
  hint?: string; // tooltip on the case (defaults to the hover hint)
}

const FRONT_DEG = 32; // resting Y rotation (matches the CSS .vhs-case)
const DEG_PER_PX = 0.7; // drag sensitivity
const nearestFace = (deg: number) => Math.round((deg - FRONT_DEG) / 180) * 180 + FRONT_DEG;

export default function VHSTape({
  title,
  poster,
  posterBack,
  banner,
  ejected,
  spinning,
  enableFlip,
  id,
  className,
  style,
  hint,
}: Props) {
  const backArt = posterBack || poster;
  const artLabel = title.toUpperCase();

  // Manual rotation (details page). rotY drives the case transform inline so it
  // overrides the CSS rest/hover transforms while the user drags or flips.
  const [rotY, setRotY] = useState(FRONT_DEG);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ x: number; startRot: number; moved: boolean } | null>(null);

  const onPointerDown = (e: ReactPointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    drag.current = { x: e.clientX, startRot: rotY, moved: false };
    setDragging(true);
  };
  const onPointerMove = (e: ReactPointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 4) d.moved = true;
    setRotY(d.startRot + dx * DEG_PER_PX);
  };
  const endDrag = (e: ReactPointerEvent) => {
    const d = drag.current;
    drag.current = null;
    setDragging(false);
    if (!d) return;
    const cur = d.startRot + (e.clientX - d.x) * DEG_PER_PX;
    setRotY(d.moved ? nearestFace(cur) : d.startRot + 180); // snap, or flip on a tap
  };
  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setRotY((r) => r + 180);
    }
  };

  const caseClass = ['vhs-case', spinning ? 'spinning' : '', ejected ? 'ejected' : '', dragging ? 'dragging' : '']
    .filter(Boolean)
    .join(' ');
  const caseStyle: CSSProperties | undefined = enableFlip
    ? { transform: `rotateX(7deg) rotateY(${rotY}deg)` }
    : undefined;

  // expose the banner URL to CSS so the spine's VHS logo can tint itself to match
  const rootStyle = banner ? ({ ...style, ['--banner']: `url("${banner}")` } as CSSProperties) : style;
  const interactive = enableFlip
    ? { onPointerDown, onPointerMove, onPointerUp: endDrag, onPointerCancel: endDrag, onKeyDown, role: 'button', tabIndex: 0 }
    : {};

  return (
    <div className={`tape-stage ${className ?? ''}`} style={rootStyle} {...interactive}>
      <div className="vhs-float">
        <div className={caseClass} id={id} title={hint ?? undefined} style={caseStyle}>
          {/* FRONT = poster */}
          <div className="vface vfront">
            {poster ? <img className="poster-img" src={poster} alt="" draggable={false} /> : null}
            <div className="p-band">★ VHS · episode.lol ★</div>
            {!poster ? <div className="p-art">{artLabel}</div> : <div className="p-art" />}
            <div className="sheen" />
          </div>

          {/* BACK = alternate poster (seen as the tape spins) */}
          <div className="vface vback">
            {backArt ? <img className="poster-img" src={backArt} alt="" draggable={false} /> : <div className="p-art">{artLabel}</div>}
            <div className="wrap-band" />
            <div className="sheen" />
          </div>

          {/* SPINE = banner (rotated) on the right; left kept for backface robustness.
              Gold band wraps the label on at the top; a white VHS logo caps the bottom. */}
          <div className="vface vspine right">
            <div className="spine-inner">
              <div className="sp-band" />
              {banner ? <img className="banner-img" src={banner} alt="" draggable={false} /> : <span className="sp-title">{artLabel} · episode.lol</span>}
              {banner ? <div className="vhs-logo"><span>VHS</span></div> : null}
            </div>
          </div>
          <div className="vface vspine left">
            <div className="spine-inner">
              <div className="sp-band" />
              {banner ? <img className="banner-img" src={banner} alt="" draggable={false} /> : <span className="sp-title">{artLabel} · episode.lol</span>}
              {banner ? <div className="vhs-logo"><span>VHS</span></div> : null}
            </div>
          </div>

          <div className="vface vtop" />
          <div className="vface vbottom" />
        </div>
      </div>
    </div>
  );
}
