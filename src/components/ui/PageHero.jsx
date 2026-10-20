import { Body1, makeStyles, Title2, tokens } from "@fluentui/react-components";
import { Photo } from "./Photo";
import { Surface } from "./Page";

const useStyles = makeStyles({
  root: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    "@media (min-width: 768px)": {
      gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
    },
  },
  text: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: tokens.spacingVerticalM,
    padding: tokens.spacingHorizontalXXL,
    "@media (max-width: 479px)": {
      padding: tokens.spacingHorizontalL,
    },
  },
  eyebrow: {
    color: tokens.colorBrandForeground1,
    fontWeight: tokens.fontWeightSemibold,
  },
  title: {
    margin: 0,
    overflowWrap: "anywhere",
  },
  description: {
    color: tokens.colorNeutralForeground3,
    maxWidth: "60ch",
  },
  // La foto toca los bordes de la tarjeta: sin radio propio (la tarjeta recorta).
  photo: {
    order: -1,
    minHeight: "160px",
    "@media (min-width: 768px)": {
      order: 0,
      minHeight: "220px",
    },
  },
});

/*
 * Cabecera con foto: tarjeta a sangre con el texto a la izquierda y la
 * fotografía a la derecha (arriba en móvil). El título es el h1 de la página.
 */
export function PageHero({ title, description, foto, children, eyebrow }) {
  const styles = useStyles();

  return (
    <Surface flush className={styles.root}>
      <div className={styles.text}>
        {eyebrow && <Body1 className={styles.eyebrow}>{eyebrow}</Body1>}
        <Title2 as="h1" className={styles.title}>
          {title}
        </Title2>
        {description && <Body1 className={styles.description}>{description}</Body1>}
        {children}
      </div>
      <Photo foto={foto} rounded={false} decorativa prioridad className={styles.photo} />
    </Surface>
  );
}

export default PageHero;
