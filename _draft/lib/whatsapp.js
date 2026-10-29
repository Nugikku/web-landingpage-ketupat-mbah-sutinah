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
 * Pesan default untuk tombol pesan produk.
 * @param {string} namaProduk - nama produk yang dipesan
 * @returns {string} pesan WhatsApp siap pakai
 */
export function pesanProduk(namaProduk) {
  return waLink(
    `Halo, saya mau pesan *${namaProduk}*.\nJumlah: ...\nAlamat antar: ...\nNama: ...`
  );
}

/**
 * Pesan umum untuk tombol kontak / chat.
 * @returns {string} URL WhatsApp dengan pesan umum
 */
export function pesanUmum() {
  return waLink(
    `Halo, saya ingin menanyakan informasi tentang ketupat dan lauk pendamping.`
  );
}
