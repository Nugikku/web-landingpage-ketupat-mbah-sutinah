// components/sections/TentangKami.jsx
// Dua kolom asimetris: foto 5/12, teks 7/12

import Image from "next/image";
import KetupatWeave from "@/components/ui/KetupatWeave";
import { site } from "@/data/site";
import styles from "./TentangKami.module.css";

const tiga = [
  { label: "Bahan alami", ket: "Janur segar, beras pilihan, dan bumbu dari pasar." },
  { label: "Bersih", ket: "Dimasak di dapur rumah yang bersih dan terawat." },
  { label: "Tepat waktu", ket: "Pesanan disiapkan sesuai jadwal antar yang disepakati." },
];

export default function TentangKami() {
  return (
    <section
      id="tentang"
      className={`section section--alt ${styles.tentang}`}
      aria-labelledby="tentang-judul"
    >
      <div className={`container ${styles.inner}`}>
        {/* Kolom foto */}
        <div className={styles.foto}>
          <div className={styles.imgWrap}>
            {/* Placeholder warna — ganti dengan next/image + foto asli */}
            <div className={styles.imgPlaceholder} aria-label="Foto dapur atau proses pembuatan ketupat">
              <svg
                viewBox="0 0 200 200"
                width="80"
                height="80"
                aria-hidden="true"
              >
                <polygon
                  points="100,10 190,100 100,190 10,100"
                  fill="none"
                  stroke="var(--janur-muda)"
                  strokeWidth="3"
                />
                <polygon
                  points="100,35 165,100 100,165 35,100"
                  fill="none"
                  stroke="var(--janur-tua)"
                  strokeWidth="2"
                />
              </svg>
              <span className={styles.imgPlaceholderText}>Foto dapur / proses</span>
            </div>
          </div>
          <p className={styles.caption}>Dari dapur rumah sejak {site.tahunBerdiri}</p>
        </div>

        {/* Kolom teks */}
        <div className={styles.teks}>
          <h2 id="tentang-judul">Tentang kami</h2>
          <KetupatWeave variant="divider" />

          <p>
            Kupatin atau biasa dikenal Ketupat Mbah Sutinah lahir dari kebiasaan memasak untuk keluarga besar
            saat lebaran. Dari satu kampung, pesanan mulai datang dari tetangga,
            lalu kantor, lalu hajatan. Kami masih memasak dengan cara yang sama:
            janur segar, dianyam tangan, direbus hingga pulen.
          </p>

          <div className={styles.tiga}>
            {tiga.map(({ label, ket }) => (
              <div key={label} className={styles.tigaItem}>
                <span className="diamond-marker" aria-hidden="true" />
                <div>
                  <p className={styles.tigaLabel}>{label}</p>
                  <p className={styles.tigaKet}>{ket}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
