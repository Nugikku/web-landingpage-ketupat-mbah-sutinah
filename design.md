# design.md — Landing Page UMKM Ketupat

Dokumen ini adalah acuan desain dan struktur proyek. Stack: **Next.js (App Router) + JSX**, deploy di **Vercel**.

> Catatan: Nama usaha resmi: **Kupatin**. Dikelola di `data/site.js`.

---

## 1. Ringkasan Brief

| Hal | Isi |
|---|---|
| Subjek | Usaha ketupat (ketupat matang, ketupat paket lebaran, lauk pendamping) |
| Audiens | Keluarga, kantor/instansi, dan pemesan musiman (Lebaran, hajatan, pengajian) |
| Tugas utama halaman | Membuat orang paham produknya dan **memesan lewat WhatsApp** |
| Section | Navbar, Hero, Produk, Tentang Kami, Kontak, Footer |
| Bahasa | Indonesia, nada hangat dan lugas |

---

## 2. Konsep Desain

**Ide inti: halaman ini dianyam seperti ketupat.** Bentuk belah ketupat (diamond) dan pola anyaman janur jadi bahasa visual satu halaman: pola pada hero, pembagi antar-section, dan penanda daftar.

**Satu momen yang diingat:** di hero, anyaman ketupat besar (SVG) tergambar helai demi helai saat halaman dibuka. Hanya itu animasi otomatis di seluruh halaman. Sisanya tenang.

### Hasil review terhadap tampilan "default"
Rencana awal diperiksa terhadap pola umum desain hasil generator, lalu direvisi:

| Pola default | Keputusan |
|---|---|
| Latar krem + serif + aksen terakota | Dihindari. Latar putih kehijauan (santan), aksen kuning kunyit |
| Kartu produk identik, radius sama, bayangan sama | Diganti **daftar menu ala warung**: baris dengan harga, bukan grid kartu |
| Label huruf kapital di atas tiap judul | Tidak dipakai. Judul section langsung, huruf kapital biasa |
| Penomoran 01/02/03 | Tidak dipakai (konten bukan urutan). Hanya langkah pesan yang bernomor karena memang berurutan |
| Fade-slide-up di tiap section, hover di tiap kartu | Tidak dipakai. Satu animasi hero + respons terhadap aksi pengguna |
| Satu kata di judul diberi warna berbeda | Tidak dipakai |

---

## 3. Design Tokens

### 3.1 Warna

| Nama | Hex | Peran |
|---|---|---|
| Janur Tua | `#1F4D2B` | Warna utama, teks judul, navbar, footer |
| Janur Muda | `#8DB255` | Pola anyaman, penanda, elemen dekoratif |
| Santan | `#F2F5EA` | Latar halaman |
| Arang Kelapa | `#1C2820` | Teks isi (bukan hitam murni) |
| Kunyit | `#E0A21B` | Aksen untuk **tombol pesan** saja |
| Daun Pucat | `#DCE6C8` | Latar section selang-seling, garis pembatas |

Aturan pakai:
- Kunyit hanya untuk CTA utama (Pesan via WhatsApp). Jangan dipakai dekorasi.
- Teks di atas Janur Tua memakai Santan. Kontras minimal 4.5:1.
- Tidak ada gradien sebagai hiasan.

```css
:root {
  --janur-tua: #1F4D2B;
  --janur-muda: #8DB255;
  --santan: #F2F5EA;
  --arang: #1C2820;
  --kunyit: #E0A21B;
  --daun-pucat: #DCE6C8;
}
```

### 3.2 Tipografi

| Peran | Font | Catatan |
|---|---|---|
| Judul / display | **Young Serif** | Serif tebal yang bersahaja, terasa seperti papan warung. Bobot 400 |
| Isi / UI | **Plus Jakarta Sans** | Dirancang di Indonesia, mudah dibaca di layar kecil. Bobot 400, 500, 700 |

Skala (rasio ±1.25, dasar 16px):

| Token | Ukuran | Pakai untuk |
|---|---|---|
| `text-sm` | 14px | Catatan, harga satuan kecil |
| `text-base` | 16–17px | Isi |
| `text-xl` | 22px | Sub-judul |
| `text-3xl` | 36px | Judul section |
| `text-6xl` | clamp(44px, 8vw, 88px) | Judul hero |

Aturan:
- Panjang baris isi maksimal 65–70 karakter (`max-w-prose`).
- Line-height isi 1.65, judul 1.1.
- Judul memakai huruf kecil biasa (sentence case). Tidak ada label kapital.
- Muat font via `next/font/google` agar tidak menimbulkan layout shift.

### 3.3 Bentuk dan jarak

- Bentuk khas: **belah ketupat** (kotak diputar 45°) untuk penanda daftar dan pembagi.
- Radius: tombol `9999px` (pil); gambar produk `4px`; elemen lain `0`. Radius sengaja tidak seragam.
- Jarak vertikal antar-section: `clamp(64px, 10vw, 128px)`.
- Lebar konten maksimal: `1120px`, padding samping `20px` (mobile) / `32px` (desktop).

---

## 4. Pola Anyaman (komponen kunci)

`components/ui/KetupatWeave.jsx` — komponen SVG yang dipakai di hero dan pembagi.

- Dibangun dari garis diagonal yang bersilangan dalam grid belah ketupat, dua warna (Janur Tua dan Janur Muda), dengan efek "atas-bawah" di tiap persilangan.
- Animasi hero: garis digambar lewat `stroke-dashoffset`, total ±1,8 detik, sekali saat load.
- Versi pembagi (`variant="divider"`): satu baris belah ketupat kecil, statis.
- Hormati `prefers-reduced-motion`: tampil langsung tanpa animasi.

---

## 5. Layout per Section

Perataan: **rata kiri** untuk teks. Tidak ada teks di tengah kecuali tombol di mobile.

### 5.1 Navbar
```
[◆ Ketupat Nama]        Produk  Tentang  Kontak     [ Pesan ]
```
- Tinggi 64px, latar Santan, garis bawah 1px Daun Pucat saat halaman digulir.
- Tautan menuju anchor `#produk`, `#tentang`, `#kontak`.
- Mobile: tombol menu membuka panel penuh. Fokus berpindah ke panel, `Esc` menutup.
- Tombol "Pesan" mengarah ke WhatsApp.

### 5.2 Hero
```
+--------------------------------------------------+
| Ketupat yang dianyam                  /\  /\     |
| tangan, dimasak sampai               /  \/  \    |
| pulen.                               \  /\  /    |
|                                       \/  \/     |
| Pesan untuk keluarga, kantor,        (anyaman    |
| atau hajatan. Diantar di [kota].      menggambar |
|                                       diri)      |
| [ Pesan via WhatsApp ]  Lihat menu               |
+--------------------------------------------------+
```
- Kiri: judul, satu kalimat penjelas, dua aksi (utama: tombol Kunyit; kedua: tautan teks).
- Kanan: anyaman ketupat besar yang menggambar diri. Foto asli boleh menggantikan setelah tersedia.
- Mobile: anyaman di atas (tinggi ±200px), teks di bawah.

### 5.3 Produk
```
Menu ketupat
-----------------------------------------------
[◆] Ketupat isi 10            Rp ...   [Pesan]
    Ketupat matang, siap santap
-----------------------------------------------
[◆] Paket Lebaran             Rp ...   [Pesan]
    Ketupat + opor + sambal goreng
-----------------------------------------------
[◆] Ketupat mentah (selongsong)  Rp ... [Pesan]
-----------------------------------------------
```
- Berupa **daftar baris**, bukan grid kartu. Tiap baris: nama, deskripsi satu kalimat, harga, tombol pesan.
- Satu produk unggulan boleh tampil lebih besar dengan foto, sisanya baris biasa.
- Tombol "Pesan" membuka WhatsApp dengan pesan terisi otomatis berisi nama produk.
- Data dari `data/products.js`, jadi mengubah menu tidak perlu menyentuh komponen.

### 5.4 Tentang Kami
```
+---------------------+----------------------------+
| Dari dapur rumah    |  Cerita singkat usaha,     |
| sejak [tahun]       |  siapa yang membuat,       |
| [foto dapur/tim]    |  bahan dan cara memasak.   |
|                     |  3 hal yang dijaga:        |
|                     |  [◆] bahan  [◆] bersih ... |
+---------------------+----------------------------+
```
- Dua kolom asimetris (foto 5/12, teks 7/12). Mobile: bertumpuk.
- Latar Daun Pucat agar terpisah dari section lain.
- Penanda daftar memakai belah ketupat, bukan titik.

### 5.5 Kontak
```
Pesan ketupat

Cara pesan:
  1. Pilih menu dan jumlah
  2. Kirim lewat WhatsApp
  3. Kami konfirmasi dan antar

[ Chat WhatsApp ]   0812-xxxx-xxxx

Alamat   : ...
Jam buka : ...
Area antar: ...
[ peta / tautan Google Maps ]
```
- WhatsApp adalah jalur utama. Tidak perlu formulir.
- Tiga langkah pesan memang berurutan, jadi boleh bernomor.
- Peta: tautan ke Google Maps (hindari iframe berat di halaman landing).

### 5.6 Footer
- Latar Janur Tua, teks Santan.
- Isi: nama usaha, tautan anchor, kontak singkat, hak cipta.
- Satu baris belah ketupat kecil sebagai pembatas atas.

---

## 6. Gerak (Motion)

| Elemen | Perilaku |
|---|---|
| Anyaman hero | Menggambar diri sekali saat load (±1,8 dtk) |
| Tombol, tautan | Perubahan warna 150ms saat hover/fokus |
| Menu mobile | Panel terbuka 200ms |
| Section lain | **Tanpa animasi masuk** |
| `prefers-reduced-motion` | Semua animasi dimatikan |

---

## 7. Salinan (Copywriting)

- Bahasa Indonesia sehari-hari, kalimat aktif, tanpa kata promosi berlebihan.
- Tombol menyebut apa yang terjadi: **"Pesan via WhatsApp"**, bukan "Kirim" atau "Klik di sini".
- Nama aksi konsisten: kalau tombolnya "Pesan", teks lain juga "pesan", bukan "order/beli".
- Tulis hal yang bisa dibuktikan (bahan, ukuran, area antar, jam buka) daripada klaim umum seperti "terenak".
- Isi pesan WhatsApp otomatis, contoh: `Halo, saya mau pesan {produk}. Jumlah: ...  Alamat antar: ...`

---

## 8. Aksesibilitas dan Kualitas

- Responsif dari 360px sampai desktop.
- Fokus keyboard terlihat: outline 3px Kunyit dengan offset 2px.
- Gunakan elemen semantik: `header`, `nav`, `main`, `section` (dengan `aria-labelledby`), `footer`.
- SVG dekoratif diberi `aria-hidden="true"`; gambar produk wajib `alt` bermakna.
- Tautan lewati-navigasi ("Lewati ke konten") di awal halaman.
- Gambar via `next/image` (format WebP/AVIF, ukuran tetap, `priority` hanya untuk hero).
- Target Lighthouse: Performance, Accessibility, SEO ≥ 90.

---

## 9. Struktur Proyek

```
ketupat-landing/
├── app/
│   ├── layout.jsx            # font, metadata, struktur HTML dasar
│   ├── page.jsx              # merangkai semua section
│   ├── globals.css           # token warna, reset, gaya dasar
│   ├── icon.svg              # favicon (belah ketupat)
│   ├── opengraph-image.jsx   # gambar pratinjau saat dibagikan
│   ├── sitemap.js
│   └── robots.js
│
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx        # client component (menu mobile, status gulir)
│   │   └── Footer.jsx
│   ├── sections/
│   │   ├── Hero.jsx
│   │   ├── Produk.jsx
│   │   ├── TentangKami.jsx
│   │   └── Kontak.jsx
│   └── ui/
│       ├── KetupatWeave.jsx  # SVG anyaman (hero + pembagi)
│       ├── Button.jsx        # varian: primary (kunyit), ghost
│       ├── ProdukRow.jsx     # satu baris menu
│       └── SkipLink.jsx
│
├── data/
│   ├── site.js               # nama usaha, nomor WA, alamat, jam, tautan peta
│   └── products.js           # daftar produk: id, nama, deskripsi, harga, unggulan
│
├── lib/
│   └── whatsapp.js           # buat URL wa.me dengan pesan terisi
│
├── public/
│   └── images/
│       ├── hero/
│       ├── produk/
│       └── tentang/
│
├── design.md                 # dokumen ini
├── jsconfig.json             # alias "@/..."
├── next.config.mjs
├── package.json
└── .gitignore
```

### Isi data contoh

```js
// data/site.js
export const site = {
  nama: "Ketupat [Nama Usaha]",
  whatsapp: "62812xxxxxxx",   // format internasional tanpa + dan spasi
  alamat: "Jl. ..., Surakarta",
  jamBuka: "Setiap hari, 07.00–20.00",
  areaAntar: "Surakarta dan sekitarnya",
  peta: "https://maps.google.com/?q=...",
};
```

```js
// data/products.js
export const products = [
  { id: "isi-10", nama: "Ketupat isi 10", deskripsi: "Ketupat matang, siap santap.", harga: 0, unggulan: true },
  { id: "paket-lebaran", nama: "Paket Lebaran", deskripsi: "Ketupat, opor, dan sambal goreng.", harga: 0 },
  { id: "selongsong", nama: "Ketupat mentah", deskripsi: "Selongsong janur siap isi beras.", harga: 0 },
];
```

```js
// lib/whatsapp.js
import { site } from "@/data/site";

export function waLink(pesan) {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(pesan)}`;
}
```

---

## 10. Deploy ke Vercel

1. Push proyek ke GitHub.
2. Di Vercel: **Add New → Project**, pilih repositori. Framework terdeteksi otomatis sebagai Next.js; tidak perlu mengubah pengaturan build.
3. Klik **Deploy**. Setiap push ke `main` akan men-deploy ulang otomatis.
4. Opsional: sambungkan domain di **Settings → Domains**.
5. Halaman ini statis, jadi tidak perlu environment variable. Nomor WhatsApp cukup di `data/site.js`.

---

## 11. Urutan Pengerjaan yang Disarankan

1. `npx create-next-app@latest` (JavaScript, App Router, Tailwind opsional), lalu pasang token di `globals.css` dan font di `layout.jsx`.
2. Buat `KetupatWeave.jsx` lebih dulu, karena ini elemen pembeda halaman.
3. Hero dan Navbar.
4. `data/` dan `lib/whatsapp.js`, lalu section Produk.
5. Tentang Kami, Kontak, Footer.
6. Isi foto asli, ganti placeholder, uji Lighthouse, lalu deploy.

---

## 12. Daftar yang Perlu Dilengkapi

- [ ] Nama usaha dan tahun berdiri
- [ ] Nomor WhatsApp
- [ ] Daftar produk, harga, dan produk unggulan
- [ ] Alamat, jam buka, area antar
- [ ] Foto: produk, dapur/proses, tim (kalau belum ada, anyaman SVG tetap jadi visual utama)
- [ ] Cerita singkat usaha untuk bagian Tentang Kami
