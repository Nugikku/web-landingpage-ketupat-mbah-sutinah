// lib/whatsapp.js — Pembantu URL WhatsApp
import { site } from "@/data/site";

/**
 * Membuat URL wa.me dengan pesan otomatis terisi.
 * @param {string} pesan - teks pesan
 * @returns {string} URL lengkap ke WhatsApp
 */
export function waLink(pesan) {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(pesan)}`;
}

/**
 * Pesan default untuk tombol pesan produk Ketupat Matang.
 * @returns {string} URL WhatsApp siap pakai
 */
export function pesanProduk() {
  return waLink(
    "Halo Kupatin, saya ingin memesan Ketupat Matang 1 ikat (10 ketupat)."
  );
}

/**
 * Pesan umum untuk tombol kontak / chat / footer.
 * @returns {string} URL WhatsApp dengan pesan umum
 */
export function pesanUmum() {
  return waLink(
    "Halo Kupatin, saya ingin bertanya mengenai pemesanan ketupat."
  );
}
