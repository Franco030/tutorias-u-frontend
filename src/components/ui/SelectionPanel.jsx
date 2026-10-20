import {
  Badge,
  Body1,
  Button,
  Caption1,
  makeStyles,
  Spinner,
  Subtitle2,
  Tag,
  TagGroup,
  tokens,
} from "@fluentui/react-components";
import { Save20Regular } from "@fluentui/react-icons";
import { keyframes } from "../../theme/motion";
import { Surface } from "./Page";

const useStyles = makeStyles({
  layout: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: tokens.spacingHorizontalXL,
    alignItems: "start",
    "@media (min-width: 1100px)": {
      gridTemplateColumns: "minmax(0, 1fr) 320px",
    },
  },
  panel: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
    "@media (min-width: 1100px)": {
      position: "sticky",
      top: tokens.spacingVerticalXXL,
    },
  },
  head: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: tokens.spacingHorizontalS,
  },
  muted: {
    color: tokens.colorNeutralForeground3,
  },
  tags: {
    display: "flex",
    flexWrap: "wrap",
    gap: tokens.spacingHorizontalXS,
    rowGap: tokens.spacingVerticalXS,
    maxHeight: "320px",
    overflowY: "auto",
  },
  tag: {
    animationName: keyframes.scaleIn,
    animationDuration: tokens.durationNormal,
    animationTimingFunction: tokens.curveDecelerateMax,
  },
  save: {
    width: "100%",
  },
});

// Distribución de dos columnas: catálogo a la izquierda, resumen fijo a la derecha.
export function SelectionLayout({ children, panel }) {
  const styles = useStyles();
  return (
    <div className={styles.layout}>
      {children}
      {panel}
    </div>
  );
}

/*
 * Resumen de la selección: etiquetas removibles, aviso de cambios pendientes
 * y la acción de guardar.
 */
export function SelectionPanel({
  materias,
  seleccionadas,
  onToggle,
  onGuardar,
  guardando,
  pendiente,
  vacio = "Aún no eliges materias. Selecciónalas en el catálogo.",
}) {
  const styles = useStyles();
  const elegidas = materias.filter((materia) => seleccionadas.includes(materia.id));

  return (
    <Surface as="aside" className={styles.panel} aria-labelledby="titulo-seleccion">
      <div className={styles.head}>
        <Subtitle2 as="h2" id="titulo-seleccion">
          Tu selección
        </Subtitle2>
        {pendiente ? (
          <Badge appearance="tint" color="warning" shape="rounded">
            Sin guardar
          </Badge>
        ) : (
          <Caption1 className={styles.muted}>{elegidas.length}</Caption1>
        )}
      </div>

      {elegidas.length === 0 ? (
        <Body1 className={styles.muted}>{vacio}</Body1>
      ) : (
        <TagGroup
          className={styles.tags}
          aria-label="Materias seleccionadas"
          onDismiss={(_, data) => onToggle(data.value)}
        >
          {elegidas.map((materia) => (
            <Tag
              key={materia.id}
              value={materia.id}
              dismissible
              dismissIcon={{ "aria-label": `Quitar ${materia.nombre}` }}
              size="small"
              appearance="brand"
              shape="rounded"
              className={styles.tag}
              disabled={guardando}
            >
              {materia.nombre}
            </Tag>
          ))}
        </TagGroup>
      )}

      <Button
        appearance="primary"
        className={styles.save}
        onClick={onGuardar}
        disabled={guardando || !pendiente}
        icon={guardando ? <Spinner size="tiny" /> : <Save20Regular />}
      >
        {guardando ? "Guardando…" : "Guardar cambios"}
      </Button>
    </Surface>
  );
}
