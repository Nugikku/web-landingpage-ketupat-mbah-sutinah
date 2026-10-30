// components/ui/SkipLink.jsx
// Tautan lewati-navigasi (aksesibilitas)

import styles from "./SkipLink.module.css";

export default function SkipLink() {
  return (
    <a href="#konten-utama" className={styles.skip}>
      Lewati ke konten utama
    </a>
  );
}
