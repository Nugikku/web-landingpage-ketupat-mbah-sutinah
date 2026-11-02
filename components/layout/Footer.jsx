// components/layout/Footer.jsx
// Footer dengan struktur grid hairline modern sesuai kode referensi,
// bagian karcis (ticket) telah dihapus, dan tema warna disesuaikan dengan Janur Tua, Santan & Kunyit.
"use client";

import * as React from "react";
import { site } from "@/data/site";
import { pesanUmum } from "@/lib/whatsapp";
import KetupatWeave from "@/components/ui/KetupatWeave";

// #region Helper Matematika & Format
export const clamp01 = (v) => (v > 0 ? (v > 1 ? 1 : v) : 0);

export const smoothstep = (edge0, edge1, x) => {
  if (edge0 === edge1) return x < edge0 ? 0 : 1;
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

export const chamfer = (tl, tr, br, bl) =>
  "polygon(" +
  [
    tl + "px 0",
    "calc(100% - " + tr + "px) 0",
    "100% " + tr + "px",
    "100% calc(100% - " + br + "px)",
    "calc(100% - " + br + "px) 100%",
    bl + "px 100%",
    "0 calc(100% - " + bl + "px)",
    "0 " + tl + "px",
  ].join(", ") +
  ")";

export const TYPE = { type: 55, hold: 2600, erase: 22, gap: 420 };

export const typeFrame = (phrases, ms, k = TYPE) => {
  const list = phrases.filter((p) => p.length > 0);
  if (!list.length) return { index: 0, text: "", phase: "gap" };
  const spans = list.map((p) => p.length * k.type + k.hold + p.length * k.erase + k.gap);
  const total = spans.reduce((a, b) => a + b, 0);
  let t = Number.isFinite(ms) && total > 0 ? ((ms % total) + total) % total : 0;
  let i = 0;
  while (i < list.length - 1 && t >= spans[i]) t -= spans[i++];
  const p = list[i];
  const typing = p.length * k.type;
  if (t < typing) return { index: i, text: p.slice(0, Math.floor(t / k.type) + 1), phase: "type" };
  t -= typing;
  if (t < k.hold) return { index: i, text: p, phase: "hold" };
  t -= k.hold;
  const erasing = p.length * k.erase;
  if (t < erasing) return { index: i, text: p.slice(0, p.length - Math.floor(t / k.erase)), phase: "erase" };
  return { index: i, text: "", phase: "gap" };
};

export const project = (theta, lon, tilt, roll) => {
  const x0 = Math.cos(theta) * Math.sin(lon);
  const y0 = Math.sin(theta);
  const z0 = Math.cos(theta) * Math.cos(lon);
  const ct = Math.cos(tilt);
  const st = Math.sin(tilt);
  const y1 = y0 * ct - z0 * st;
  const z1 = y0 * st + z0 * ct;
  const cr = Math.cos(roll);
  const sr = Math.sin(roll);
  return [x0 * cr - y1 * sr, x0 * sr + y1 * cr, z1];
};

export const diagonalStrandPath = (baseLon, dir, m, tilt, roll, cx, cy, r, steps = 64) => {
  let d = "";
  let pen = false;
  const start = -Math.PI * 0.46;
  const end = Math.PI * 0.46;
  for (let i = 0; i <= steps; i++) {
    const theta = start + (i / steps) * (end - start);
    const lon = baseLon + dir * m * theta;
    const [x, y, z] = project(theta, lon, tilt, roll);
    if (z < 0) {
      pen = false;
      continue;
    }
    d += (pen ? "L" : "M") + (cx + r * x).toFixed(1) + " " + (cy - r * y).toFixed(1);
    pen = true;
  }
  return d;
};

export const meridianPath = (lon, tilt, roll, cx, cy, r, steps = 64) => {
  return diagonalStrandPath(lon, 0, 0, tilt, roll, cx, cy, r, steps);
};
// #endregion

const CSS = `
.tsf{position:relative;container-type:inline-size;background:var(--tsf-bg);color:var(--tsf-ink);font-family:var(--tsf-sans);overflow:clip;isolation:isolate;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
.tsf *,.tsf *::before,.tsf *::after{box-sizing:border-box}
:where(.tsf) a{color:inherit;text-decoration:none}
:where(.tsf) button{font:inherit;color:inherit;background:none;border:0;padding:0;margin:0;cursor:pointer;text-align:inherit}
:where(.tsf) :focus-visible{outline:2px solid var(--tsf-accent);outline-offset:3px}
.tsf-grid{--rail:clamp(16px,2.5cqw,36px);--nav:clamp(120px,13.5cqw,190px);--line:color-mix(in srgb,var(--tsf-ink) 12%,transparent);--pad:clamp(12px,2.25cqw,30px);position:relative;display:grid;grid-template-columns:var(--rail) var(--nav) var(--rail) minmax(0,1.15fr) var(--rail) minmax(0,0.85fr) var(--rail);grid-template-rows:clamp(28px,4cqw,64px) auto clamp(20px,3cqw,40px) auto}
.tsf-vl{grid-row:1/-1;justify-self:start;width:0;border-left:1px solid var(--line);pointer-events:none}
.tsf-hl{grid-column:1/-1;align-self:start;height:0;border-top:1px solid var(--line);pointer-events:none}

/* Navigasi Indeks Kiri */
.tsf-nav{grid-column:2;grid-row:2;position:relative}
.tsf-nav ol{list-style:none;margin:0;padding:0;position:relative}
.tsf-nav li{border-bottom:1px solid var(--line)}
.tsf-nav-item{position:relative;display:flex;align-items:center;gap:clamp(8px,1cqw,14px);width:100%;height:clamp(28px,2.8cqw,36px);padding:0 6px;font-size:clamp(11px,0.95cqw,13.5px);letter-spacing:.01em;color:color-mix(in srgb,var(--tsf-ink) 88%,transparent);transition:color .25s,background-color .25s,padding .35s cubic-bezier(.2,.8,.2,1)}
.tsf-nav-item span:first-child{color:var(--tsf-muted);font-variant-numeric:tabular-nums;transition:color .25s}
.tsf-nav-item:hover{background:color-mix(in srgb,var(--tsf-ink) 6%,transparent);padding-left:12px}
.tsf-nav-item:hover span:first-child,.tsf-nav-item[aria-current] span:first-child{color:var(--tsf-accent)}
.tsf-nav-item[aria-current]{color:var(--tsf-ink);padding-left:12px;font-weight:600}
.tsf-nav-bar{position:absolute;left:-1px;top:0;width:2px;height:clamp(28px,2.8cqw,36px);background:var(--tsf-accent);transform:translateY(calc(var(--i) * (100% + 1px)));transition:transform .45s cubic-bezier(.7,0,.2,1);pointer-events:none}

/* Hero Footer */
.tsf-hero{grid-column:4;grid-row:2;display:flex;flex-direction:column;min-width:0;padding-bottom:clamp(24px,3cqw,48px)}
.tsf-hero>:not(.tsf-eyebrow){margin-left:var(--pad);margin-right:var(--pad)}
.tsf-eyebrow{display:flex;align-items:center;gap:12px;padding-left:6px;height:clamp(26px,2.5cqw,32px);border-bottom:1px solid color-mix(in srgb,var(--tsf-ink) 30%,transparent);font-size:clamp(11px,1.05cqw,13.5px);white-space:nowrap}
.tsf-eyebrow svg{flex:none;width:12px;height:12px;max-width:none;color:var(--tsf-accent)}
.tsf-type{min-width:0;overflow:hidden;text-overflow:clip;font-weight:500;color:var(--tsf-muted)}
.tsf-caret{display:inline-block;width:.55em;height:1.05em;margin-left:2px;vertical-align:-.18em;background:var(--tsf-accent);animation:tsf-blink 1s steps(1) infinite}
.tsf-dots{flex:1;min-width:24px;height:10px;opacity:.5;background-image:radial-gradient(circle,var(--dot,var(--tsf-ink)) .85px,transparent 1.25px);background-size:6px 5px;background-position:0 0;-webkit-mask-image:linear-gradient(90deg,#000 0,#000 35%,rgba(0,0,0,.25) 50%,#000 65%,#000 100%);mask-image:linear-gradient(90deg,#000 0,#000 35%,rgba(0,0,0,.25) 50%,#000 65%,#000 100%);-webkit-mask-size:200% 100%;mask-size:200% 100%;animation:tsf-march 3.6s linear infinite}
.tsf-h{margin:clamp(24px,4.2cqw,56px) 0 0;font-family:var(--tsf-serif);font-weight:400;font-size:clamp(28px,3.4cqw,50px);line-height:1.15;letter-spacing:-.02em;color:var(--tsf-ink)}
.tsf-h span{display:block;overflow:hidden;padding-bottom:.06em;margin-bottom:-.06em}
.tsf-h span span{display:block;transform:translateY(0);transition:transform .9s cubic-bezier(.2,.8,.2,1)}
.tsf[data-seen='0'] .tsf-h span span{transform:translateY(110%)}
.tsf-p{margin:clamp(14px,1.8cqw,24px) 0 0;max-width:32em;font-size:clamp(13.5px,1.2cqw,16px);line-height:1.65;color:var(--tsf-muted)}
.tsf-cta{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:10px;margin-top:clamp(24px,5.5cqw,64px);height:clamp(44px,4.2cqw,54px);max-width:380px;background:var(--tsf-accent);color:var(--tsf-aink);font-weight:700;font-size:clamp(13px,1.1cqw,15px);letter-spacing:.02em;border-radius:9999px;overflow:hidden;transition:background-color .2s,transform .2s;box-shadow:0 2px 10px rgba(0,0,0,0.18)}
.tsf-cta:hover,.tsf-cta:focus-visible{background:#c88f14;transform:translateY(-1px)}
.tsf-cta:active{transform:translateY(1px)}
.tsf-cta>span{position:relative}
.tsf-cta svg{position:relative;width:16px;height:16px;max-width:none;transition:transform .3s ease}
.tsf-cta:hover svg,.tsf-cta:focus-visible svg{transform:translateX(3px)}

/* Bagian Samping: Orbit & Tautan */
.tsf-side{grid-column:6;grid-row:2;display:flex;flex-direction:column;min-width:0;padding-bottom:clamp(20px,2.5cqw,40px)}
.tsf-orbit{position:relative;height:clamp(110px,13cqw,180px);border-bottom:1px solid var(--line);cursor:grab;touch-action:pan-y;overflow:hidden}
.tsf-orbit:active{cursor:grabbing}
.tsf-orbit::before,.tsf-orbit::after{content:'';position:absolute;top:0;bottom:0;width:14%;background-image:radial-gradient(circle,color-mix(in srgb,var(--tsf-ink) 45%,transparent) .7px,transparent 1.1px);background-size:4px 4px;pointer-events:none}
.tsf-orbit::before{left:0;-webkit-mask-image:linear-gradient(90deg,#000,transparent);mask-image:linear-gradient(90deg,#000,transparent)}
.tsf-orbit::after{right:0;-webkit-mask-image:linear-gradient(270deg,#000,transparent);mask-image:linear-gradient(270deg,#000,transparent)}
.tsf-orbit svg{position:absolute;left:0;top:0;width:100%;height:100%;max-width:none;display:block}
.tsf-links{display:grid;grid-template-columns:repeat(var(--cols),minmax(0,1fr));gap:20px;padding:clamp(20px,2.4cqw,32px) clamp(12px,2cqw,28px) clamp(18px,2.2cqw,28px)}
.tsf-links h3{margin:0 0 clamp(12px,1.6cqw,20px);font-family:var(--tsf-serif);font-weight:400;font-size:clamp(18px,2cqw,26px);color:var(--tsf-ink)}
.tsf-links ul{list-style:none;margin:0;padding:0;display:grid;gap:clamp(5px,.6cqw,10px)}
.tsf-link{position:relative;display:inline-flex;align-items:center;font-size:clamp(13px,1.15cqw,15px);line-height:1.5;color:var(--tsf-muted);transition:color .25s,transform .35s cubic-bezier(.2,.8,.2,1)}
.tsf-link::before{content:'';position:absolute;left:-12px;top:50%;width:5px;height:5px;margin-top:-2.5px;background:var(--tsf-accent);transform:rotate(45deg) scale(0);transition:transform .3s cubic-bezier(.2,.8,.2,1)}
.tsf-link:hover,.tsf-link:focus-visible{color:var(--tsf-ink);transform:translateX(10px)}
.tsf-link:hover::before,.tsf-link:focus-visible::before{transform:rotate(45deg) scale(1)}

/* Footer Baris Bawah */
.tsf-foot{grid-column:1/-1;grid-row:4;display:grid;grid-template-columns:var(--rail) var(--nav) var(--rail) minmax(0,1fr) var(--rail) minmax(0,1fr) var(--rail);align-items:center;min-height:clamp(56px,6cqw,80px);font-size:clamp(11.5px,1cqw,13.5px)}
.tsf-copy{grid-column:2/4;padding-left:0;color:color-mix(in srgb,var(--tsf-ink) 85%,transparent);white-space:nowrap}
.tsf-foot .tsf-dots{--dot:var(--tsf-muted)}
.tsf-foot-l{grid-column:4;display:flex;padding-right:45%}
.tsf-foot-r{grid-column:6;display:flex;align-items:center;gap:clamp(14px,2.6cqw,32px);white-space:nowrap}
.tsf-foot-r>span{color:var(--tsf-muted)}
.tsf-foot-r a{position:relative;color:color-mix(in srgb,var(--tsf-ink) 85%,transparent);transition:color .2s}
.tsf-foot-r a:hover{color:var(--tsf-accent)}
.tsf-top{grid-column:7;justify-self:center;width:16px;height:16px;display:grid;place-items:center;color:var(--tsf-accent);transition:transform .6s cubic-bezier(.3,1.5,.4,1)}
.tsf-top svg{width:16px;height:16px;max-width:none}
.tsf-top:hover{transform:rotate(-90deg) scale(1.3)}

@keyframes tsf-blink{50%{opacity:0}}
@keyframes tsf-march{from{-webkit-mask-position:0 0;mask-position:0 0}to{-webkit-mask-position:-200% 0;mask-position:-200% 0}}

@container (max-width: 860px){
.tsf-grid{grid-template-columns:var(--rail) minmax(0,1fr) var(--rail);grid-template-rows:none;row-gap:0;padding-top:16px}
.tsf-vl,.tsf-hl{display:none}
.tsf-nav,.tsf-hero,.tsf-side{grid-column:2;grid-row:auto}
.tsf-nav{overflow-x:auto;scrollbar-width:none;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.tsf-nav ol{display:flex}
.tsf-nav li{border-bottom:0;border-right:1px solid var(--line);flex:none}
.tsf-nav-item{padding:0 14px;white-space:nowrap}
.tsf-nav-item:hover,.tsf-nav-item[aria-current]{padding-left:14px}
.tsf-nav-bar{display:none}
.tsf-nav-item[aria-current]{box-shadow:inset 0 -2px var(--tsf-accent)}
.tsf-hero{padding-top:24px;padding-bottom:32px}
.tsf-side{border-top:1px solid var(--line);border-bottom:1px solid var(--line);margin-bottom:24px}
.tsf-links{padding-left:14px}
.tsf-foot{grid-column:1/-1;grid-row:auto;display:flex;flex-wrap:wrap;gap:12px 20px;padding:20px var(--rail)}
.tsf-foot-l{display:none}
.tsf-foot-r{flex:1;flex-wrap:wrap;gap:12px 20px}
.tsf-foot-r .tsf-dots{display:none}
}

@media (prefers-reduced-motion: reduce){
.tsf-dots,.tsf-caret{animation:none}
.tsf-h span span,.tsf-cta::before,.tsf-nav-bar,.tsf-link,.tsf-top{transition:none}
}
`;

function Mark({ className, style }) {
  return (
    <svg viewBox="0 0 48 48" className={className} style={style} aria-hidden="true" focusable="false">
      <path fillRule="evenodd" fill="currentColor" d="M24 2 46 24 24 46 2 24Z M19.5 15.5 32 24 19.5 32.5Z" />
    </svg>
  );
}

function useReducedMotion() {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    if (typeof matchMedia === "undefined") return;
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const onMq = () => setReduced(mq.matches);
    onMq();
    mq.addEventListener("change", onMq);
    return () => mq.removeEventListener("change", onMq);
  }, []);
  return reduced;
}

function Eyebrow({ phrases, reduced, visible }) {
  const [ms, setMs] = React.useState(0);
  const msRef = React.useRef(0);
  React.useEffect(() => {
    if (reduced || !visible) return;
    const t0 = performance.now() - msRef.current;
    const id = setInterval(() => {
      msRef.current = performance.now() - t0;
      setMs(msRef.current);
    }, 40);
    return () => clearInterval(id);
  }, [reduced, visible]);

  const text = reduced ? phrases[0] ?? "" : typeFrame(phrases, ms).text;
  return (
    <div className="tsf-eyebrow">
      <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false">
        <path d="M6 1 11 6 6 11 1 6Z" fill="currentColor" />
      </svg>
      <span className="sr-only">{phrases[0]}</span>
      <span className="tsf-type" aria-hidden="true">
        {text}
        {!reduced && <span className="tsf-caret" />}
      </span>
      <span className="tsf-dots" aria-hidden="true" />
    </div>
  );
}

const WEAVE_STRANDS = 8;
const WEAVE_SLOPE = 1.35;
const TILT = 0.38;
const ROLL = -0.32;
const MAX_PACKETS = 7;

function Orbit({ reduced, visible, pulse }) {
  const boxRef = React.useRef(null);
  const svgRef = React.useRef(null);
  const paths = React.useRef([]);
  const diamonds = React.useRef([]);
  const st = React.useRef({
    spin: 0.4,
    vel: 0.12,
    drag: false,
    lastX: 0,
    lastT: 0,
    w: 1,
    h: 1,
    packets: [
      { k: 2, dir: 1, theta: -0.7, speed: 0.3, life: Infinity, size: 3.8 },
      { k: 5, dir: -1, theta: -0.2, speed: 0.26, life: Infinity, size: 3.2 },
    ],
    paint: () => {},
  });

  React.useEffect(() => {
    const s = st.current;
    if (pulse > 0 && s.packets.length < MAX_PACKETS) {
      s.packets.push({
        k: Math.floor(Math.random() * WEAVE_STRANDS),
        dir: Math.random() > 0.5 ? 1 : -1,
        theta: -1.3,
        speed: 0.8 + Math.random() * 0.4,
        life: 1,
        size: 3.6,
      });
      s.paint();
    }
  }, [pulse]);

  React.useEffect(() => {
    const svg = svgRef.current;
    const s = st.current;
    if (!svg) return;
    const paint = () => {
      const { w, h } = s;
      const cx = w * 0.54;
      const cy = h * 1.48;
      const r = Math.min(h * 1.4, w * 0.62);

      // Render 2 famili anyaman diagonal (belah ketupat 3D)
      for (let k = 0; k < WEAVE_STRANDS; k++) {
        const baseLon = s.spin + (k * 2 * Math.PI) / WEAVE_STRANDS;
        const el1 = paths.current[k];
        if (el1) {
          el1.setAttribute("d", diagonalStrandPath(baseLon, 1, WEAVE_SLOPE, TILT, ROLL, cx, cy, r));
        }
        const el2 = paths.current[WEAVE_STRANDS + k];
        if (el2) {
          el2.setAttribute("d", diagonalStrandPath(baseLon, -1, WEAVE_SLOPE, TILT, ROLL, cx, cy, r));
        }
      }

      // Render butir intan ketupat yang mengorbit pada anyaman
      for (let i = 0; i < MAX_PACKETS; i++) {
        const el = diamonds.current[i];
        const p = s.packets[i];
        if (!el) continue;
        if (!p) {
          el.setAttribute("opacity", "0");
          continue;
        }
        const dir = p.dir || 1;
        const lon = s.spin + (p.k * 2 * Math.PI) / WEAVE_STRANDS + dir * WEAVE_SLOPE * p.theta;
        const [x, y, z] = project(p.theta, lon, TILT, ROLL);
        const px = cx + r * x;
        const py = cy - r * y;
        const half = p.size || 3.5;

        if (z > 0.05 && py < h - 1 && py > -10 && px > -10 && px < w + 10) {
          el.setAttribute(
            "points",
            `${px.toFixed(1)},${(py - half).toFixed(1)} ${(px + half).toFixed(1)},${py.toFixed(1)} ${px.toFixed(1)},${(py + half).toFixed(1)} ${(px - half).toFixed(1)},${py.toFixed(1)}`
          );
          el.setAttribute("opacity", String(Math.min(1, z * 2.2)));
        } else {
          el.setAttribute("opacity", "0");
        }
      }
    };
    s.paint = paint;
    const measure = () => {
      s.w = svg.clientWidth || 1;
      s.h = svg.clientHeight || 1;
      svg.setAttribute("viewBox", "0 0 " + s.w + " " + s.h);
      paint();
    };
    const ro = new ResizeObserver(measure);
    ro.observe(svg);
    measure();
    if (reduced || !visible) return () => ro.disconnect();

    let raf = 0;
    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!s.drag) {
        s.vel += (0.12 - s.vel) * (1 - Math.exp(-dt * 1.6));
        s.spin += s.vel * dt;
      }
      for (const p of s.packets) p.theta += p.speed * dt;
      s.packets = s.packets.filter((p) => p.life === Infinity || p.theta < 1.4);
      for (const p of s.packets) {
        if (p.life === Infinity && p.theta > 1.4) p.theta -= 2.8;
      }
      paint();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [reduced, visible]);

  const onDown = (e) => {
    const s = st.current;
    s.drag = true;
    s.lastX = e.clientX;
    s.lastT = performance.now();
    s.vel = 0;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e) => {
    const s = st.current;
    if (!s.drag) return;
    const now = performance.now();
    const d = ((e.clientX - s.lastX) / s.w) * 2.4;
    s.spin += d;
    s.vel = d / Math.max(0.008, (now - s.lastT) / 1000);
    s.lastX = e.clientX;
    s.lastT = now;
    if (reduced || !visible) s.paint();
  };
  const onUp = () => {
    const s = st.current;
    s.drag = false;
    s.vel = Math.max(-6, Math.min(6, s.vel));
  };

  return (
    <div
      ref={boxRef}
      className="tsf-orbit"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      aria-hidden="true"
    >
      <svg ref={svgRef} preserveAspectRatio="none" focusable="false">
        {/* Famili 1: Jalur diagonal searah jarum */}
        {Array.from({ length: WEAVE_STRANDS }, (_, k) => (
          <path
            key={"f1-" + k}
            ref={(el) => {
              paths.current[k] = el;
            }}
            fill="none"
            stroke="var(--tsf-muted)"
            strokeOpacity={0.65}
            strokeWidth={1.2}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {/* Famili 2: Jalur diagonal berlawanan jarum */}
        {Array.from({ length: WEAVE_STRANDS }, (_, k) => (
          <path
            key={"f2-" + k}
            ref={(el) => {
              paths.current[WEAVE_STRANDS + k] = el;
            }}
            fill="none"
            stroke="var(--tsf-muted)"
            strokeOpacity={0.42}
            strokeWidth={1.2}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {/* Butir intan belah ketupat warna Kunyit */}
        {Array.from({ length: MAX_PACKETS }, (_, i) => (
          <polygon
            key={"d-" + i}
            ref={(el) => {
              diamonds.current[i] = el;
            }}
            fill="var(--tsf-accent)"
            points="0,0 0,0 0,0 0,0"
            opacity={0}
          />
        ))}
      </svg>
    </div>
  );
}

const DEFAULT_SECTIONS = [
  { label: "Beranda", href: "#" },
  { label: "Menu Ketupat", href: "#produk" },
  { label: "Tentang Kami", href: "#tentang" },
  { label: "Cara Pesan", href: "#kontak" },
  { label: "Lokasi & Peta", href: "#kontak" },
];

const DEFAULT_EYEBROW = [
  "Dapur Ketupat Tradisional",
  "Janur kelapa segar & beras pilihan",
  "Dimasak pulen, siap antar ke rumah",
];

export default function Footer({
  brand = site.nama,
  company = site.nama,
  year = new Date().getFullYear(),
  sections = DEFAULT_SECTIONS,
  defaultSection = 0,
  onSectionChange,
  eyebrow = DEFAULT_EYEBROW,
  headline = ["Ketupat pulen gurih.", "Hangat di meja Anda."],
  description = site.deskripsi,
  cta = { label: "Pesan via WhatsApp", href: pesanUmum() },
  onCtaClick,
  linkGroups = [
    {
      title: "Menu & Usaha",
      links: [
        { label: "Menu Utama", href: "#produk" },
        { label: "Tentang Dapur", href: "#tentang" },
        { label: "Cara Pemesanan", href: "#kontak" },
        { label: "Lokasi di Maps", href: site.peta },
      ],
    },
    {
      title: "Kontak & Jam",
      links: [
        { label: "WhatsApp Pemesanan", href: pesanUmum() },
        { label: site.jamBuka },
        { label: site.areaAntar },
        { label: site.alamat },
      ],
    },
  ],
  legal = [
    { label: "Bahan Alami" },
    { label: "Bersih & Halal" },
    { label: "Tanpa Pengawet" },
  ],
  // Palet Warna Sesuai design.md:
  background = "#183B22",   // Janur Tua pekat
  ink = "#F2F5EA",          // Santan (putih kehijauan lembut)
  muted = "#9EBE9F",        // Daun Pucat / hijau sage halus
  accent = "#E0A21B",       // Kunyit (aksen tombol & titik aktif)
  accentInk = "#1C2820",    // Arang Kelapa
  fontSans = "var(--font-body), 'Plus Jakarta Sans', system-ui, sans-serif",
  fontSerif = "var(--font-display), 'Young Serif', Georgia, serif",
  className = "",
}) {
  const rootRef = React.useRef(null);
  const reduced = useReducedMotion();
  const [visible, setVisible] = React.useState(false);
  const [seen, setSeen] = React.useState(false);
  const [section, setSection] = React.useState(defaultSection);
  const [pulse, setPulse] = React.useState(0);

  const text =
    description ??
    "Pesan ketupat pulen untuk keluarga, kantor, atau acara hajatan Anda. Diantar hangat dan tepat waktu.";

  React.useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        setVisible(e.isIntersecting);
        if (e.isIntersecting) setSeen(true);
      },
      { threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const pick = (i) => {
    setSection(i);
    onSectionChange?.(i);
  };

  const toTop = () => {
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  const hold = (href) => (e) => {
    if (!href || href === "#") e.preventDefault();
  };

  const vars = {
    "--tsf-bg": background,
    "--tsf-ink": ink,
    "--tsf-muted": muted,
    "--tsf-accent": accent,
    "--tsf-aink": accentInk,
    "--tsf-sans": fontSans,
    "--tsf-serif": fontSerif,
  };

  return (
    <footer
      ref={rootRef}
      className={"tsf w-full " + className}
      style={vars}
      data-seen={seen || reduced ? "1" : "0"}
      aria-label={brand}
    >
      <style>{CSS}</style>

      {/* Pembatas anyaman janur di bagian paling atas */}
      <div style={{ padding: "20px 24px 0" }}>
        <KetupatWeave variant="divider" />
      </div>

      <div className="tsf-grid">
        {[2, 3, 4, 5, 6, 7].map((c) => (
          <span key={"v" + c} className="tsf-vl" style={{ gridColumn: c }} aria-hidden="true" />
        ))}
        {[2, 3, 4].map((r) => (
          <span key={"h" + r} className="tsf-hl" style={{ gridRow: r }} aria-hidden="true" />
        ))}

        {/* Navigasi Indeks Kiri */}
        <nav className="tsf-nav" aria-label="Navigasi Footer">
          <ol>
            {sections.map((s, i) => {
              const inner = (
                <>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <span>{s.label}</span>
                </>
              );
              return (
                <li key={s.label + i}>
                  {s.href ? (
                    <a
                      href={s.href}
                      className="tsf-nav-item"
                      aria-current={section === i ? "true" : undefined}
                      onClick={(e) => {
                        hold(s.href)(e);
                        pick(i);
                      }}
                    >
                      {inner}
                    </a>
                  ) : (
                    <button
                      type="button"
                      className="tsf-nav-item"
                      aria-current={section === i ? "true" : undefined}
                      onClick={() => pick(i)}
                    >
                      {inner}
                    </button>
                  )}
                </li>
              );
            })}
          </ol>
          <span className="tsf-nav-bar" style={{ "--i": section }} aria-hidden="true" />
        </nav>

        {/* Hero Footer */}
        <div className="tsf-hero">
          <Eyebrow phrases={eyebrow} reduced={reduced} visible={visible} />
          <h2 className="tsf-h">
            {headline.map((line, i) => (
              <span key={i}>
                <span style={{ transitionDelay: 0.12 + i * 0.1 + "s" }}>{line}</span>
              </span>
            ))}
          </h2>
          <p className="tsf-p">{text}</p>
          <a
            href={cta.href ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="tsf-cta"
            onClick={() => {
              setPulse((p) => p + 1);
              onCtaClick?.();
            }}
          >
            <span>{cta.label}</span>
            <svg viewBox="0 0 14 14" aria-hidden="true" focusable="false">
              <path d="M1 7h11M7.5 2.5 12 7l-4.5 4.5" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          </a>
        </div>

        {/* Bagian Samping: Orbit & Tautan */}
        <div className="tsf-side">
          <Orbit reduced={reduced} visible={visible} pulse={pulse} />
          <div className="tsf-links" style={{ "--cols": Math.max(1, linkGroups.length) }}>
            {linkGroups.map((g) => (
              <div key={g.title}>
                <h3>{g.title}</h3>
                <ul>
                  {g.links.map((l) => (
                    <li key={l.label}>
                      {l.href ? (
                        <a href={l.href} className="tsf-link" target={l.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
                          {l.label}
                        </a>
                      ) : (
                        <span className="tsf-link" style={{ cursor: "default" }}>
                          {l.label}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Baris Bawah */}
        <div className="tsf-foot">
          <span className="tsf-copy">
            &copy; {company}, {year}. Semua hak dilindungi.
          </span>
          <span className="tsf-foot-l" aria-hidden="true">
            <span className="tsf-dots" />
          </span>
          <div className="tsf-foot-r">
            {legal.map((l) =>
              l.href ? (
                <a key={l.label} href={l.href} onClick={hold(l.href)}>
                  {l.label}
                </a>
              ) : (
                <span key={l.label}>{l.label}</span>
              )
            )}
            <span className="tsf-dots" aria-hidden="true" />
          </div>
          <button type="button" className="tsf-top" onClick={toTop} aria-label="Kembali ke atas">
            <Mark />
          </button>
        </div>
      </div>
    </footer>
  );
}
