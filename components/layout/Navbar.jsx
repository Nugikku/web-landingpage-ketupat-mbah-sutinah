// components/layout/Navbar.jsx
// Client component — menu mobile, status gulir, animasi motion/react
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { site } from "@/data/site";
import { pesanUmum } from "@/lib/whatsapp";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const toggleRef = useRef(null);

  // Efek bayangan lebih pekat saat halaman digulir
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Tutup menu dengan tombol Escape
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

  // Kunci scroll body saat menu mobile terbuka
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const closeMenu = useCallback(() => setOpen(false), []);

  const navLinks = [
    { href: "#produk", label: "Produk" },
    { href: "#tentang", label: "Tentang" },
    { href: "#kontak", label: "Kontak" },
  ];

  return (
    <header className={styles.header}>
      {/* Pill floating navbar */}
      <div className={styles.outer}>
        <motion.div
          className={`${styles.pill} ${scrolled ? styles.pillScrolled : ""}`}
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {/* Logo / nama usaha */}
          <a
            href="#"
            className={styles.logo}
            aria-label={`${site.nama} — ke halaman atas`}
          >
            <span className={styles.logoDiamond} aria-hidden="true">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L22 12L12 22L2 12Z" />
              </svg>
            </span>
            <span>{site.nama}</span>
          </a>

          {/* Navigasi desktop (tengah) */}
          <nav className={styles.navCenter} aria-label="Navigasi utama">
            <ul className={styles.links} role="list">
              {navLinks.map(({ href, label }, i) => (
                <li key={href}>
                  <motion.a
                    href={href}
                    className={styles.link}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.05 + 0.1 }}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    {label}
                  </motion.a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Tombol CTA pesan desktop (kanan) */}
          <motion.a
            href={pesanUmum()}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.cta}
            aria-label="Pesan via WhatsApp"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            Pesan
          </motion.a>

          {/* Tombol menu mobile (hamburger) */}
          <motion.button
            ref={toggleRef}
            className={styles.menuToggle}
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
            whileTap={{ scale: 0.9 }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </motion.button>
        </motion.div>
      </div>

      {/* Panel menu mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            ref={menuRef}
            className={styles.mobilePanel}
            role="dialog"
            aria-modal="true"
            aria-label="Menu navigasi"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
          >
            {/* Header di dalam panel mobile */}
            <div className={styles.mobilePanelHeader}>
              <div className={styles.logo}>
                <span className={styles.logoDiamond} aria-hidden="true">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L22 12L12 22L2 12Z" />
                  </svg>
                </span>
                <span>{site.nama}</span>
              </div>
              <motion.button
                className={styles.mobileCloseBtn}
                aria-label="Tutup menu"
                onClick={closeMenu}
                whileTap={{ scale: 0.9 }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </motion.button>
            </div>

            {/* Daftar tautan navigasi */}
            <ul role="list" className={styles.mobileLinks}>
              {navLinks.map(({ href, label }, i) => (
                <motion.li
                  key={href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.06 + 0.06 }}
                >
                  <a href={href} className={styles.mobileLink} onClick={closeMenu}>
                    <span>{label}</span>
                    <span className={styles.mobileLinkArrow} aria-hidden="true">
                      →
                    </span>
                  </a>
                </motion.li>
              ))}
            </ul>

            {/* Footer di dalam panel mobile */}
            <div className={styles.mobileFooter}>
              <motion.a
                href={pesanUmum()}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.mobileCta}
                onClick={closeMenu}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ delay: 0.24 }}
                whileTap={{ scale: 0.98 }}
              >
                Pesan via WhatsApp
              </motion.a>
              <p className={styles.mobileMeta}>
                {site.jamBuka} • {site.areaAntar}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
