// components/ui/KetupatHang.jsx
// Tiga ketupat anyaman janur yang bergantung pada tali. Ayunan pembuka dari kanan,
// lalu tenang. Pengguna bisa menarik, melepas, dan melempar ketupat.
'use client';

import { useEffect, useRef } from 'react';

// ─── Parameter Fisika ──────────────────────────────────────────────
const GRAVITY    = 900;       // px/s²
const DAMPING    = 0.991;     // redaman per 1/60 detik
const FIXED_DT   = 1 / 120;   // langkah simulasi tetap (stabil di semua FPS)
const MAX_DT     = 1 / 20;
const SEGMENTS   = 10;
const ITERATIONS = 14;
const TAIL_INV_MASS = 0.25;   // ujung tali lebih berat dari segmen lain
const MAX_THROW  = 12;        // batas kecepatan lempar (px/langkah)
const REST_EPS   = 0.05;      // ambang "sudah tenang"
const GAP        = 14;        // jarak titik gantung ke puncak ketupat

// ─── Definisi Tiga Ketupat ─────────────────────────────────────────
const DARK = {
  deep: '#0F2E19', a: '#3C7A4A', b: '#2A5E38', edge: '#143A22', line: '#0B2314',
};
const LIGHT = {
  deep: '#4A7330', a: '#BBD88A', b: '#8DB255', edge: '#5E8A35', line: '#3F6228',
};

const KETUPAT_DEFS = [
  { axRel: 0.22, lenRel: 0.28, sizeBase: 68, introAngle: 0.82,
    tone: DARK,  tie: '#8DB255', cord: '#2B5A37' },
  { axRel: 0.78, lenRel: 0.48, sizeBase: 76, introAngle: 1.05,
    tone: LIGHT, tie: '#1F4D2B', cord: '#537C33' },
  { axRel: 0.50, lenRel: 0.70, sizeBase: 92, introAngle: 0.92,
    tone: DARK,  tie: '#E0A21B', cord: '#2B5A37' },
];

// ─── Tali Fisika ───────────────────────────────────────────────────
function makeRope(ax, ay, totalLen, count, angle) {
  const segLen = totalLen / count;
  const sinA = Math.sin(angle);
  const cosA = Math.cos(angle);
  const nodes = [];
  for (let i = 0; i <= count; i++) {
    const x = ax + segLen * i * sinA;
    const y = ay + segLen * i * cosA;
    nodes.push({
      x, y, px: x, py: y,
      w: i === 0 ? 0 : i === count ? TAIL_INV_MASS : 1, // w = massa terbalik
    });
  }
  return { nodes, segLen };
}

function stepRope(rope, dt, drag) {
  const { nodes, segLen } = rope;
  const damp = Math.pow(DAMPING, dt * 60);

  for (let i = 1; i < nodes.length; i++) {
    const n = nodes[i];
    const vx = (n.x - n.px) * damp;
    const vy = (n.y - n.py) * damp;
    n.px = n.x;
    n.py = n.y;
    n.x += vx;
    n.y += vy + GRAVITY * dt * dt;
  }

  if (drag) {
    const t = nodes[nodes.length - 1];
    t.x += (drag.x - t.x) * 0.3;
    t.y += (drag.y - t.y) * 0.3;
  }

  for (let it = 0; it < ITERATIONS; it++) {
    for (let i = 0; i < nodes.length - 1; i++) {
      const a = nodes[i];
      const b = nodes[i + 1];
      const sum = a.w + b.w;
      if (sum === 0) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy) || 1e-6;
      const k = (dist - segLen) / dist / sum;
      a.x += dx * k * a.w;
      a.y += dy * k * a.w;
      b.x -= dx * k * b.w;
      b.y -= dy * k * b.w;
    }
  }
}

// ─── Gambar Tali ───────────────────────────────────────────────────
function drawCord(ctx, nodes, color) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(nodes[0].x, nodes[0].y);
  for (let i = 1; i < nodes.length - 1; i++) {
    const mx = (nodes[i].x + nodes[i + 1].x) / 2;
    const my = (nodes[i].y + nodes[i + 1].y) / 2;
    ctx.quadraticCurveTo(nodes[i].x, nodes[i].y, mx, my);
  }
  const last = nodes[nodes.length - 1];
  ctx.lineTo(last.x, last.y);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.2;
  ctx.stroke();
  // serat pilinan tali
  ctx.setLineDash([2, 3]);
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  // paku gantung
  ctx.beginPath();
  ctx.arc(nodes[0].x, nodes[0].y + 2, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#E0A21B';
  ctx.fill();
}

// ─── Sprite Ketupat (digambar sekali, dipakai tiap frame) ──────────
function diamondPath(g, cx, cy, w, s, r) {
  const p = [[cx, cy - s], [cx + w, cy], [cx, cy + s], [cx - w, cy]];
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  g.beginPath();
  g.moveTo(...mid(p[3], p[0]));
  for (let i = 0; i < 4; i++) g.arcTo(p[i][0], p[i][1], ...mid(p[i], p[(i + 1) % 4]), r);
  g.closePath();
}

function strip(g, x0, y0, x1, y1, c0, c1) {
  const lg = g.createLinearGradient(x0, y0, x1, y1);
  lg.addColorStop(0, c0);
  lg.addColorStop(0.5, c1);
  lg.addColorStop(1, c0);
  return lg;
}

function makeSprite(def, size, dpr) {
  const s = size;
  const w = s * 0.9;
  const k = s / 80;
  const pad = 24;
  const tassel = s * 0.55;
  const width = Math.ceil((w + pad) * 2);
  const ox = width / 2;
  const oy = 12;
  const height = Math.ceil(oy + GAP + 2 * s + tassel + pad);
  const t = def.tone;

  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(width * dpr);
  canvas.height = Math.ceil(height * dpr);
  const g = canvas.getContext('2d');
  g.scale(dpr, dpr);
  g.translate(ox, oy);

  const cy = GAP + s;       // pusat belah ketupat
  const bottom = GAP + 2 * s;

  // 1. Helai janur menjuntai di bawah
  const tails = [
    [-10, 0.82, t.b], [10, 0.86, t.a], [-5, 1, t.a], [5, 0.94, t.b], [0, 0.9, t.a],
  ];
  g.lineCap = 'round';
  tails.forEach(([x, len, col]) => {
    const ex = x * k * 1.5;
    const ey = bottom + tassel * len;
    g.beginPath();
    g.moveTo(0, bottom - 6);
    g.quadraticCurveTo(x * k * 0.7, bottom + tassel * 0.5, ex, ey);
    g.strokeStyle = t.line;
    g.lineWidth = 5.2 * k;
    g.stroke();
    g.strokeStyle = col;
    g.lineWidth = 3.4 * k;
    g.stroke();
  });

  // 2. Bayangan lembut + dasar badan
  g.save();
  g.shadowColor = 'rgba(18, 32, 22, 0.3)';
  g.shadowBlur = 18;
  g.shadowOffsetY = 8;
  diamondPath(g, 0, cy, w, s, s * 0.14);
  g.fillStyle = t.deep;
  g.fill();
  g.restore();

  // 3. Anyaman janur (over–under) di ruang koordinat belah ketupat
  g.save();
  diamondPath(g, 0, cy, w, s, s * 0.14);
  g.clip();

  g.save();
  g.transform(w, s, -w, s, 0, GAP); // kotak satuan → belah ketupat
  const N = 6;
  const u = 1 / N;
  const gap = 0.012;
  g.fillStyle = t.deep;
  g.fillRect(0, 0, 1, 1);
  g.lineWidth = 0.012;
  g.strokeStyle = t.line;

  // helai baris (sejajar sumbu a), penuh
  for (let j = 0; j < N; j++) {
    const y = j * u + gap;
    const h = u - gap * 2;
    g.fillStyle = strip(g, 0, y, 0, y + h, t.b, t.a);
    g.fillRect(0, y, 1, h);
    g.strokeRect(0, y, 1, h);
  }
  // helai kolom hanya di sel tempat ia di atas baris
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      if ((i + j) % 2 !== 0) continue;
      const x = i * u + gap;
      const wd = u - gap * 2;
      g.save();
      g.shadowColor = 'rgba(0,0,0,0.4)';
      g.shadowBlur = 3;
      g.fillStyle = strip(g, x, 0, x + wd, 0, t.edge, t.b);
      g.fillRect(x, j * u - gap, wd, u + gap * 2);
      g.restore();
      g.strokeRect(x, j * u - gap, wd, u + gap * 2);
    }
  }
  g.restore();

  // 4. Volume: highlight kiri-atas, gelap kanan-bawah
  const hi = g.createRadialGradient(-w * 0.35, cy - s * 0.4, 0, -w * 0.35, cy - s * 0.4, s * 1.3);
  hi.addColorStop(0, 'rgba(255,255,255,0.22)');
  hi.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = hi;
  g.fillRect(-w - 4, GAP - 4, w * 2 + 8, 2 * s + 8);
  const sh = g.createLinearGradient(0, cy - s, w * 0.8, cy + s);
  sh.addColorStop(0.45, 'rgba(0,0,0,0)');
  sh.addColorStop(1, 'rgba(0,0,0,0.3)');
  g.fillStyle = sh;
  g.fillRect(-w - 4, GAP - 4, w * 2 + 8, 2 * s + 8);
  g.restore();

  // 5. Garis tepi
  diamondPath(g, 0, cy, w, s, s * 0.14);
  g.strokeStyle = t.line;
  g.lineWidth = 2.4;
  g.stroke();

  // 6. Simpul ikat di puncak + benang ke titik gantung
  g.beginPath();
  g.moveTo(0, 0);
  g.lineTo(0, GAP);
  g.strokeStyle = def.cord;
  g.lineWidth = 2.2;
  g.stroke();
  g.beginPath();
  g.arc(0, GAP, 6.5 * k + 1, 0, Math.PI * 2);
  g.fillStyle = def.tie;
  g.fill();
  g.strokeStyle = t.line;
  g.lineWidth = 1.2;
  g.stroke();
  g.beginPath();
  g.arc(0, GAP, 2.4 * k + 0.6, 0, Math.PI * 2);
  g.fillStyle = 'rgba(255,255,255,0.75)';
  g.fill();

  return { canvas, ox, oy, width, height };
}

// ─── Posisi & Sudut Ketupat ────────────────────────────────────────
function bodyAngle(rope) {
  const n = rope.nodes;
  const tail = n[n.length - 1];
  const ref = n[n.length - 3];
  return Math.atan2(tail.x - ref.x, tail.y - ref.y);
}

function bodyCenter(rope) {
  const n = rope.nodes;
  const tail = n[n.length - 1];
  const a = bodyAngle(rope);
  const d = GAP + rope.size;
  return { x: tail.x + Math.sin(a) * d, y: tail.y + Math.cos(a) * d };
}

function drawBody(ctx, rope) {
  const n = rope.nodes;
  const tail = n[n.length - 1];
  const sp = rope.sprite;
  ctx.save();
  ctx.translate(tail.x, tail.y);
  ctx.rotate(-bodyAngle(rope)); // badan searah tali, bukan sekadar miring
  ctx.drawImage(sp.canvas, -sp.ox, -sp.oy, sp.width, sp.height);
  ctx.restore();
}

// ─── Komponen ──────────────────────────────────────────────────────
export default function KetupatHang({ className = '' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'block w-full h-full';
    canvas.style.touchAction = 'pan-y';
    canvas.setAttribute('aria-hidden', 'true');
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let chains = [];
    let raf = 0;
    let isAlive = true;
    let visible = true;
    let lastTime = performance.now();
    let elapsed = 0;
    let acc = 0;
    let restFrames = 0;
    let holdMax = 0;
    let W = 0;
    let H = 0;
    let dpr = 1;

    let grabbed = null; // { index, offX, offY }
    let pointerX = 0;
    let pointerY = 0;

    const initSimulation = (withIntro) => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, container.clientWidth);
      H = Math.max(1, container.clientHeight);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);

      const scale = Math.max(0.6, Math.min(Math.max(W / 460, 0.72), 1.25, H / 560));

      chains = KETUPAT_DEFS.map((def, i) => {
        const size = Math.round(def.sizeBase * scale);
        const ax = W * def.axRel;
        const maxLen = H - GAP - size * 2.6 - 8;
        const totalLen = Math.max(40, Math.min(H * def.lenRel, maxLen));

        // sudut awal dibatasi agar ketupat tidak keluar dari layar
        let angle = 0;
        if (withIntro) {
          const room = (W - ax - size * 1.1 - 8) / totalLen;
          angle = Math.min(def.introAngle, Math.asin(Math.max(0, Math.min(1, room))));
        }

        const rope = makeRope(ax, 0, totalLen, SEGMENTS, angle);
        rope.size = size;
        rope.def = def;
        rope.sprite = makeSprite(def, size, dpr);
        rope.hold = withIntro ? 0.15 + i * 0.12 : 0; // dilepas bergantian
        return rope;
      });

      holdMax = withIntro ? 0.15 + (chains.length - 1) * 0.12 : 0;
      elapsed = 0;
      acc = 0;
      restFrames = 0;
    };

    const wake = () => {
      if (!raf && isAlive && visible) {
        lastTime = performance.now();
        restFrames = 0;
        raf = requestAnimationFrame(tick);
      }
    };

    function tick(now) {
      raf = 0;
      if (!isAlive) return;

      const dt = Math.min(MAX_DT, (now - lastTime) / 1000);
      lastTime = now;
      elapsed += dt;
      acc += dt;

      let steps = 0;
      while (acc >= FIXED_DT && steps < 6) {
        chains.forEach((rope, i) => {
          const isGrab = grabbed && grabbed.index === i;
          if (!isGrab && elapsed < rope.hold) return;
          stepRope(
            rope,
            FIXED_DT,
            isGrab ? { x: pointerX + grabbed.offX, y: pointerY + grabbed.offY } : null
          );
        });
        acc -= FIXED_DT;
        steps++;
      }
      if (steps >= 6) acc = 0;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      let motion = 0;
      chains.forEach((rope) => {
        for (let i = 1; i < rope.nodes.length; i++) {
          const n = rope.nodes[i];
          motion += Math.abs(n.x - n.px) + Math.abs(n.y - n.py);
        }
        drawCord(ctx, rope.nodes, rope.def.cord);
        drawBody(ctx, rope);
      });

      // berhenti menggambar saat sudah tenang (hemat baterai)
      const settled = !grabbed && elapsed > holdMax && motion < REST_EPS;
      restFrames = settled ? restFrames + 1 : 0;
      if (restFrames < 30 && visible) raf = requestAnimationFrame(tick);
    }

    // ── Interaksi ──────────────────────────────────────────────────
    const getPoint = (e) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    const hitTest = (px, py) => {
      for (let i = chains.length - 1; i >= 0; i--) {
        const c = bodyCenter(chains[i]);
        if (Math.hypot(px - c.x, py - c.y) <= chains[i].size * 1.05) return i;
      }
      return -1;
    };

    const onDown = (e) => {
      const p = getPoint(e);
      pointerX = p.x;
      pointerY = p.y;
      const index = hitTest(p.x, p.y);
      if (index < 0) return;
      const tail = chains[index].nodes[chains[index].nodes.length - 1];
      grabbed = { index, offX: tail.x - p.x, offY: tail.y - p.y };
      tail.w = 0; // saat ditarik, ujung tali mengikuti penuh
      canvas.style.cursor = 'grabbing';
      canvas.setPointerCapture?.(e.pointerId);
      e.preventDefault();
      wake();
    };

    const onMove = (e) => {
      const p = getPoint(e);
      pointerX = p.x;
      pointerY = p.y;
      if (!grabbed) canvas.style.cursor = hitTest(p.x, p.y) >= 0 ? 'grab' : '';
    };

    const onUp = (e) => {
      if (!grabbed) return;
      const tail = chains[grabbed.index].nodes[chains[grabbed.index].nodes.length - 1];
      tail.w = TAIL_INV_MASS;
      // batasi kecepatan lempar
      const vx = tail.x - tail.px;
      const vy = tail.y - tail.py;
      const v = Math.hypot(vx, vy);
      if (v > MAX_THROW) {
        const f = MAX_THROW / v;
        tail.px = tail.x - vx * f;
        tail.py = tail.y - vy * f;
      }
      grabbed = null;
      canvas.style.cursor = '';
      canvas.releasePointerCapture?.(e.pointerId);
      wake();
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    // ── Resize & visibilitas ───────────────────────────────────────
    const resizeObserver = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (Math.abs(w - W) < 2 && Math.abs(h - H) < 80) return; // abaikan goyangan kecil
      initSimulation(false); // tanpa mengulang animasi pembuka
      wake();
    });
    resizeObserver.observe(container);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) wake();
    });
    io.observe(container);

    initSimulation(!prefersReduced);
    wake();

    return () => {
      isAlive = false;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      io.disconnect();
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${className}`.trim()}
      aria-hidden="true"
    />
  );
}
