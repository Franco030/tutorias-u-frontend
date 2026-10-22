import { makeStyles, mergeClasses, Text, tokens } from "@fluentui/react-components";
import logoTutoriasU from "../../assets/marca/tutoriasu-logo.png";

// Proporción del logo (ancho / alto) del archivo en assets/marca.
const PROPORCION = 200 / 108;

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
 * Marca de TutoriasU: dos cintas que se entrelazan (quien enseña y quien
 * aprende), en la rampa de marca con brillo cian y punta durazno. PNG con
 * transparencia a 3x del tamaño más grande que se usa; el original y los SVG
 * están fuera del repositorio, en la carpeta logo.
 */
export function LogoMark({ size = 24, className }) {
  const styles = useStyles();
  return (
    <img
      src={logoTutoriasU}
      height={size}
      width={Math.round(size * PROPORCION)}
      className={mergeClasses(styles.mark, className)}
      alt="TutoriasU"
    />
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
