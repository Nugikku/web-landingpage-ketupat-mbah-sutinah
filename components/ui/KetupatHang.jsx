// components/ui/KetupatHang.jsx
// Tiga ketupat bergantung dengan animasi ayunan pembukaan dari kanan (Verlet Physics)
// Setelah mengayun pada saat intro, ketupat tenang bergelantungan (tidak terbang seperti layangan)
// Interaktif: pengguna dapat menarik dan melepaskan ketupat.
'use client';

import { useEffect, useRef } from 'react';

// ─── Parameter Fisika ──────────────────────────────────────────────
const GRAVITY     = 820;    // Gravitasi ke bawah (px/s²)
const DAMPING     = 0.994;  // Redaman kecepatan per frame (ayunan mereda alami)
const SEGMENTS    = 10;     // Jumlah segmen tali untuk kelenturan kurva
const ITERATIONS  = 16;     // Iterasi relaxasi constraint tali
const MAX_DT      = 1 / 30; // Batas dt agar simulasi stabil

// ─── Definisi Tiga Ketupat ─────────────────────────────────────────
// Posisi:
// 1. Kiri paling atas
// 2. Kanan tengah (di antara atas dan bawah)
// 3. Tengah paling bawah (fokus utama, paling besar)
const KETUPAT_DEFS = [
  {
    id: 0,
    role: 'kiri-atas',
    axRel: 0.22,           // 22% dari kiri
    lenRel: 0.28,          // Panjang tali pendek (posisi paling atas)
    sizeBase: 68,          // Radius ketupat
    introAngle: 0.82,      // Sudut awal ke kanan (~47 derajat)
    fill: '#1F4D2B',       // Janur Tua
    stroke: '#8DB255',     // Janur Muda
    accent: '#DCE6C8',     // Daun Pucat
    cordColor: '#2B5A37',  // Warna tali
  },
  {
    id: 1,
    role: 'kanan-tengah',
    axRel: 0.78,           // 78% dari kiri
    lenRel: 0.48,          // Panjang tali sedang (posisi tengah)
    sizeBase: 76,          // Radius ketupat
    introAngle: 1.05,      // Sudut awal ke kanan (~60 derajat)
    fill: '#8DB255',       // Janur Muda
    stroke: '#1F4D2B',     // Janur Tua
    accent: '#F2F5EA',     // Santan
    cordColor: '#537C33',  // Warna tali
  },
  {
    id: 2,
    role: 'tengah-bawah',
    axRel: 0.50,           // 50% di tengah
    lenRel: 0.70,          // Panjang tali paling panjang (posisi paling bawah)
    sizeBase: 92,          // Paling besar & menonjol di depan
    introAngle: 0.92,      // Sudut awal ke kanan (~52 derajat)
    fill: '#1F4D2B',       // Janur Tua
    stroke: '#8DB255',     // Janur Muda
    accent: '#E0A21B',     // Aksen kunyit pada ikatan
    cordColor: '#2B5A37',  // Warna tali
  },
];

// ─── Pembuatan Rantai Tali Fisika ──────────────────────────────────
function makeRope(ax, ay, totalLen, count, introAngle, isIntro) {
  const segLen = totalLen / count;
  const angle = isIntro ? introAngle : 0;
  const sinA = Math.sin(angle);
  const cosA = Math.cos(angle);

  const nodes = [];
  for (let i = 0; i <= count; i++) {
    const dist = segLen * i;
    const x = ax + dist * sinA;
    const y = ay + dist * cosA;
    nodes.push({
      x,
      y,
      px: x, // px = x menandakan kecepatan awal nol (dilepas dari sudut miring)
      py: y,
      pinned: i === 0,
    });
  }

  return { nodes, segLen, totalLen };
}

// ─── Integrasi Verlet & Constraint Solver ──────────────────────────
function stepRope(rope, dt, grav) {
  const { nodes, segLen } = rope;

  // 1. Integrasi posisi berdasarkan kecepatan implisit
  for (let i = 1; i < nodes.length; i++) {
    const n = nodes[i];
    const vx = (n.x - n.px) * DAMPING;
    const vy = (n.y - n.py) * DAMPING;
    n.px = n.x;
    n.py = n.y;
    n.x += vx;
    n.y += vy + grav * dt * dt;
  }

  // 2. Koreksi jarak antar node agar panjang tali tidak mulur
  for (let it = 0; it < ITERATIONS; it++) {
    for (let i = 0; i < nodes.length - 1; i++) {
      const a = nodes[i];
      const b = nodes[i + 1];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy) || 1e-6;
      const diff = (dist - segLen) / dist * 0.5;

      if (!a.pinned) {
        a.x += dx * diff;
        a.y += dy * diff;
      }
      b.x -= dx * diff;
      b.y -= dy * diff;
    }
  }
}

// ─── Gambar Tali Penggantung ───────────────────────────────────────
function drawCord(ctx, nodes, strokeColor) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(nodes[0].x, nodes[0].y);

  for (let i = 1; i < nodes.length - 1; i++) {
    const mx = (nodes[i].x + nodes[i + 1].x) * 0.5;
    const my = (nodes[i].y + nodes[i + 1].y) * 0.5;
    ctx.quadraticCurveTo(nodes[i].x, nodes[i].y, mx, my);
  }

  const last = nodes[nodes.length - 1];
  ctx.lineTo(last.x, last.y);

  // Tali utama
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();

  // Highlight halus pada tali
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.restore();
}

// ─── Gambar Ketupat Berukuran Besar & Otentik ──────────────────────
function drawKetupatBody(ctx, tail, nodes, size, def) {
  // Sudut kemiringan alami mengikuti tarikan segmen ujung tali
  const prev = nodes[nodes.length - 2];
  const lean = Math.atan2(tail.x - prev.x, prev.y - tail.y) * 0.45;

  const { x, y } = tail;
  const s = size;
  const w = s * 0.88; // Rasio belah ketupat ketupat otentik

  const pathDiamond = () => {
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.lineTo(w, 0);
    ctx.lineTo(0, s);
    ctx.lineTo(-w, 0);
    ctx.closePath();
  };

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(lean);

  // 1. Bayangan jatuhnya ketupat (Drop Shadow)
  ctx.shadowColor = 'rgba(28, 40, 32, 0.22)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 16;

  // 2. Isi badan ketupat
  pathDiamond();
  ctx.fillStyle = def.fill;
  ctx.fill();

  // 3. Tekstur Anyaman Janur (Woven Texture)
  ctx.save();
  pathDiamond();
  ctx.clip();
  ctx.shadowColor = 'transparent';

  const step = s * 0.22;
  ctx.lineWidth = 2.2;
  ctx.strokeStyle = def.stroke;
  ctx.globalAlpha = 0.55;

  // Anyaman diagonal 1 (kiri-atas ke kanan-bawah)
  for (let i = -8; i <= 8; i++) {
    ctx.beginPath();
    ctx.moveTo(i * step - s, -s * 1.5);
    ctx.lineTo(i * step + s, s * 1.5);
    ctx.stroke();
  }

  // Anyaman diagonal 2 (kanan-atas ke kiri-bawah)
  ctx.strokeStyle = def.accent;
  ctx.globalAlpha = 0.40;
  for (let i = -8; i <= 8; i++) {
    ctx.beginPath();
    ctx.moveTo(i * step + s, -s * 1.5);
    ctx.lineTo(i * step - s, s * 1.5);
    ctx.stroke();
  }

  // Titik persilangan anyaman janur
  ctx.fillStyle = 'rgba(242, 245, 234, 0.35)';
  for (let ix = -4; ix <= 4; ix++) {
    for (let iy = -4; iy <= 4; iy++) {
      if ((ix + iy) % 2 === 0) {
        ctx.beginPath();
        ctx.arc(ix * step * 0.7, iy * step * 0.7, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  ctx.restore();

  // 4. Garis Tepi (Outline Belah Ketupat)
  ctx.shadowColor = 'transparent';
  pathDiamond();
  ctx.strokeStyle = def.stroke;
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // 5. Cincin / Simpul Gantung di Puncak Ketupat
  ctx.beginPath();
  ctx.arc(0, -s, 6.5, 0, Math.PI * 2);
  ctx.fillStyle = def.stroke;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, -s, 3.2, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();

  // 6. Ujung Daun Janur Menjuntai di Bawah (Khas Ketupat Asli)
  ctx.save();
  ctx.strokeStyle = def.stroke;
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';

  // Helai janur 1
  ctx.beginPath();
  ctx.moveTo(-3, s);
  ctx.quadraticCurveTo(-10, s + 18, -6, s + 32);
  ctx.stroke();

  // Helai janur 2
  ctx.strokeStyle = def.fill;
  ctx.beginPath();
  ctx.moveTo(3, s);
  ctx.quadraticCurveTo(8, s + 20, 4, s + 36);
  ctx.stroke();

  // Helai janur 3 (tengah)
  ctx.strokeStyle = def.accent;
  ctx.beginPath();
  ctx.moveTo(0, s);
  ctx.quadraticCurveTo(2, s + 14, -1, s + 26);
  ctx.stroke();

  ctx.restore();

  ctx.restore();
}

// ─── Komponen Utama KetupatHang ────────────────────────────────────
export default function KetupatHang({ className = '' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'block w-full h-full';
    canvas.setAttribute('aria-hidden', 'true');
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let chains = [];
    let raf = 0;
    let isAlive = true;
    let lastTime = performance.now();
    let W = 1;
    let H = 1;
    let dpr = 1;

    // State interaksi mouse/touch
    let grabbedItem = null;
    let pointerX = 0;
    let pointerY = 0;

    // ── Inisialisasi Posisi & Ukuran Canvas ─────────────────────────
    const initSimulation = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, container.clientWidth);
      H = Math.max(1, container.clientHeight);

      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Hitung skala dinamis berdasarkan ukuran layar
      const scaleFactor = Math.min(Math.max(W / 460, 0.72), 1.25);

      chains = KETUPAT_DEFS.map((def) => {
        const ax = W * def.axRel;
        const ay = 0; // Menggantung dari bibir atas
        const totalLen = Math.min(H * def.lenRel, H - def.sizeBase * 1.4);
        const size = Math.round(def.sizeBase * scaleFactor);

        const rope = makeRope(ax, ay, totalLen, SEGMENTS, def.introAngle, !prefersReduced);
        rope.def = def;
        rope.size = size;
        return rope;
      });
    };

    // ── Loop Animasi ───────────────────────────────────────────────
    const tick = (now) => {
      raf = 0;
      if (!isAlive) return;

      const dt = Math.min(MAX_DT, (now - lastTime) / 1000);
      lastTime = now;

      ctx.clearRect(0, 0, W, H);

      let totalSpeed = 0;

      // Iterasi ketiga ketupat dari belakang ke depan (Z-Index)
      chains.forEach((rope, index) => {
        // Terapkan tarikan pengguna jika sedang di-drag
        if (grabbedItem && grabbedItem.index === index) {
          const tailNode = rope.nodes[rope.nodes.length - 1];
          tailNode.x += (pointerX - tailNode.x) * 0.45;
          tailNode.y += (pointerY - tailNode.y) * 0.45;
          tailNode.px = tailNode.x;
          tailNode.py = tailNode.y;
        }

        // Jalankan fisika gravitasi (tidak ada angin liar konstan)
        stepRope(rope, dt, GRAVITY);

        // Ukur total energi kinetik agar loop hemat daya saat sudah tenang
        for (let i = 1; i < rope.nodes.length; i++) {
          const n = rope.nodes[i];
          totalSpeed += Math.hypot(n.x - n.px, n.y - n.py);
        }

        // Render tali dan badan ketupat
        drawCord(ctx, rope.nodes, rope.def.cordColor);
        drawKetupatBody(ctx, rope.nodes[rope.nodes.length - 1], rope.nodes, rope.size, rope.def);
      });

      // Tetap jalankan raf jika masih bergerak atau sedang di-drag pengguna
      // Jika sudah tenang (settled), raf melambat/tetap siaga
      raf = requestAnimationFrame(tick);
    };

    // ── Interaksi Pointer (Mouse / Touch) ───────────────────────────
    const getCanvasPoint = (e) => {
      const rect = canvas.getBoundingClientRect();
      const source = e.touches && e.touches.length > 0 ? e.touches[0] : e;
      return {
        x: source.clientX - rect.left,
        y: source.clientY - rect.top,
      };
    };

    const findHoveredKetupat = (px, py) => {
      // Prioritaskan ketupat paling depan (index tertinggi)
      for (let i = chains.length - 1; i >= 0; i--) {
        const rope = chains[i];
        const tail = rope.nodes[rope.nodes.length - 1];
        const dist = Math.hypot(px - tail.x, py - tail.y);
        if (dist <= rope.size * 1.15) {
          return { index: i };
        }
      }
      return null;
    };

    const handlePointerDown = (e) => {
      const pt = getCanvasPoint(e);
      pointerX = pt.x;
      pointerY = pt.y;
      const hit = findHoveredKetupat(pt.x, pt.y);
      if (hit) {
        grabbedItem = hit;
        canvas.style.cursor = 'grabbing';
        canvas.setPointerCapture?.(e.pointerId);
        e.preventDefault();
      }
    };

    const handlePointerMove = (e) => {
      const pt = getCanvasPoint(e);
      pointerX = pt.x;
      pointerY = pt.y;

      if (!grabbedItem) {
        canvas.style.cursor = findHoveredKetupat(pt.x, pt.y) ? 'grab' : '';
      }
    };

    const handlePointerUp = (e) => {
      if (grabbedItem) {
        grabbedItem = null;
        canvas.style.cursor = '';
        canvas.releasePointerCapture?.(e.pointerId);
      }
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);

    // ── Resize Observer ────────────────────────────────────────────
    const resizeObserver = new ResizeObserver(() => {
      initSimulation();
    });
    resizeObserver.observe(container);

    initSimulation();
    lastTime = performance.now();
    raf = requestAnimationFrame(tick);

    return () => {
      isAlive = false;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointercancel', handlePointerUp);
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
