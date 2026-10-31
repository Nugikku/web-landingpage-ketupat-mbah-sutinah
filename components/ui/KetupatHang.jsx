// components/ui/KetupatHang.jsx
// Tiga ketupat bergantung dengan fisika Verlet — Canvas 2D, tanpa library tambahan.
// Animasi: ayunan bebas (angin + gravitasi) + interaksi tarik-lepas dengan pointer.
'use client';

import { useEffect, useRef } from 'react';

// ─── Konstanta fisika ──────────────────────────────────────────────
const GRAVITY    = 310;   // px/s² — tarikan ke bawah
const DAMPING    = 0.991; // redaman kecepatan per langkah
const SEGMENTS   = 9;     // jumlah node tali per ketupat
const ITERATIONS = 16;    // iterasi relaxasi constraint per langkah
const MAX_DT     = 1 / 30;
const WIND_AMP   = 18;    // px/s amplitudo angin

// ─── Tiga ketupat ─────────────────────────────────────────────────
// axRel  : posisi anchor x (0–1 relatif lebar kontainer)
// lenRel : panjang tali (0–1 relatif tinggi kontainer)
// sizeRel: setengah-ukuran ketupat (0–1 relatif min(W,H))
// Urutan visual: kiri-atas · kanan-tengah · tengah-bawah
const DEFS = [
  {
    id: 0,
    axRel: 0.18,
    lenRel: 0.24,
    sizeRel: 0.115,
    fill: '#1F4D2B',
    stroke: '#8DB255',
    weave: '#8DB255',
  },
  {
    id: 1,
    axRel: 0.76,
    lenRel: 0.44,
    sizeRel: 0.10,
    fill: '#8DB255',
    stroke: '#1F4D2B',
    weave: '#1F4D2B',
  },
  {
    id: 2,
    axRel: 0.48,
    lenRel: 0.63,
    sizeRel: 0.125,
    fill: '#1F4D2B',
    stroke: '#8DB255',
    weave: '#8DB255',
  },
];

// ─── Helpers fisika ────────────────────────────────────────────────
function makeChain(ax, ay, totalLen, count) {
  const segLen = totalLen / count;
  return {
    nodes: Array.from({ length: count + 1 }, (_, i) => ({
      x: ax,
      y: ay + segLen * i,
      px: ax,
      py: ay + segLen * i,
      pinned: i === 0,
    })),
    segLen,
  };
}

function stepChain(chain, dt, grav, windX) {
  const { nodes, segLen } = chain;

  // Integrasi Verlet — skip node[0] (pinned)
  for (let i = 1; i < nodes.length; i++) {
    const n = nodes[i];
    const vx = (n.x - n.px) * DAMPING;
    const vy = (n.y - n.py) * DAMPING;
    n.px = n.x;
    n.py = n.y;
    n.x += vx + windX * dt;
    n.y += vy + grav * dt * dt;
  }

  // Relaxasi constraint panjang tali
  for (let it = 0; it < ITERATIONS; it++) {
    for (let i = 0; i < nodes.length - 1; i++) {
      const a = nodes[i];
      const b = nodes[i + 1];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 1e-6;
      const corr = (d - segLen) / d * 0.5;
      if (!a.pinned) { a.x += dx * corr; a.y += dy * corr; }
      b.x -= dx * corr;
      b.y -= dy * corr;
    }
  }
}

// ─── Render tali ──────────────────────────────────────────────────
function drawString(ctx, nodes, strokeColor) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(nodes[0].x, nodes[0].y);
  // Kurva halus melalui node-node tali
  for (let i = 1; i < nodes.length - 1; i++) {
    const mx = (nodes[i].x + nodes[i + 1].x) / 2;
    const my = (nodes[i].y + nodes[i + 1].y) / 2;
    ctx.quadraticCurveTo(nodes[i].x, nodes[i].y, mx, my);
  }
  const last = nodes[nodes.length - 1];
  ctx.lineTo(last.x, last.y);
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 1.6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.restore();
}

// ─── Render ketupat ───────────────────────────────────────────────
function drawKetupat(ctx, tail, nodes, size, def) {
  // Sudut kemiringan dari segmen tali terakhir
  const prev = nodes[nodes.length - 2];
  const lean = Math.atan2(tail.x - prev.x, prev.y - tail.y) * 0.32;

  const { x, y } = tail;
  const s = size;

  const diamond = () => {
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.lineTo(s * 0.82, 0);
    ctx.lineTo(0, s);
    ctx.lineTo(-s * 0.82, 0);
    ctx.closePath();
  };

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(lean);

  // — Bayangan —
  ctx.shadowColor = 'rgba(28,40,32,0.25)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 12;

  // — Isi ketupat —
  diamond();
  ctx.fillStyle = def.fill;
  ctx.fill();

  // — Pola anyaman di dalam (clipped) —
  ctx.save();
  diamond();
  ctx.clip();
  ctx.shadowColor = 'transparent';
  const grid = s * 0.23;
  ctx.strokeStyle = def.weave;
  ctx.lineWidth = 1.1;
  ctx.globalAlpha = 0.26;
  for (let i = -8; i <= 8; i++) {
    ctx.beginPath();
    ctx.moveTo(i * grid - s, -s * 1.6);
    ctx.lineTo(i * grid + s, s * 1.6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(i * grid - s, s * 1.6);
    ctx.lineTo(i * grid + s, -s * 1.6);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  ctx.shadowColor = 'transparent';

  // — Garis tepi —
  diamond();
  ctx.strokeStyle = def.stroke;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // — Eyelet (cincin gantung di atas) —
  ctx.shadowColor = 'rgba(28,40,32,0.35)';
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.arc(0, -s, 5.5, 0, Math.PI * 2);
  ctx.fillStyle = def.stroke;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, -s, 3, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fill();

  ctx.restore();
}

// ─── Komponen utama ────────────────────────────────────────────────
export default function KetupatHang({ className = '' }) {
  const wrapRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    // Buat canvas dinamis agar tidak bentrok dengan SSR
    const canvas = document.createElement('canvas');
    canvas.className = 'block w-full h-full';
    canvas.setAttribute('aria-hidden', 'true');
    wrap.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let chains = [];
    let raf = 0;
    let alive = true;
    let time = 0;
    let last = performance.now();
    let W = 1, H = 1;

    // State interaksi
    let grabbed = null; // { ci, ni }
    let mouseX = 0, mouseY = 0;

    // ── Inisialisasi / resize ──────────────────────────────────────
    const init = () => {
      const prev = { W, H, chains };
      W = canvas.width  = Math.max(1, wrap.clientWidth);
      H = canvas.height = Math.max(1, wrap.clientHeight);

      chains = DEFS.map((def, ci) => {
        const ax  = W * def.axRel;
        const ay  = 0;
        const len = H * def.lenRel;
        const ch  = makeChain(ax, ay, len, SEGMENTS);
        ch.def  = def;
        ch.size = Math.min(W, H) * def.sizeRel;

        // Skalakan posisi node sebelumnya agar resize mulus
        if (prev.chains[ci] && prev.W > 1) {
          const sx = W / prev.W;
          const sy = H / prev.H;
          ch.nodes.forEach((n, ni) => {
            const o = prev.chains[ci].nodes[ni];
            if (!o) return;
            n.x = o.x * sx; n.px = o.px * sx;
            n.y = o.y * sy; n.py = o.py * sy;
          });
        }
        return ch;
      });
    };

    // ── Loop animasi ───────────────────────────────────────────────
    const tick = (now) => {
      raf = 0;
      if (!alive) return;

      const dt = Math.min(MAX_DT, (now - last) / 1000);
      last = now;
      time += dt;

      const windX = reduced ? 0
        : WIND_AMP * (Math.sin(time * 0.58) * 0.65 + Math.sin(time * 1.37 + 2.0) * 0.35);

      ctx.clearRect(0, 0, W, H);

      chains.forEach((ch, ci) => {
        // Terapkan tarikan pointer ke node yang di-grab
        if (grabbed && grabbed.ci === ci) {
          const n = ch.nodes[grabbed.ni];
          n.x += (mouseX - n.x) * 0.40;
          n.y += (mouseY - n.y) * 0.40;
          n.px = n.x;
          n.py = n.y;
        }

        stepChain(ch, dt, GRAVITY, windX);

        const tail = ch.nodes[ch.nodes.length - 1];
        const stringColor = ch.def.id === 1
          ? 'rgba(31,77,43,0.60)'
          : 'rgba(141,178,85,0.65)';
        drawString(ctx, ch.nodes, stringColor);
        drawKetupat(ctx, tail, ch.nodes, ch.size, ch.def);
      });

      raf = requestAnimationFrame(tick);
    };

    // ── Interaksi pointer ──────────────────────────────────────────
    const getLocal = (e) => {
      const r = canvas.getBoundingClientRect();
      const src = ('touches' in e && e.touches.length) ? e.touches[0] : e;
      return { x: src.clientX - r.left, y: src.clientY - r.top };
    };

    const hitTest = (px, py) => {
      for (let ci = chains.length - 1; ci >= 0; ci--) {
        const ch = chains[ci];
        const tail = ch.nodes[ch.nodes.length - 1];
        const dx = px - tail.x;
        const dy = py - tail.y;
        if (Math.sqrt(dx * dx + dy * dy) < ch.size * 1.25) {
          return { ci, ni: ch.nodes.length - 1 };
        }
      }
      return null;
    };

    const onDown = (e) => {
      const p = getLocal(e);
      mouseX = p.x; mouseY = p.y;
      const hit = hitTest(p.x, p.y);
      if (hit) {
        grabbed = hit;
        canvas.style.cursor = 'grabbing';
        canvas.setPointerCapture?.(e.pointerId);
        e.preventDefault();
      }
    };

    const onMove = (e) => {
      const p = getLocal(e);
      mouseX = p.x; mouseY = p.y;
      if (!grabbed) {
        canvas.style.cursor = hitTest(p.x, p.y) ? 'grab' : '';
      }
    };

    const onUp = (e) => {
      grabbed = null;
      canvas.style.cursor = '';
      canvas.releasePointerCapture?.(e.pointerId);
    };

    const onTouchStart = (e) => {
      const p = getLocal(e);
      if (hitTest(p.x, p.y)) e.preventDefault();
    };

    canvas.addEventListener('pointerdown',   onDown);
    canvas.addEventListener('pointermove',   onMove);
    canvas.addEventListener('pointerup',     onUp);
    canvas.addEventListener('pointercancel', onUp);
    canvas.addEventListener('lostpointercapture', onUp);
    canvas.addEventListener('touchstart',    onTouchStart, { passive: false });

    // ── Observer ───────────────────────────────────────────────────
    const ro = new ResizeObserver(init);
    ro.observe(wrap);

    init();
    last = performance.now();
    raf = requestAnimationFrame(tick);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener('pointerdown',   onDown);
      canvas.removeEventListener('pointermove',   onMove);
      canvas.removeEventListener('pointerup',     onUp);
      canvas.removeEventListener('pointercancel', onUp);
      canvas.removeEventListener('lostpointercapture', onUp);
      canvas.removeEventListener('touchstart',    onTouchStart);
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className={`relative w-full h-full ${className}`.trim()}
      aria-hidden="true"
    />
  );
}

