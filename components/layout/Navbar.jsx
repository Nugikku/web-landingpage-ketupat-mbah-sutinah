// components/layout/Navbar.jsx
// Client component — menu mobile, status gulir
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { site } from "@/data/site";
import { pesanUmum } from "@/lib/whatsapp";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const toggleRef = useRef(null);

  // Tambah garis bawah saat halaman digulir
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Tutup menu dengan Esc
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Fokus ke item pertama saat menu terbuka
  useEffect(() => {
    if (open && menuRef.current) {
      const firstLink = menuRef.current.querySelector("a, button");
      firstLink?.focus();
    }
  }, [open]);

  // Kunci scroll saat menu mobile terbuka
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const closeMenu = useCallback(() => setOpen(false), []);

  const navLinks = [
    { href: "#produk", label: "Produk" },
    { href: "#tentang", label: "Tentang" },
    { href: "#kontak", label: "Kontak" },
  ];

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <nav className={`${styles.nav} container`} aria-label="Navigasi utama">
        {/* Logo / nama usaha */}
        <a href="#" className={styles.logo} aria-label={`${site.nama} — ke halaman atas`}>
          <span className={styles.logoDiamond} aria-hidden="true" />
          <span>{site.nama}</span>
        </a>

        {/* Navigasi desktop */}
        <ul className={styles.links} role="list">
          {navLinks.map(({ href, label }) => (
            <li key={href}>
              <a href={href} className={styles.link}>
                {label}
              </a>
            </li>
          ))}
        </ul>

        {/* Tombol pesan desktop */}
        <a
          href={pesanUmum()}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.cta}
          aria-label="Pesan via WhatsApp"
        >
          Pesan
        </a>

        {/* Tombol menu mobile */}
        <button
          ref={toggleRef}
          className={styles.menuToggle}
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className={`${styles.bar} ${open ? styles.barOpen1 : ""}`} />
          <span className={`${styles.bar} ${open ? styles.barOpen2 : ""}`} />
          <span className={`${styles.bar} ${open ? styles.barOpen3 : ""}`} />
        </button>
      </nav>

      {/* Panel menu mobile */}
      {open && (
        <div
          id="mobile-menu"
          ref={menuRef}
          className={styles.mobilePanel}
          role="dialog"
          aria-modal="true"
          aria-label="Menu navigasi"
        >
          <ul role="list" className={styles.mobileLinks}>
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <a href={href} className={styles.mobileLink} onClick={closeMenu}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href={pesanUmum()}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.mobileCta}
            onClick={closeMenu}
          >
            Pesan via WhatsApp
          </a>
        </div>
      )}
    </header>
  );
}
