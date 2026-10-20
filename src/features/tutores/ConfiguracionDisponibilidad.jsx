import { useEffect, useState } from "react";
import {
  Badge,
  Body1,
  Button,
  Caption1,
  Field,
  Input,
  makeStyles,
  MessageBar,
  MessageBarBody,
  Spinner,
  Subtitle2,
  Text,
  ToggleButton,
  tokens,
  Tooltip,
} from "@fluentui/react-components";
import { Add20Regular, Dismiss16Regular, Save20Regular } from "@fluentui/react-icons";
import { useAuth } from "../../context/AuthContext";
import {
  getDisponibilidadTutor,
  guardarDisponibilidadTutor,
} from "../../services/tutorService";
import { Page, PageHeader, PageLoading, Surface } from "../../components/ui/Page";

const DIAS_SEMANA = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

// Orden de la semana laboral (lunes primero); los índices siguen el backend (0 = domingo).
const ORDEN_DIAS = [1, 2, 3, 4, 5, 6, 0];

const FORMATO_HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

const normalizarBloque = (bloque) => ({
  diaSemana: Number(bloque.diaSemana ?? bloque.DiaSemana),
  horaInicio: String(bloque.horaInicio ?? bloque.HoraInicio).slice(0, 5),
  horaFin: String(bloque.horaFin ?? bloque.HoraFin).slice(0, 5),
});

const useStyles = makeStyles({
  layout: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: tokens.spacingHorizontalXL,
    alignItems: "start",
    "@media (min-width: 1024px)": {
      gridTemplateColumns: "minmax(0, 340px) minmax(0, 1fr)",
    },
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalL,
  },
  muted: {
    color: tokens.colorNeutralForeground3,
  },
  formHead: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXXS,
  },
  days: {
    display: "grid",
    gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
    gap: tokens.spacingHorizontalXS,
  },
  day: {
    minWidth: 0,
    paddingInline: 0,
    "@media (pointer: coarse)": {
      minHeight: "44px",
    },
  },
  times: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: tokens.spacingHorizontalM,
  },
  week: {
    display: "flex",
    flexDirection: "column",
    margin: 0,
    padding: 0,
    listStyleType: "none",
  },
  weekRow: {
    display: "grid",
    gridTemplateColumns: "96px minmax(0, 1fr)",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
    minHeight: "48px",
    paddingBlock: tokens.spacingVerticalS,
    borderBottom: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke3}`,
    ":last-child": {
      borderBottomStyle: "none",
    },
  },
  dayName: {
    fontWeight: tokens.fontWeightSemibold,
  },
  blocks: {
    display: "flex",
    flexWrap: "wrap",
    gap: tokens.spacingHorizontalS,
  },
  block: {
    display: "inline-flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalXXS,
    paddingInlineStart: tokens.spacingHorizontalS,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground2,
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
  },
  removeButton: {
    minWidth: "28px",
    color: "inherit",
  },
  weekHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: tokens.spacingHorizontalM,
    marginBlockEnd: tokens.spacingVerticalS,
  },
});

export default function ConfiguracionDisponibilidad() {
  const styles = useStyles();
  const { user } = useAuth();
  const [bloques, setBloques] = useState([]);
  const [diaSemana, setDiaSemana] = useState("1");
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [horaFin, setHoraFin] = useState("10:00");
  const [cargando, setCargando] = useState(true);
  const [cargaCompleta, setCargaCompleta] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [cambiosSinGuardar, setCambiosSinGuardar] = useState(false);

  useEffect(() => {
    let activo = true;

    const cargarDisponibilidad = async () => {
      try {
        setCargando(true);
        setError("");
        const disponibilidad = await getDisponibilidadTutor(user.id);
        if (activo) {
          setBloques(
            (Array.isArray(disponibilidad) ? disponibilidad : []).map(
              normalizarBloque
            )
          );
          setCargaCompleta(true);
        }
      } catch (err) {
        console.error("Error al cargar disponibilidad:", err);
        if (activo) {
          setError("No se pudo cargar tu disponibilidad. Intenta nuevamente.");
        }
      } finally {
        if (activo) setCargando(false);
      }
    };

    if (user?.id) cargarDisponibilidad();

    return () => {
      activo = false;
    };
  }, [user?.id]);

  const agregarBloque = () => {
    setError("");
    setMensajeExito("");

    if (!FORMATO_HORA.test(horaInicio) || !FORMATO_HORA.test(horaFin)) {
      setError("Ingresa una hora de inicio y fin válidas.");
      return;
    }

    if (horaInicio >= horaFin) {
      setError("La hora de fin debe ser posterior a la hora de inicio.");
      return;
    }

    const dia = Number(diaSemana);
    const seCruza = bloques.some(
      (bloque) =>
        bloque.diaSemana === dia &&
        horaInicio < bloque.horaFin &&
        horaFin > bloque.horaInicio
    );

    if (seCruza) {
      setError("Este bloque se cruza con otro horario del mismo día.");
      return;
    }

    setBloques((actuales) =>
      [...actuales, { diaSemana: dia, horaInicio, horaFin }].sort(
        (a, b) =>
          a.diaSemana - b.diaSemana ||
          a.horaInicio.localeCompare(b.horaInicio)
      )
    );
    setCambiosSinGuardar(true);
  };

  const retirarBloque = (indice) => {
    setBloques((actuales) => actuales.filter((_, i) => i !== indice));
    setMensajeExito("");
    setCambiosSinGuardar(true);
  };

  const handleGuardar = async () => {
    setError("");
    setMensajeExito("");

    try {
      setGuardando(true);
      const guardados = await guardarDisponibilidadTutor(bloques);
      setBloques(
        (Array.isArray(guardados) ? guardados : []).map(normalizarBloque)
      );
      setMensajeExito("Tu disponibilidad se guardó. Los estudiantes ya pueden reservar estos horarios.");
      setCambiosSinGuardar(false);
    } catch (err) {
      console.error("Error al guardar disponibilidad:", err);
      setError(
        err.message || "No se pudo guardar tu disponibilidad. Intenta nuevamente."
      );
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return <PageLoading label="Cargando disponibilidad…" />;
  }

  const bloquesConIndice = bloques.map((bloque, indice) => ({ ...bloque, indice }));

  return (
    <Page>
      <PageHeader
        title="Disponibilidad"
        description="Los bloques semanales en los que los estudiantes pueden reservar contigo. Cada bloque es una cita posible."
        actions={
          <Button
            appearance="primary"
            onClick={handleGuardar}
            disabled={guardando || !cargaCompleta}
            icon={guardando ? <Spinner size="tiny" /> : <Save20Regular />}
          >
            {guardando ? "Guardando…" : "Guardar disponibilidad"}
          </Button>
        }
      />

      {error && (
        <MessageBar intent="error" layout="multiline">
          <MessageBarBody>{error}</MessageBarBody>
        </MessageBar>
      )}

      {mensajeExito && (
        <MessageBar intent="success" layout="multiline">
          <MessageBarBody>{mensajeExito}</MessageBarBody>
        </MessageBar>
      )}

      <div className={styles.layout}>
        <Surface as="section" aria-labelledby="titulo-nuevo-bloque">
          <div className={styles.form}>
            <div className={styles.formHead}>
              <Subtitle2 as="h2" id="titulo-nuevo-bloque">
                Añadir un bloque
              </Subtitle2>
              <Caption1 as="p" className={styles.muted}>
                Elige el día y el rango de horas.
              </Caption1>
            </div>

            <Field label="Día">
              <div className={styles.days} role="group" aria-label="Día de la semana">
                {ORDEN_DIAS.map((index) => (
                  <Tooltip key={index} content={DIAS_SEMANA[index]} relationship="label">
                    <ToggleButton
                      checked={diaSemana === String(index)}
                      appearance={diaSemana === String(index) ? "primary" : "secondary"}
                      onClick={() => setDiaSemana(String(index))}
                      disabled={guardando}
                      className={styles.day}
                    >
                      {DIAS_SEMANA[index].slice(0, 2)}
                    </ToggleButton>
                  </Tooltip>
                ))}
              </div>
            </Field>

            <div className={styles.times}>
              <Field label="Inicio">
                <Input
                  type="time"
                  value={horaInicio}
                  onChange={(_, data) => setHoraInicio(data.value)}
                  disabled={guardando}
                />
              </Field>
              <Field label="Fin">
                <Input
                  type="time"
                  value={horaFin}
                  onChange={(_, data) => setHoraFin(data.value)}
                  disabled={guardando}
                />
              </Field>
            </div>

            <Button icon={<Add20Regular />} onClick={agregarBloque} disabled={guardando}>
              Añadir al {DIAS_SEMANA[Number(diaSemana)].toLowerCase()}
            </Button>
          </div>
        </Surface>

        <Surface as="section" aria-labelledby="titulo-semana">
          <div className={styles.weekHeader}>
            <Subtitle2 as="h2" id="titulo-semana">
              Tu semana
            </Subtitle2>
            {cambiosSinGuardar ? (
              <Badge appearance="tint" color="warning" shape="rounded">
                Cambios sin guardar
              </Badge>
            ) : (
              <Caption1 className={styles.muted}>
                {bloques.length} {bloques.length === 1 ? "bloque" : "bloques"}
              </Caption1>
            )}
          </div>

          {bloques.length === 0 && (
            <Body1 className={styles.muted}>
              Aún no tienes horarios configurados. Añade tu primer bloque para empezar a recibir citas.
            </Body1>
          )}

          {bloques.length > 0 && (
            <ul className={styles.week}>
              {ORDEN_DIAS.map((dia) => {
                const delDia = bloquesConIndice.filter((bloque) => bloque.diaSemana === dia);
                return (
                  <li key={dia} className={styles.weekRow}>
                    <Text className={styles.dayName}>{DIAS_SEMANA[dia]}</Text>
                    {delDia.length === 0 ? (
                      <Caption1 className={styles.muted}>Sin horarios</Caption1>
                    ) : (
                      <div className={styles.blocks}>
                        {delDia.map((bloque) => (
                          <span
                            key={`${bloque.horaInicio}-${bloque.horaFin}-${bloque.indice}`}
                            className={styles.block}
                          >
                            {bloque.horaInicio} – {bloque.horaFin}
                            <Button
                              appearance="transparent"
                              size="small"
                              icon={<Dismiss16Regular />}
                              className={styles.removeButton}
                              onClick={() => retirarBloque(bloque.indice)}
                              disabled={guardando}
                              aria-label={`Retirar bloque del ${DIAS_SEMANA[bloque.diaSemana]} de ${bloque.horaInicio} a ${bloque.horaFin}`}
                            />
                          </span>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Surface>
      </div>
    </Page>
  );
}
