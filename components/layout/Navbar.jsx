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

  // Tambah bayangan saat halaman digulir
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
    { href: "#produk",  label: "Produk" },
    { href: "#tentang", label: "Tentang" },
    { href: "#kontak",  label: "Kontak" },
  ];

  return (
    <header className={styles.header}>
      {/* Pill floating navbar */}
      <div className={styles.outer}>
        <motion.div
          className={`${styles.pill} ${scrolled ? styles.pillScrolled : ""}`}
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {/* Logo / nama usaha */}
          <a href="#" className={styles.logo} aria-label={`${site.nama} — ke halaman atas`}>
            {/* Belah ketupat SVG */}
            <motion.span
              className={styles.logoDiamond}
              aria-hidden="true"
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.3 }}
            />
            <span>{site.nama}</span>
          </a>

          {/* Navigasi desktop */}
          <nav aria-label="Navigasi utama">
            <ul className={styles.links} role="list">
              {navLinks.map(({ href, label }, i) => (
                <li key={href}>
                  <motion.a
                    href={href}
                    className={styles.link}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.07 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {label}
                  </motion.a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Tombol pesan desktop */}
          <motion.a
            href={pesanUmum()}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.cta}
            aria-label="Pesan via WhatsApp"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
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
            whileTap={{ scale: 0.88 }}
          >
            <span className={`${styles.bar} ${open ? styles.barOpen1 : ""}`} />
            <span className={`${styles.bar} ${open ? styles.barOpen2 : ""}`} />
            <span className={`${styles.bar} ${open ? styles.barOpen3 : ""}`} />
          </motion.button>
        </motion.div>
      </div>

      {/* Panel menu mobile */}
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
            <ul role="list" className={styles.mobileLinks}>
              {navLinks.map(({ href, label }, i) => (
                <motion.li
                  key={href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.08 + 0.05 }}
                >
                  <a href={href} className={styles.mobileLink} onClick={closeMenu}>
                    {label}
                  </a>
                </motion.li>
              ))}
            </ul>

            <motion.a
              href={pesanUmum()}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.mobileCta}
              onClick={closeMenu}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.28 }}
            >
              Pesan via WhatsApp
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
