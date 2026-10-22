import { useEffect, useState } from "react";
import { useBlocker } from "react-router-dom";
import { useNotificar } from "../../hooks/useNotificar";
import {
  Badge,
  Body1,
  Button,
  Caption1,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  LargeTitle,
  makeStyles,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  MessageBar,
  MessageBarBody,
  Spinner,
  Subtitle2,
  Tab,
  TabList,
  ToggleButton,
  tokens,
} from "@fluentui/react-components";
import {
  ArrowUndo20Regular,
  Copy20Regular,
  Delete20Regular,
  Eraser20Regular,
  PaintBrush20Regular,
  Save20Regular,
} from "@fluentui/react-icons";
import { useAuth } from "../../context/AuthContext";
import {
  getDisponibilidadTutor,
  getMisBloqueos,
  getPreferenciasTutor,
  guardarDisponibilidadTutor,
  guardarMisBloqueos,
  guardarPreferenciasTutor,
} from "../../services/tutorService";
import { ahoraEnPlataforma } from "../../lib/horaPlataforma";
import { Page, PageHeader, PageLoading, Surface } from "../../components/ui/Page";
import { RejillaFranjas } from "./disponibilidad/RejillaFranjas";
import { DiasBloqueados } from "./disponibilidad/DiasBloqueados";
import { PreferenciasReserva } from "./disponibilidad/PreferenciasReserva";
import { esEnlaceWeb } from "../../lib/enlaces";
import {
  bloquesParaGuardar,
  celdaATexto,
  celdasDesdeBloques,
  DIAS,
  DIAS_HABILES,
  formatoHoras,
  horasTotales,
  ORDEN_DIAS,
  resumenEnPalabras,
  semanaVacia,
} from "./disponibilidad/franjas";

const normalizarBloque = (bloque) => ({
  diaSemana: Number(bloque.diaSemana ?? bloque.DiaSemana),
  horaInicio: String(bloque.horaInicio ?? bloque.HoraInicio).slice(0, 5),
  horaFin: String(bloque.horaFin ?? bloque.HoraFin).slice(0, 5),
});

const HISTORIAL_MAXIMO = 50;

const normalizarBloqueos = (respuesta) =>
  (respuesta?.bloqueos ?? []).map((bloqueo) => ({ fecha: String(bloqueo.fecha).slice(0, 10), motivo: bloqueo.motivo ?? "" }));

const useStyles = makeStyles({
  pestanas: {
    marginBlockEnd: `calc(${tokens.spacingVerticalXXL} * -0.5)`,
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: tokens.spacingHorizontalXL,
    alignItems: "start",
    "@media (min-width: 1024px)": {
      gridTemplateColumns: "300px minmax(0, 1fr)",
    },
  },
  panel: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalL,
    "@media (min-width: 1024px)": {
      position: "sticky",
      top: tokens.spacingVerticalXXL,
    },
  },
  total: {
    display: "flex",
    alignItems: "baseline",
    gap: tokens.spacingHorizontalS,
  },
  cifra: {
    fontVariantNumeric: "tabular-nums",
  },
  muted: {
    color: tokens.colorNeutralForeground3,
  },
  palabras: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXS,
    padding: tokens.spacingHorizontalM,
    borderRadius: tokens.borderRadiusLarge,
    backgroundColor: tokens.colorNeutralBackground2,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
  },
  eyebrow: {
    color: tokens.colorNeutralForeground3,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    fontWeight: tokens.fontWeightSemibold,
  },
  herramientas: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: tokens.spacingHorizontalXS,
  },
  secundarias: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: tokens.spacingHorizontalS,
  },
  copiar: {
    width: "100%",
  },
  accionesSalida: {
    whiteSpace: "nowrap",
  },
  rejilla: {
    padding: 0,
    overflow: "hidden",
  },
});

const horaDeHoy = () => {
  const { fecha, hora } = ahoraEnPlataforma();
  const [h, m] = hora.split(":").map(Number);
  return { dia: new Date(`${fecha}T12:00:00`).getDay(), minutos: h * 60 + m };
};

/*
 * Disponibilidad "a pinceladas": el tutor pinta sus franjas sobre la semana.
 * Al guardar, cada franja se divide en sesiones de 1 hora (cada una es una
 * cita reservable); la media hora que no completa una sesión se avisa.
 */
export default function ConfiguracionDisponibilidad() {
  const notificar = useNotificar();
  const styles = useStyles();
  const { user } = useAuth();
  const [celdas, setCeldas] = useState(semanaVacia);
  const [historial, setHistorial] = useState([]);
  const [herramienta, setHerramienta] = useState("pintar");
  const [diaActivo, setDiaActivo] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [cargaCompleta, setCargaCompleta] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [ajuste, setAjuste] = useState("");
  const [cambiosSinGuardar, setCambiosSinGuardar] = useState(false);
  const [hoy] = useState(horaDeHoy);
  const [pestana, setPestana] = useState("horario");
  // Días sin tutorías y preferencias de reserva: se guardan con el mismo botón.
  const [bloqueos, setBloqueos] = useState([]);
  const [citasAfectadas, setCitasAfectadas] = useState(0);
  const [bloqueosCambiados, setBloqueosCambiados] = useState(false);
  const [preferencias, setPreferencias] = useState({ antelacionMinimaHoras: 12, linkReunion: "" });
  const [preferenciasCambiadas, setPreferenciasCambiadas] = useState(false);

  useEffect(() => {
    let activo = true;

    const cargarDisponibilidad = async () => {
      try {
        setCargando(true);
        setError("");
        const [disponibilidad, misBloqueos, misPreferencias] = await Promise.all([
          getDisponibilidadTutor(user.id),
          getMisBloqueos(),
          getPreferenciasTutor(),
        ]);
        if (!activo) return;
        setBloqueos(normalizarBloqueos(misBloqueos));
        setCitasAfectadas(misBloqueos?.citasAfectadas ?? 0);
        setPreferencias({
          antelacionMinimaHoras: misPreferencias?.antelacionMinimaHoras ?? 12,
          linkReunion: misPreferencias?.linkReunion ?? "",
        });
        const resultado = celdasDesdeBloques((Array.isArray(disponibilidad) ? disponibilidad : []).map(normalizarBloque));
        setCeldas(resultado.celdas);
        if (resultado.ajustados || resultado.fuera) {
          setAjuste(
            "Algunos horarios guardados no coincidían con la rejilla de media hora (de 6:00 a 22:00) y se ajustaron. Revísalos antes de guardar."
          );
        }
        setCargaCompleta(true);
      } catch (err) {
        console.error("Error al cargar disponibilidad:", err);
        if (activo) setError("No se pudo cargar tu disponibilidad. Intenta nuevamente.");
      } finally {
        if (activo) setCargando(false);
      }
    };

    if (user?.id) cargarDisponibilidad();

    return () => {
      activo = false;
    };
  }, [user?.id]);

  // Todo cambio pasa por aquí: se guarda el estado anterior para deshacer.
  const cambiar = (nuevas) => {
    setHistorial((anteriores) => [...anteriores.slice(-(HISTORIAL_MAXIMO - 1)), celdas]);
    setCeldas(nuevas);
    setCambiosSinGuardar(true);
  };

  const deshacer = () => {
    if (historial.length === 0) return;
    setCeldas(historial[historial.length - 1]);
    setHistorial((anteriores) => anteriores.slice(0, -1));
    setCambiosSinGuardar(true);
  };

  // Ctrl+Z deshace la última pincelada.
  useEffect(() => {
    const alTeclear = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z" && !event.shiftKey) {
        const enCampo = ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName);
        if (enCampo) return;
        event.preventDefault();
        deshacer();
      }
    };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  });

  const copiarA = (destinos) => {
    const nuevas = celdas.map((dia) => [...dia]);
    for (const dia of destinos) {
      if (dia !== diaActivo) nuevas[dia] = [...celdas[diaActivo]];
    }
    cambiar(nuevas);
  };

  const hayCambios = cambiosSinGuardar || bloqueosCambiados || preferenciasCambiadas;
  const enlaceInvalido = Boolean(preferencias.linkReunion?.trim()) && !esEnlaceWeb(preferencias.linkReunion.trim());

  // Salir a otra página con cambios sin guardar abre un diálogo para decidir.
  const salida = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hayCambios && Boolean(user) && currentLocation.pathname !== nextLocation.pathname
  );

  // Recargar o cerrar la pestaña: aviso nativo del navegador.
  useEffect(() => {
    if (!hayCambios) return undefined;
    const alSalir = (event) => event.preventDefault();
    window.addEventListener("beforeunload", alSalir);
    return () => window.removeEventListener("beforeunload", alSalir);
  }, [hayCambios]);

  // Guarda solo lo que cambió: horario, días sin tutorías y preferencias.
  // Devuelve si se guardó todo.
  const handleGuardar = async () => {
    setError("");
    if (enlaceInvalido) {
      setPestana("reservas");
      setError("Revisa el enlace fijo de videollamada antes de guardar.");
      return false;
    }
    try {
      setGuardando(true);
      if (cambiosSinGuardar) {
        const guardados = await guardarDisponibilidadTutor(bloquesParaGuardar(celdas).bloques);
        const resultado = celdasDesdeBloques((Array.isArray(guardados) ? guardados : []).map(normalizarBloque));
        setCeldas(resultado.celdas);
        setHistorial([]);
        setAjuste("");
        setCambiosSinGuardar(false);
      }
      if (bloqueosCambiados) {
        const respuesta = await guardarMisBloqueos(
          bloqueos.map(({ fecha, motivo }) => ({ fecha, motivo: motivo.trim() || null }))
        );
        setBloqueos(normalizarBloqueos(respuesta));
        setCitasAfectadas(respuesta?.citasAfectadas ?? 0);
        setBloqueosCambiados(false);
      }
      if (preferenciasCambiadas) {
        const respuesta = await guardarPreferenciasTutor({
          antelacionMinimaHoras: preferencias.antelacionMinimaHoras,
          linkReunion: preferencias.linkReunion?.trim() || null,
        });
        setPreferencias({ antelacionMinimaHoras: respuesta.antelacionMinimaHoras, linkReunion: respuesta.linkReunion ?? "" });
        setPreferenciasCambiadas(false);
      }
      notificar("Cambios guardados", { cuerpo: "Los estudiantes ya ven tu disponibilidad actualizada." });
      return true;
    } catch (err) {
      console.error("Error al guardar disponibilidad:", err);
      setError(err.message || "No se pudieron guardar los cambios. Intenta nuevamente.");
      return false;
    } finally {
      setGuardando(false);
    }
  };

  // Si no se pudo guardar, se queda en la página con el error a la vista.
  const guardarYSalir = async () => {
    if (await handleGuardar()) salida.proceed?.();
    else salida.reset?.();
  };

  if (cargando) {
    return <PageLoading label="Cargando disponibilidad…" />;
  }

  const horas = horasTotales(celdas);
  const { bloques, sobrantes } = bloquesParaGuardar(celdas);
  const diaActivoNombre = DIAS[diaActivo].toLowerCase();

  return (
    <Page>
      <PageHeader
        title="Disponibilidad"
        description="Pinta sobre la semana las horas en las que puedes dar tutorías. Cada hora pintada es una cita que los estudiantes pueden reservar."
        actions={
          <Button
            appearance="primary"
            onClick={handleGuardar}
            disabled={guardando || !cargaCompleta || !hayCambios}
            icon={guardando ? <Spinner size="tiny" /> : <Save20Regular />}
          >
            {guardando ? "Guardando…" : "Guardar cambios"}
          </Button>
        }
      />

      <Dialog
        open={salida.state === "blocked"}
        onOpenChange={(_, data) => {
          if (!data.open && !guardando) salida.reset?.();
        }}
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle>¿Guardar los cambios?</DialogTitle>
            <DialogContent>
              <Body1>Tienes cambios sin guardar en tu disponibilidad. Si sales sin guardarlos, se perderán.</Body1>
            </DialogContent>
            <DialogActions className={styles.accionesSalida}>
              <Button appearance="secondary" onClick={() => salida.reset?.()} disabled={guardando}>
                Cancelar
              </Button>
              <Button appearance="secondary" onClick={() => salida.proceed?.()} disabled={guardando}>
                No guardar
              </Button>
              <Button
                appearance="primary"
                onClick={guardarYSalir}
                disabled={guardando}
                icon={guardando ? <Spinner size="tiny" /> : undefined}
              >
                {guardando ? "Guardando…" : "Guardar"}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      <TabList
        className={styles.pestanas}
        selectedValue={pestana}
        onTabSelect={(_, data) => setPestana(data.value)}
        aria-label="Secciones de disponibilidad"
      >
        <Tab value="horario">Horario semanal</Tab>
        <Tab value="bloqueos">Días sin tutorías{bloqueos.length > 0 && ` (${bloqueos.length})`}</Tab>
        <Tab value="reservas">Reservas</Tab>
      </TabList>

      {error && (
        <MessageBar intent="error" layout="multiline">
          <MessageBarBody>{error}</MessageBarBody>
        </MessageBar>
      )}
      {ajuste && (
        <MessageBar intent="warning" layout="multiline">
          <MessageBarBody>{ajuste}</MessageBarBody>
        </MessageBar>
      )}

      {pestana === "bloqueos" && (
        <DiasBloqueados
          bloqueos={bloqueos}
          citasAfectadas={citasAfectadas}
          deshabilitado={guardando}
          onCambiar={(nuevos) => {
            setBloqueos(nuevos);
            setBloqueosCambiados(true);
          }}
        />
      )}

      {pestana === "reservas" && (
        <PreferenciasReserva
          preferencias={preferencias}
          deshabilitado={guardando}
          onCambiar={(nuevas) => {
            setPreferencias(nuevas);
            setPreferenciasCambiadas(true);
          }}
        />
      )}

      {pestana === "horario" && (
        <div className={styles.layout}>
          <Surface as="aside" className={styles.panel} aria-labelledby="titulo-semana">
            <div>
              <Subtitle2 as="h2" id="titulo-semana">
                Tu semana
              </Subtitle2>
              <div className={styles.total}>
                <LargeTitle as="p" className={styles.cifra}>
                  {formatoHoras(horas)}
                </LargeTitle>
                <Body1 className={styles.muted}>
                  {horas === 1 ? "hora" : "horas"} · {bloques.length} {bloques.length === 1 ? "sesión" : "sesiones"} de 1 h
                </Body1>
              </div>
              {cambiosSinGuardar && (
                <Badge appearance="tint" color="warning" shape="rounded">
                  Cambios sin guardar
                </Badge>
              )}
            </div>

            <div className={styles.palabras}>
              <Caption1 className={styles.eyebrow}>En palabras</Caption1>
              <Body1 aria-live="polite">{resumenEnPalabras(celdas)}</Body1>
            </div>

            {sobrantes.length > 0 && (
              <MessageBar intent="warning" layout="multiline">
                <MessageBarBody>
                  Las sesiones son de 1 hora: la media hora rayada (
                  {sobrantes
                    .map((s) => `${DIAS[s.diaSemana].toLowerCase()} de ${celdaATexto(s.inicio)} a ${celdaATexto(s.fin)}`)
                    .join(", ")}
                  ) no se podrá reservar.
                </MessageBarBody>
              </MessageBar>
            )}

            <div>
              <div className={styles.herramientas} role="group" aria-label="Herramienta">
                <ToggleButton
                  checked={herramienta === "pintar"}
                  appearance={herramienta === "pintar" ? "primary" : "secondary"}
                  icon={<PaintBrush20Regular />}
                  onClick={() => setHerramienta("pintar")}
                >
                  Pintar
                </ToggleButton>
                <ToggleButton
                  checked={herramienta === "borrar"}
                  appearance={herramienta === "borrar" ? "primary" : "secondary"}
                  icon={<Eraser20Regular />}
                  onClick={() => setHerramienta("borrar")}
                >
                  Borrar
                </ToggleButton>
              </div>
              <Caption1 className={styles.muted}>
                Arrastra para pintar y estira el borde de una franja para ajustarla. Clic derecho o Mayús borra
                mientras arrastras.
              </Caption1>
            </div>

            <Menu>
              <MenuTrigger disableButtonEnhancement>
                <Button icon={<Copy20Regular />} className={styles.copiar}>
                  Copiar el {diaActivoNombre} a…
                </Button>
              </MenuTrigger>
              <MenuPopover>
                <MenuList>
                  <MenuItem onClick={() => copiarA(DIAS_HABILES)}>Días hábiles (lun a vie)</MenuItem>
                  <MenuItem onClick={() => copiarA(ORDEN_DIAS)}>Todos los días</MenuItem>
                </MenuList>
              </MenuPopover>
            </Menu>

            <div className={styles.secundarias}>
              <Button appearance="subtle" icon={<ArrowUndo20Regular />} onClick={deshacer} disabled={historial.length === 0}>
                Deshacer
              </Button>
              <Button
                appearance="subtle"
                icon={<Delete20Regular />}
                onClick={() => cambiar(semanaVacia())}
                disabled={horas === 0}
              >
                Vaciar semana
              </Button>
            </div>
          </Surface>

          <Surface flush className={styles.rejilla}>
            <RejillaFranjas
              celdas={celdas}
              onCambiar={cambiar}
              herramienta={herramienta}
              diaActivo={diaActivo}
              onDiaActivo={setDiaActivo}
              hoy={hoy}
            />
          </Surface>
        </div>
      )}
    </Page>
  );
}
