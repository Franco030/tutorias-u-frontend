import { Body1, makeStyles, mergeClasses, shorthands, Subtitle2, tokens } from "@fluentui/react-components";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: tokens.spacingVerticalS,
    padding: `${tokens.spacingVerticalXL} ${tokens.spacingHorizontalXL}`,
    borderRadius: tokens.borderRadiusXLarge,
    border: `${tokens.strokeWidthThin} dashed ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  // Con ilustración: tarjeta sólida, imagen a sangre a la izquierda (arriba en móvil).
  illustrated: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    alignItems: "center",
    gap: 0,
    padding: 0,
    overflow: "hidden",
    ...shorthands.borderStyle("solid"),
    ...shorthands.borderColor(tokens.colorNeutralStroke2),
    boxShadow: tokens.shadow4,
    "@media (min-width: 640px)": {
      gridTemplateColumns: "240px minmax(0, 1fr)",
    },
  },
  art: {
    height: "150px",
    alignSelf: "stretch",
    backgroundColor: tokens.colorNeutralBackground2,
    "@media (min-width: 640px)": {
      height: "auto",
      minHeight: "150px",
    },
  },
  text: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: tokens.spacingVerticalS,
    padding: `${tokens.spacingVerticalXL} ${tokens.spacingHorizontalXL}`,
  },
  icon: {
    color: tokens.colorNeutralForeground3,
    fontSize: "28px",
    display: "flex",
  },
  description: {
    color: tokens.colorNeutralForeground3,
    maxWidth: "60ch",
  },
  action: {
    marginTop: tokens.spacingVerticalXS,
  },
});

// Vacío en tres tiempos: qué falta, por qué importa, la siguiente acción.
// Con `ilustracion` se muestra como tarjeta con imagen; si no, con un ícono.
export function EmptyState({ icon, ilustracion, title, description, action }) {
  const styles = useStyles();

  const texto = (
    <>
      {!ilustracion && icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      <Subtitle2 as="p">{title}</Subtitle2>
      {description && <Body1 className={styles.description}>{description}</Body1>}
      {action && <div className={styles.action}>{action}</div>}
    </>
  );

  if (ilustracion) {
    return (
      <div className={mergeClasses(styles.root, styles.illustrated)}>
        <div className={styles.art}>{ilustracion}</div>
        <div className={styles.text}>{texto}</div>
      </div>
    );
  }

  return <div className={styles.root}>{texto}</div>;
}

export default EmptyState;
