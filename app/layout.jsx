// app/layout.jsx — Root layout: font, metadata, struktur HTML dasar
import { Young_Serif, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const youngSerif = Young_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-young-serif",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata = {
  title: "Kupatin — Ketupat Matang & Paket Lebaran, Surakarta",
  description:
    "Pesan ketupat matang, paket lebaran, dan ketupat mentah (selongsong) di Surakarta. Diantar ke rumah, kantor, atau lokasi hajatan. Hubungi lewat WhatsApp.",
  keywords: ["ketupat", "ketupat lebaran", "ketupat surakarta", "pesan ketupat", "ketupat matang", "kupatin"],
  openGraph: {
    title: "Kupatin — Ketupat Matang & Paket Lebaran",
    description:
      "Ketupat yang dianyam tangan, dimasak sampai pulen. Pesan via WhatsApp, diantar di Surakarta.",
    locale: "id_ID",
    type: "website",
  },
  metadataBase: new URL("https://ketupat.vercel.app"),
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${youngSerif.variable} ${plusJakarta.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
