import { useRef, useState } from "react";
import {
  Body1,
  Button,
  Caption1,
  Input,
  makeStyles,
  mergeClasses,
  MessageBar,
  MessageBarBody,
  Subtitle2,
  Text,
  tokens,
} from "@fluentui/react-components";
import { calendarDayGridClassNames as claseCalendario } from "@fluentui/react-calendar-compat";
import { Dismiss16Regular } from "@fluentui/react-icons";
import { ahoraEnPlataforma } from "../../../lib/horaPlataforma";
import { Calendario } from "../../../components/ui/Calendario";
import { Surface } from "../../../components/ui/Page";

const MAXIMO_DIAS_BLOQUEO = 366;

const aClave = (fecha) =>
  `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;

const aFecha = (clave) => {
  const [anio, mes, dia] = clave.split("-").map(Number);
  return new Date(anio, mes - 1, dia);
};

const formatoDia = new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

const formatoRango = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "long", year: "numeric" });

const diaSiguiente = (clave) => {
  const fecha = aFecha(clave);
  return aClave(new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 1));
};

// "sábado, 24 de octubre de 2026" -> "Sábado, 24 de octubre de 2026"
const nombreDelDia = (clave) => {
  const texto = formatoDia.format(aFecha(clave));
  return texto.charAt(0).toUpperCase() + texto.slice(1);
};

// Un día suelto lleva su día de la semana; un rango, "15–30 de diciembre de 2026".
const nombreDelGrupo = ({ desde, hasta }) =>
  desde === hasta ? nombreDelDia(desde) : formatoRango.formatRange(aFecha(desde), aFecha(hasta));

// Días seguidos con el mismo motivo se muestran (y se editan) como un rango.
const agrupar = (bloqueos) => {
  const grupos = [];
  for (const { fecha, motivo } of bloqueos) {
    const ultimo = grupos.at(-1);
    if (ultimo && diaSiguiente(ultimo.hasta) === fecha && (ultimo.motivo ?? "") === (motivo ?? "")) {
      ultimo.hasta = fecha;
      ultimo.fechas.push(fecha);
    } else {
      grupos.push({ desde: fecha, hasta: fecha, motivo, fechas: [fecha] });
    }
  }
  return grupos;
};

// Fechas de "desde" a "hasta" (en cualquier orden), ambas incluidas.
const fechasEntre = (a, b) => {
  const [desde, hasta] = a <= b ? [a, b] : [b, a];
  const fechas = [desde];
  while (fechas.at(-1) < hasta) fechas.push(diaSiguiente(fechas.at(-1)));
  return fechas;
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
  // El Calendar solo sabe de una fecha seleccionada; aquí la selección son los
  // días bloqueados. Esos llevan el aspecto de día seleccionado de Fluent, y el
  // último día tocado pierde el suyo si no quedó bloqueado.
  seleccionMultiple: {
    // Hoy conserva el texto claro sobre su círculo de marca.
    [`& .${claseCalendario.daySingleSelected}:not([data-bloqueado]) > .${claseCalendario.dayButton}:not(.${claseCalendario.dayIsToday})`]:
      {
        color: tokens.colorNeutralForeground1,
      },
    [`& [data-bloqueado] > .${claseCalendario.dayButton}:not(.${claseCalendario.dayIsToday})`]: {
      color: tokens.colorNeutralForeground1Static,
    },
    [`& .${claseCalendario.daySingleSelected}:not([data-bloqueado]) > .${claseCalendario.dayButton}`]: {
      backgroundColor: tokens.colorTransparentBackground,
      border: "none",
      ":hover": { backgroundColor: tokens.colorBrandBackgroundInvertedHover },
      ":active": { backgroundColor: tokens.colorBrandBackgroundInvertedPressed },
      "@media (forced-colors: active)": {
        backgroundColor: "Window",
        color: "WindowText",
      },
    },
    [`& [data-bloqueado] > .${claseCalendario.dayButton}`]: {
      backgroundColor: tokens.colorBrandBackgroundInvertedSelected,
      border: `${tokens.strokeWidthThin} solid ${tokens.colorBrandStroke1}`,
      borderRadius: tokens.borderRadiusMedium,
      ":hover, :active": { backgroundColor: tokens.colorBrandBackgroundInvertedSelected },
      "@media (forced-colors: active)": {
        backgroundColor: "Highlight",
        color: "HighlightText",
        forcedColorAdjust: "none",
      },
    },
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
  // No ensancha la columna: el ancho lo marca el calendario.
  indicacion: {
    maxWidth: "36ch",
  },
  fechaGrupo: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
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
  // Último día tocado: con Shift + clic, el rango hasta el nuevo día queda como él.
  const [ancla, setAncla] = useState(null);
  const conMayus = useRef(false);

  const fijar = (claves, bloquear) => {
    const afectadas = new Set(claves);
    const resto = bloqueos.filter((bloqueo) => !afectadas.has(bloqueo.fecha));
    const nuevos = bloquear
      ? claves.map((fecha) => bloqueos.find((bloqueo) => bloqueo.fecha === fecha) ?? { fecha, motivo: "" })
      : [];
    onCambiar([...resto, ...nuevos].sort((a, b) => a.fecha.localeCompare(b.fecha)));
  };

  const alternar = (dia) => {
    if (!dia || deshabilitado) return;
    const clave = aClave(dia);
    if (conMayus.current && ancla && ancla !== clave) {
      fijar(fechasEntre(ancla, clave), fechas.has(ancla));
    } else {
      fijar([clave], !fechas.has(clave));
    }
    setAncla(clave);
  };

  const cambiarMotivo = (claves, motivo) =>
    onCambiar(bloqueos.map((bloqueo) => (claves.includes(bloqueo.fecha) ? { ...bloqueo, motivo } : bloqueo)));

  return (
    <div className={styles.layout}>
      <Surface className={styles.calendario}>
        <Subtitle2 as="h2">Elige los días</Subtitle2>
        <Caption1 className={mergeClasses(styles.muted, styles.indicacion)}>
          Toca un día para bloquearlo o desbloquearlo. Shift + clic marca un rango.
        </Caption1>
        <div
          onPointerDownCapture={(event) => (conMayus.current = event.shiftKey)}
          onKeyDownCapture={(event) => (conMayus.current = event.shiftKey)}
        >
          <Calendario
            className={styles.seleccionMultiple}
            minDate={hoy}
            maxDate={limite}
            onSelectDate={alternar}
            calendarDayProps={{
              // Marca los días bloqueados para que se vean seleccionados.
              // (Fluent también la llama con null al desmontar la celda.)
              customDayCellRef: (element, dia) => {
                if (!element || !dia) return;
                const bloqueado = fechas.has(aClave(dia));
                element.toggleAttribute("data-bloqueado", bloqueado);
                element.title = bloqueado ? "Día bloqueado" : "";
              },
            }}
          />
        </div>
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
            {agrupar(bloqueos).map((grupo) => {
              const nombre = nombreDelGrupo(grupo);
              const dias = grupo.fechas.length;
              return (
                <li key={grupo.desde} className={styles.fila}>
                  <div className={styles.fechaGrupo}>
                    <Text className={styles.fecha}>{nombre}</Text>
                    {dias > 1 && <Caption1 className={styles.muted}>{dias} días</Caption1>}
                  </div>
                  <Input
                    className={styles.motivo}
                    size="small"
                    value={grupo.motivo ?? ""}
                    onChange={(_, data) => cambiarMotivo(grupo.fechas, data.value)}
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
                    onClick={() => fijar(grupo.fechas, false)}
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
