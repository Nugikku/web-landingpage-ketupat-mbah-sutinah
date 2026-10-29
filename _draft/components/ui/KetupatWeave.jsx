// components/ui/KetupatWeave.jsx
// SVG pola anyaman ketupat — versi hero (animasi) dan divider (statis)
"use client";

import { useEffect, useRef } from "react";

/**
 * @param {"hero"|"divider"} variant
 * @param {string} [className]
 */
export default function KetupatWeave({ variant = "hero", className = "" }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (variant !== "hero") return;

    // Periksa prefers-reduced-motion
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const svg = svgRef.current;
    if (!svg) return;

    const paths = svg.querySelectorAll("[data-animate]");
    paths.forEach((path) => {
      const length = path.getTotalLength
        ? path.getTotalLength()
        : 300;
      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = length;
      path.style.transition = "none";
    });

    // Mulai animasi setelah frame pertama
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        paths.forEach((path, i) => {
          path.style.transition = `stroke-dashoffset 1.8s ease ${i * 0.04}s`;
          path.style.strokeDashoffset = "0";
        });
      });
    });
  }, [variant]);

  if (variant === "divider") {
    return (
      <div className={`ketupat-divider ${className}`} aria-hidden="true">
        <div className="ketupat-divider__line" />
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
          >
            <rect
              x="7"
              y="1"
              width="8"
              height="8"
              rx="0"
              transform="rotate(45 7 7)"
              fill={i % 2 === 0 ? "var(--janur-tua)" : "var(--janur-muda)"}
            />
          </svg>
        ))}
        <div className="ketupat-divider__line" />
      </div>
    );
  }

  // === Hero variant ===
  // Grid anyaman 8×8 belah ketupat, dua warna, efek atas-bawah
  const SIZE = 320;
  const CELL = 40; // ukuran satu sel belah ketupat
  const cols = SIZE / CELL;
  const rows = SIZE / CELL;

  const diagonals1 = []; // kiri-atas → kanan-bawah  (warna janur-tua)
  const diagonals2 = []; // kiri-bawah → kanan-atas  (warna janur-muda)

  for (let i = -rows; i <= cols + rows; i++) {
    const x1 = i * CELL;
    const y1 = 0;
    const x2 = x1 + SIZE;
    const y2 = SIZE;
    diagonals1.push(
      <line
        key={`d1-${i}`}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="var(--janur-tua)"
        strokeWidth="2"
        strokeLinecap="round"
        data-animate
      />
    );
  }

  for (let i = -rows; i <= cols + rows; i++) {
    const x1 = i * CELL;
    const y1 = SIZE;
    const x2 = x1 + SIZE;
    const y2 = 0;
    diagonals2.push(
      <line
        key={`d2-${i}`}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="var(--janur-muda)"
        strokeWidth="1.5"
        strokeLinecap="round"
        data-animate
      />
    );
  }

  // Efek "atas-bawah" di persimpangan: titik putih kecil di setiap persilangan
  const crossings = [];
  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c <= cols; c++) {
      if ((r + c) % 2 === 0) {
        crossings.push(
          <circle
            key={`cr-${r}-${c}`}
            cx={c * CELL}
            cy={r * CELL}
            r="3"
            fill="var(--santan)"
          />
        );
      }
    }
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      width={SIZE}
      height={SIZE}
      className={className}
      aria-hidden="true"
      style={{ overflow: "hidden" }}
    >
      {/* Belah ketupat besar sebagai clip */}
      <defs>
        <clipPath id="diamond-clip">
          <polygon points={`${SIZE / 2},0 ${SIZE},${SIZE / 2} ${SIZE / 2},${SIZE} 0,${SIZE / 2}`} />
        </clipPath>
      </defs>
      <g clipPath="url(#diamond-clip)">
        {/* Layer 1: diagonal janur-tua (di bawah) */}
        {diagonals1}
        {/* Layer 2: diagonal janur-muda (di atas, selang-seling) */}
        {diagonals2}
        {/* Titik persimpangan untuk efek anyaman */}
        {crossings}
      </g>
      {/* Outline belah ketupat besar */}
      <polygon
        points={`${SIZE / 2},4 ${SIZE - 4},${SIZE / 2} ${SIZE / 2},${SIZE - 4} 4,${SIZE / 2}`}
        fill="none"
        stroke="var(--janur-tua)"
        strokeWidth="3"
        data-animate
      />
    </svg>
  );
}
