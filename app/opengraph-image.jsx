// app/opengraph-image.jsx — OG image saat dibagikan di media sosial
import { ImageResponse } from "next/og";

export const alt = "Ketupat Ibu Sri — Ketupat Matang & Paket Lebaran";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#F2F5EA",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Diamond logo */}
        <svg width="64" height="64" viewBox="0 0 32 32">
          <polygon points="16,2 30,16 16,30 2,16" fill="#1F4D2B" />
          <polygon
            points="16,8 24,16 16,24 8,16"
            fill="none"
            stroke="#8DB255"
            strokeWidth="2"
          />
          <circle cx="16" cy="16" r="3" fill="#E0A21B" />
        </svg>

        <div
          style={{
            marginTop: 32,
            fontSize: 64,
            fontWeight: 700,
            color: "#1F4D2B",
            lineHeight: 1.1,
            maxWidth: 800,
          }}
        >
          Ketupat Ibu Sri
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 28,
            color: "#1C2820",
            maxWidth: 700,
            lineHeight: 1.4,
          }}
        >
          Ketupat yang dianyam tangan, dimasak sampai pulen.
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 20,
            color: "#555",
          }}
        >
          Pesan via WhatsApp · Surakarta dan sekitarnya
        </div>
      </div>
    ),
    { ...size }
  );
}
