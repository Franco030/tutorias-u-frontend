import {
  Body1,
  Button,
  Caption1,
  Input,
  makeStyles,
  MessageBar,
  MessageBarBody,
  Subtitle2,
  Text,
  tokens,
} from "@fluentui/react-components";
import { Calendar, DayOfWeek } from "@fluentui/react-calendar-compat";
import { Dismiss16Regular } from "@fluentui/react-icons";
import { calendarioEs } from "../../../lib/calendarioEs";
import { ahoraEnPlataforma } from "../../../lib/horaPlataforma";
import { Surface } from "../../../components/ui/Page";

const MAXIMO_DIAS_BLOQUEO = 366;

const aClave = (fecha) =>
  `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;

const aFecha = (clave) => {
  const [anio, mes, dia] = clave.split("-").map(Number);
  return new Date(anio, mes - 1, dia);
};

const formatoDia = new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

// "sábado, 24 de octubre de 2026" -> "Sábado, 24 de octubre de 2026"
const nombreDelDia = (clave) => {
  const texto = formatoDia.format(aFecha(clave));
  return texto.charAt(0).toUpperCase() + texto.slice(1);
};

const useStyles = makeStyles({
  layout: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: tokens.spacingHorizontalXL,
    alignItems: "start",
    "@media (min-width: 900px)": {
      gridTemplateColumns: "auto minmax(0, 1fr)",
    },
  },
  calendario: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalS,
  },
  muted: {
    color: tokens.colorNeutralForeground3,
  },
  lista: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
  },
  filas: {
    display: "flex",
    flexDirection: "column",
    margin: 0,
    padding: 0,
    listStyleType: "none",
  },
  fila: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.2fr) auto",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
    paddingBlock: tokens.spacingVerticalS,
    borderBottom: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke3}`,
    ":last-child": { borderBottomStyle: "none" },
    "@media (max-width: 599px)": {
      gridTemplateColumns: "minmax(0, 1fr) auto",
    },
  },
  fecha: {
    fontWeight: tokens.fontWeightSemibold,
  },
  motivo: {
    "@media (max-width: 599px)": {
      gridColumn: "1 / -1",
      gridRow: 2,
    },
  },
});

/*
 * Días sin tutorías: el tutor toca un día del calendario para bloquearlo (o
 * desbloquearlo) y puede anotar un motivo que solo ve él. Los estudiantes no
 * pueden reservar esos días. Bloquear no cancela las citas ya agendadas.
 */
export function DiasBloqueados({ bloqueos, onCambiar, citasAfectadas = 0, deshabilitado = false }) {
  const styles = useStyles();
  const hoy = aFecha(ahoraEnPlataforma().fecha);
  const limite = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + MAXIMO_DIAS_BLOQUEO);
  const fechas = new Set(bloqueos.map((bloqueo) => bloqueo.fecha));

  const alternar = (dia) => {
    if (!dia || deshabilitado) return;
    const clave = aClave(dia);
    onCambiar(
      fechas.has(clave)
        ? bloqueos.filter((bloqueo) => bloqueo.fecha !== clave)
        : [...bloqueos, { fecha: clave, motivo: "" }].sort((a, b) => a.fecha.localeCompare(b.fecha))
    );
  };

  const cambiarMotivo = (clave, motivo) =>
    onCambiar(bloqueos.map((bloqueo) => (bloqueo.fecha === clave ? { ...bloqueo, motivo } : bloqueo)));

  return (
    <div className={styles.layout}>
      <Surface className={styles.calendario}>
        <Subtitle2 as="h2">Elige los días</Subtitle2>
        <Caption1 className={styles.muted}>Toca un día para bloquearlo o desbloquearlo.</Caption1>
        <Calendar
          strings={calendarioEs}
          firstDayOfWeek={DayOfWeek.Monday}
          showGoToToday={false}
          isMonthPickerVisible={false}
          highlightSelectedMonth
          minDate={hoy}
          maxDate={limite}
          onSelectDate={alternar}
          calendarDayProps={{
            // Los días bloqueados se marcan en rojo dentro del propio calendario.
            // (Fluent también la llama con null al desmontar la celda.)
            customDayCellRef: (element, dia) => {
              if (!element || !dia) return;
              const bloqueado = fechas.has(aClave(dia));
              element.style.backgroundColor = bloqueado ? tokens.colorPaletteRedBackground2 : "";
              element.style.boxShadow = bloqueado ? `inset 0 0 0 1px ${tokens.colorPaletteRedBorder2}` : "";
              element.style.borderRadius = bloqueado ? tokens.borderRadiusMedium : "";
              element.title = bloqueado ? "Día bloqueado" : "";
            },
          }}
        />
      </Surface>

      <Surface className={styles.lista} as="section" aria-labelledby="titulo-bloqueados">
        <Subtitle2 as="h2" id="titulo-bloqueados">
          Días sin tutorías ({bloqueos.length})
        </Subtitle2>

        {citasAfectadas > 0 && (
          <MessageBar intent="warning" layout="multiline">
            <MessageBarBody>
              {citasAfectadas === 1
                ? "Tienes 1 cita pendiente o aceptada en un día bloqueado."
                : `Tienes ${citasAfectadas} citas pendientes o aceptadas en días bloqueados.`}{" "}
              Bloquear un día no las cancela: cancélalas desde “Mis tutorías” si no podrás atenderlas.
            </MessageBarBody>
          </MessageBar>
        )}

        {bloqueos.length === 0 ? (
          <Body1 className={styles.muted}>
            No tienes días bloqueados. Úsalos para vacaciones, exámenes o cualquier día en que no puedas dar
            tutorías: tu horario semanal no cambia.
          </Body1>
        ) : (
          <ul className={styles.filas}>
            {bloqueos.map(({ fecha, motivo }) => {
              const nombre = nombreDelDia(fecha);
              return (
                <li key={fecha} className={styles.fila}>
                  <Text className={styles.fecha}>{nombre}</Text>
                  <Input
                    className={styles.motivo}
                    size="small"
                    value={motivo ?? ""}
                    onChange={(_, data) => cambiarMotivo(fecha, data.value)}
                    maxLength={200}
                    placeholder="Motivo (opcional, solo lo ves tú)"
                    aria-label={`Motivo del ${nombre}`}
                    disabled={deshabilitado}
                  />
                  <Button
                    appearance="subtle"
                    size="small"
                    icon={<Dismiss16Regular />}
                    aria-label={`Desbloquear el ${nombre}`}
                    onClick={() => onCambiar(bloqueos.filter((bloqueo) => bloqueo.fecha !== fecha))}
                    disabled={deshabilitado}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </Surface>
    </div>
  );
}

export default DiasBloqueados;
