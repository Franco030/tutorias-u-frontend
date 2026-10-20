import { useId } from "react";
import { makeStyles, mergeClasses, Text, tokens } from "@fluentui/react-components";

const useStyles = makeStyles({
  root: {
    display: "inline-flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
    color: tokens.colorNeutralForeground1,
    textDecorationLine: "none",
  },
  mark: {
    flexShrink: 0,
    display: "block",
    filter: `drop-shadow(0 1px 1px color-mix(in srgb, ${tokens.colorBrandBackground} 35%, transparent))`,
  },
  stopTop: {
    stopColor: tokens.colorBrandBackground,
  },
  stopBottom: {
    stopColor: tokens.colorBrandBackgroundPressed,
  },
  glyph: {
    fill: tokens.colorNeutralForegroundOnBrand,
  },
  wordmark: {
    fontWeight: tokens.fontWeightSemibold,
    letterSpacing: "-0.01em",
    whiteSpace: "nowrap",
  },
  accent: {
    color: tokens.colorBrandForeground1,
  },
});

/*
 * Marca de TutoriasU: mosaico de marca con un libro abierto y una persona
 * leyendo encima (aprender acompañado). SVG propio, toma el color del tema.
 */
export function LogoMark({ size = 24, className }) {
  const styles = useStyles();
  // useId incluye caracteres que rompen url(#…) en algunos navegadores.
  const gradienteId = `logo-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={mergeClasses(styles.mark, className)}
      role="img"
      aria-label="TutoriasU"
    >
      <defs>
        <linearGradient id={gradienteId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" className={styles.stopTop} />
          <stop offset="1" className={styles.stopBottom} />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill={`url(#${gradienteId})`} />
      <circle cx="12" cy="6.2" r="2.2" className={styles.glyph} />
      <path d="M4.4 10.6c2.5-1.1 5-.8 7.1.9v8c-2.1-1.4-4.6-1.7-7.1-.8z" className={styles.glyph} />
      <path
        d="M19.6 10.6c-2.5-1.1-5-.8-7.1.9v8c2.1-1.4 4.6-1.7 7.1-.8z"
        className={styles.glyph}
        opacity="0.8"
      />
    </svg>
  );
}

export function BrandMark({ size = "small", className }) {
  const styles = useStyles();
  const grande = size === "large";

  return (
    <span className={mergeClasses(styles.root, className)}>
      <LogoMark size={grande ? 36 : 24} />
      <Text size={grande ? 600 : 400} className={styles.wordmark} aria-hidden="true">
        Tutorias<span className={styles.accent}>U</span>
      </Text>
    </span>
  );
}

export default BrandMark;
