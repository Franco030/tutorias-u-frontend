import { makeStyles, mergeClasses, tokens } from "@fluentui/react-components";

const useStyles = makeStyles({
  root: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: tokens.colorNeutralBackground5,
  },
  rounded: {
    borderRadius: tokens.borderRadiusXLarge,
  },
  img: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  // Degradado inferior para poder poner texto encima con contraste.
  scrim: {
    "::after": {
      content: '""',
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundImage: `linear-gradient(180deg, transparent 35%, ${tokens.colorBackgroundOverlay} 100%)`,
      pointerEvents: "none",
    },
  },
});

/*
 * Foto en contenedor: recorte con `object-fit: cover` respetando el punto
 * focal y esquinas de tarjeta (aparece con el fundido de la página, sin uno
 * propio). Sin texto encima salvo con
 * `scrim`. `decorativa` la oculta a lectores de pantalla.
 */
export function Photo({
  foto,
  className,
  rounded = true,
  scrim = false,
  decorativa = false,
  prioridad = false,
  style,
}) {
  const styles = useStyles();

  return (
    <div
      className={mergeClasses(styles.root, rounded && styles.rounded, scrim && styles.scrim, className)}
      style={style}
    >
      <img
        src={foto.src}
        alt={decorativa ? "" : foto.alt}
        width={foto.width}
        height={foto.height}
        loading={prioridad ? "eager" : "lazy"}
        fetchPriority={prioridad ? "high" : "auto"}
        decoding="async"
        className={styles.img}
        style={{ objectPosition: foto.foco }}
      />
    </div>
  );
}

export default Photo;
