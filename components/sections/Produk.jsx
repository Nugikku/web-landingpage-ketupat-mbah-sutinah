// components/sections/Produk.jsx
// Daftar baris produk (bukan grid kartu)

import ProdukRow from "@/components/ui/ProdukRow";
import KetupatWeave from "@/components/ui/KetupatWeave";
import { products } from "@/data/products";
import styles from "./Produk.module.css";

export default function Produk() {
  return (
    <section
      id="produk"
      className={`section ${styles.produk}`}
      aria-labelledby="produk-judul"
    >
      <div className="container">
        <h2 id="produk-judul" className={styles.judul}>
          Menu ketupat
        </h2>
        <KetupatWeave variant="divider" />

        <div className={styles.list} role="list">
          {products.map((produk) => (
            <div role="listitem" key={produk.id}>
              <ProdukRow produk={produk} />
            </div>
          ))}
        </div>

        <p className={styles.catatan}>
          Harga dapat berubah sewaktu-waktu. Untuk pesanan besar atau menu
          khusus, hubungi kami langsung.
        </p>
      </div>
    </section>
  );
}
