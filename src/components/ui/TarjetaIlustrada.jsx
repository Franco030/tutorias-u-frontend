import { cloneElement, isValidElement } from "react";
import { Body1, makeStyles, Subtitle2, tokens } from "@fluentui/react-components";

const useStyles = makeStyles({
  root: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    overflow: "hidden",
    backgroundColor: tokens.colorNeutralBackground1,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusXLarge,
    boxShadow: tokens.shadow4,
    "@media (min-width: 640px)": {
      gridTemplateColumns: "240px minmax(0, 1fr)",
      minHeight: "176px",
    },
  },
  art: {
    height: "150px",
    backgroundColor: tokens.colorNeutralBackground2,
    "@media (min-width: 640px)": {
      height: "auto",
    },
  },
  text: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    gap: tokens.spacingVerticalS,
    padding: `${tokens.spacingVerticalXL} ${tokens.spacingHorizontalXL}`,
  },
  title: {
    margin: 0,
  },
  description: {
    margin: 0,
    color: tokens.colorNeutralForeground3,
    maxWidth: "60ch",
  },
  action: {
    marginTop: tokens.spacingVerticalXS,
  },
});

/*
 * Tarjeta con ilustración a sangre a la izquierda (arriba en móvil): título,
 * descripción y una acción debajo; `etiqueta` (p. ej. un Badge de estado)
 * va sobre el título. Todas las tarjetas ilustradas de la app
 * (estados vacíos e invitaciones como "¿Dominas alguna materia?") la usan,
 * así comparten ancho de imagen, alto mínimo, tipografía y posición del botón.
 */
export function TarjetaIlustrada({ ilustracion, etiqueta, title, description, action }) {
  const styles = useStyles();
  return (
    <div className={styles.root}>
      {/* Encuadre de tarjeta: cada ilustración ocupa el panel por igual. */}
      <div className={styles.art}>
        {isValidElement(ilustracion) ? cloneElement(ilustracion, { ajuste: "tarjeta" }) : ilustracion}
      </div>
      <div className={styles.text}>
        {etiqueta}
        <Subtitle2 as="p" className={styles.title}>
          {title}
        </Subtitle2>
        {description && <Body1 as="p" className={styles.description}>{description}</Body1>}
        {action && <div className={styles.action}>{action}</div>}
      </div>
    </div>
  );
}

export default TarjetaIlustrada;
