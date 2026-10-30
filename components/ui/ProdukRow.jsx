// components/ui/ProdukRow.jsx
// Satu baris produk di section Produk

import { pesanProduk } from "@/lib/whatsapp";
import styles from "./ProdukRow.module.css";

/**
 * @param {{ id, nama, deskripsi, harga, satuan, unggulan }} produk
 */
export default function ProdukRow({ produk }) {
  const { nama, deskripsi, harga, satuan, unggulan } = produk;
  const hargaStr =
    harga > 0
      ? new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          maximumFractionDigits: 0,
        }).format(harga)
      : "Hubungi kami";

  return (
    <div className={`${styles.row} ${unggulan ? styles.unggulan : ""}`}>
      <span className={styles.diamond} aria-hidden="true" />
      <div className={styles.info}>
        <p className={styles.nama}>{nama}</p>
        {deskripsi && <p className={styles.desk}>{deskripsi}</p>}
      </div>
      <div className={styles.right}>
        <span className={styles.harga}>{hargaStr}</span>
        {satuan && <span className={styles.satuan}>{satuan}</span>}
        <a
          href={pesanProduk(nama)}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.tombol}
          aria-label={`Pesan ${nama} via WhatsApp`}
        >
          Pesan
        </a>
      </div>
    </div>
  );
}
