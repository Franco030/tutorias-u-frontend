import { useEffect, useState } from "react";
import {
  Avatar,
  Body1,
  Button,
  Caption1,
  LargeTitle,
  makeStyles,
  MessageBar,
  MessageBarBody,
  RatingDisplay,
  Spinner,
  Text,
  tokens,
} from "@fluentui/react-components";
import { Star12Filled } from "@fluentui/react-icons";
import { getResenasTutor } from "../../services/resenaService";
import { useCargaDePagina } from "../../hooks/useCargaDePagina";
import { formatoFecha, opiniones } from "../../lib/formato";
import { PageSection, Surface } from "../../components/ui/Page";

const TAMANO_PAGINA = 5;

const useStyles = makeStyles({
  layout: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: tokens.spacingVerticalXXL,
    alignItems: "start",
    "@media (min-width: 768px)": {
      gridTemplateColumns: "240px minmax(0, 1fr)",
      columnGap: tokens.spacingHorizontalXXXL,
    },
  },
  resumen: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalS,
  },
  promedio: {
    fontVariantNumeric: "tabular-nums",
  },
  muted: {
    color: tokens.colorNeutralForeground3,
  },
  desglose: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXS,
    margin: 0,
    marginTop: tokens.spacingVerticalS,
    padding: 0,
    listStyleType: "none",
  },
  fila: {
    display: "grid",
    gridTemplateColumns: "28px minmax(0, 1fr) 28px",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
    color: tokens.colorNeutralForeground3,
    fontVariantNumeric: "tabular-nums",
  },
  estrellaFila: {
    display: "inline-flex",
    alignItems: "center",
    gap: "2px",
  },
  estrella: {
    color: tokens.colorPaletteMarigoldForeground1,
  },
  barra: {
    height: "6px",
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: tokens.colorNeutralBackground5,
    overflow: "hidden",
  },
  relleno: {
    height: "100%",
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: tokens.colorPaletteMarigoldBackground3,
  },
  cantidad: {
    textAlign: "end",
  },
  lista: {
    display: "flex",
    flexDirection: "column",
    margin: 0,
    padding: 0,
    listStyleType: "none",
  },
  resena: {
    display: "grid",
    gridTemplateColumns: "32px minmax(0, 1fr)",
    columnGap: tokens.spacingHorizontalM,
    paddingBlock: tokens.spacingVerticalL,
    borderBottom: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke3}`,
    ":first-child": {
      paddingTop: 0,
    },
    ":last-child": {
      borderBottomStyle: "none",
      paddingBottom: 0,
    },
  },
  cuerpo: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXS,
    minWidth: 0,
  },
  cabecera: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "baseline",
    columnGap: tokens.spacingHorizontalS,
  },
  comentario: {
    margin: 0,
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
  },
  mas: {
    alignSelf: "flex-start",
    marginTop: tokens.spacingVerticalL,
  },
  srOnly: {
    position: "absolute",
    width: "1px",
    height: "1px",
    overflow: "hidden",
    clipPath: "inset(50%)",
    whiteSpace: "nowrap",
  },
});

/*
 * Reseñas del perfil público: promedio con desglose por estrellas a la
 * izquierda y las opiniones más recientes a la derecha, paginadas.
 */
export default function ResenasTutor({ tutorId }) {
  const styles = useStyles();
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [error, setError] = useState(false);

  useCargaDePagina(cargando);

  useEffect(() => {
    let activo = true;
    getResenasTutor(tutorId, { tamanoPagina: TAMANO_PAGINA })
      .then((respuesta) => {
        if (!activo) return;
        setDatos(respuesta);
        setError(false);
      })
      .catch(() => {
        if (activo) setError(true);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, [tutorId]);

  const cargarMas = async () => {
    if (!datos || cargandoMas) return;
    try {
      setCargandoMas(true);
      const siguiente = await getResenasTutor(tutorId, {
        pagina: datos.pagina + 1,
        tamanoPagina: TAMANO_PAGINA,
      });
      setDatos((actuales) => ({
        ...siguiente,
        items: [...actuales.items, ...siguiente.items],
      }));
    } catch {
      setError(true);
    } finally {
      setCargandoMas(false);
    }
  };

  const total = datos?.total ?? 0;
  const promedio = Number(datos?.promedio) || 0;
  const items = datos?.items ?? [];

  let contenido;
  if (cargando) {
    contenido = <Spinner size="tiny" label="Cargando reseñas…" labelPosition="after" />;
  } else if (error && !datos) {
    contenido = <Body1 className={styles.muted}>No se pudieron cargar las reseñas.</Body1>;
  } else if (total === 0) {
    contenido = (
      <Body1 className={styles.muted}>
        Este tutor aún no tiene reseñas. Las opiniones aparecen después de cada sesión completada.
      </Body1>
    );
  } else {
    contenido = (
      <div className={styles.layout}>
        <div className={styles.resumen}>
          <LargeTitle as="p" className={styles.promedio}>
            {promedio.toFixed(1)}
          </LargeTitle>
          <RatingDisplay
            value={promedio}
            color="marigold"
            aria-label={`${promedio.toFixed(1)} de 5 estrellas`}
            valueText={null}
          />
          <Caption1 className={styles.muted}>{opiniones(total)}</Caption1>

          <ul className={styles.desglose} aria-label="Desglose de calificaciones">
            {datos.desglose.map(({ puntuacion, cantidad }) => (
              <li key={puntuacion} className={styles.fila}>
                <span className={styles.srOnly}>
                  {puntuacion} {puntuacion === 1 ? "estrella" : "estrellas"}: {opiniones(cantidad)}
                </span>
                <Caption1 className={styles.estrellaFila} aria-hidden="true">
                  {puntuacion}
                  <Star12Filled className={styles.estrella} />
                </Caption1>
                <div className={styles.barra} aria-hidden="true">
                  <div
                    className={styles.relleno}
                    style={{ width: `${(cantidad / total) * 100}%` }}
                  />
                </div>
                <Caption1 className={styles.cantidad} aria-hidden="true">
                  {cantidad}
                </Caption1>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <ul className={styles.lista}>
            {items.map((resena) => (
              <li key={resena.id} className={styles.resena}>
                <Avatar
                  name={resena.estudianteNombre}
                  image={resena.estudianteFotoUrl ? { src: resena.estudianteFotoUrl, alt: "" } : undefined}
                  size={32}
                  color="colorful"
                />
                <div className={styles.cuerpo}>
                  <div className={styles.cabecera}>
                    <Text weight="semibold">{resena.estudianteNombre}</Text>
                    <Caption1 className={styles.muted}>
                      {formatoFecha.format(new Date(resena.fechaCreacion))}
                    </Caption1>
                  </div>
                  <RatingDisplay
                    value={resena.puntuacion}
                    size="small"
                    color="marigold"
                    aria-label={`${resena.puntuacion} de 5 estrellas`}
                    valueText={null}
                  />
                  {resena.comentario && (
                    <Body1 as="p" className={styles.comentario}>
                      {resena.comentario}
                    </Body1>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {error && (
            <MessageBar intent="error" layout="multiline" className={styles.mas}>
              <MessageBarBody>No se pudieron cargar más reseñas.</MessageBarBody>
            </MessageBar>
          )}
          {items.length < total && (
            <Button
              className={styles.mas}
              onClick={cargarMas}
              disabled={cargandoMas}
              icon={cargandoMas ? <Spinner size="tiny" /> : undefined}
            >
              {cargandoMas ? "Cargando…" : "Mostrar más reseñas"}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <PageSection id="resenas" title="Reseñas de estudiantes">
      <Surface>{contenido}</Surface>
    </PageSection>
  );
}
