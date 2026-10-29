// data/products.js — Daftar produk. Ganti harga sebelum deploy.
export const products = [
  {
    id: "isi-10",
    nama: "Ketupat isi 10",
    deskripsi: "Ketupat matang, siap santap. Cocok untuk keluarga atau acara kecil.",
    harga: 25000,
    satuan: "per 10 biji",
    unggulan: true,
  },
  {
    id: "paket-lebaran",
    nama: "Paket Lebaran",
    deskripsi: "Ketupat lengkap dengan opor ayam dan sambal goreng ati.",
    harga: 75000,
    satuan: "per paket",
    unggulan: false,
  },
  {
    id: "selongsong",
    nama: "Ketupat mentah (selongsong)",
    deskripsi: "Selongsong janur siap isi beras, dijual per ikat.",
    harga: 15000,
    satuan: "per ikat (25 biji)",
    unggulan: false,
  },
  {
    id: "paket-kantor",
    nama: "Paket Kantor / Instansi",
    deskripsi: "Minimal 50 biji. Bisa pesan ketupat saja atau lengkap dengan lauk.",
    harga: 0, // harga dikonfirmasi via WhatsApp
    satuan: "harga sesuai pesanan",
    unggulan: false,
  },
];
