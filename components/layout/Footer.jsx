// components/layout/Footer.jsx

import { site } from "@/data/site";
import KetupatWeave from "@/components/ui/KetupatWeave";
import styles from "./Footer.module.css";

const navLinks = [
  { href: "#produk", label: "Produk" },
  { href: "#tentang", label: "Tentang" },
  { href: "#kontak", label: "Kontak" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      {/* Pembatas anyaman atas */}
      <KetupatWeave variant="divider" className={styles.divider} />

      <div className={`container ${styles.inner}`}>
        {/* Nama & deskripsi */}
        <div className={styles.brand}>
          <p className={styles.name}>{site.nama}</p>
          <p className={styles.tagline}>{site.tagline}</p>
        </div>

        {/* Navigasi */}
        <nav aria-label="Navigasi footer">
          <ul role="list" className={styles.links}>
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <a href={href} className={styles.link}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Kontak singkat */}
        <div className={styles.contact}>
          <p className={styles.contactLabel}>Kontak</p>
          <p>{site.alamat}</p>
          <p>{site.jamBuka}</p>
        </div>
      </div>

      <div className={`container ${styles.copy}`}>
        <p>
          &copy; {year} {site.nama}. Semua hak dilindungi.
        </p>
      </div>
    </footer>
  );
}
