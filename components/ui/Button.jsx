// components/ui/Button.jsx
// Varian: primary (kunyit), ghost

import styles from "./Button.module.css";

/**
 * @param {"primary"|"ghost"} variant
 * @param {string} [href] - jika ada, render <a>; jika tidak, render <button>
 * @param {string} [className]
 * @param {React.ReactNode} children
 * @param {object} rest - props lain (onClick, target, rel, dll.)
 */
export default function Button({
  variant = "primary",
  href,
  className = "",
  children,
  ...rest
}) {
  const cls = `${styles.btn} ${styles[`btn--${variant}`]} ${className}`;

  if (href) {
    return (
      <a href={href} className={cls} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
