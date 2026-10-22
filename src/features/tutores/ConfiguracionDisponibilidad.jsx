import { useEffect, useState } from "react";
import { useNotificar } from "../../hooks/useNotificar";
import {
  Badge,
  Body1,
  Button,
  Caption1,
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
import { getDisponibilidadTutor, guardarDisponibilidadTutor } from "../../services/tutorService";
import { ahoraEnPlataforma } from "../../lib/horaPlataforma";
import { Page, PageHeader, PageLoading, Surface } from "../../components/ui/Page";
import { RejillaFranjas } from "./disponibilidad/RejillaFranjas";
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

const useStyles = makeStyles({
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
  rejilla: {
    padding: 0,
    overflow: "hidden",
  },
  pie: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    columnGap: tokens.spacingHorizontalL,
    rowGap: tokens.spacingVerticalXXS,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderTop: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    color: tokens.colorNeutralForeground3,
  },
  tecla: {
    paddingInline: "4px",
    borderRadius: tokens.borderRadiusSmall,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke1}`,
    fontWeight: tokens.fontWeightSemibold,
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

  useEffect(() => {
    let activo = true;

    const cargarDisponibilidad = async () => {
      try {
        setCargando(true);
        setError("");
        const disponibilidad = await getDisponibilidadTutor(user.id);
        if (!activo) return;
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

  const handleGuardar = async () => {
    setError("");
    try {
      setGuardando(true);
      const guardados = await guardarDisponibilidadTutor(bloquesParaGuardar(celdas).bloques);
      const resultado = celdasDesdeBloques((Array.isArray(guardados) ? guardados : []).map(normalizarBloque));
      setCeldas(resultado.celdas);
      setHistorial([]);
      setAjuste("");
      notificar("Disponibilidad guardada", { cuerpo: "Los estudiantes ya pueden reservar estos horarios." });
      setCambiosSinGuardar(false);
    } catch (err) {
      console.error("Error al guardar disponibilidad:", err);
      setError(err.message || "No se pudo guardar tu disponibilidad. Intenta nuevamente.");
    } finally {
      setGuardando(false);
    }
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
            disabled={guardando || !cargaCompleta || !cambiosSinGuardar}
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
      {ajuste && (
        <MessageBar intent="warning" layout="multiline">
          <MessageBarBody>{ajuste}</MessageBarBody>
        </MessageBar>
      )}

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
            <Caption1 className={styles.muted}>Clic derecho o Mayús para borrar mientras arrastras.</Caption1>
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
          <Caption1 as="p" className={styles.pie}>
            <span>Arrastra para pintar</span>
            <span>Estira el borde de una franja</span>
            <span>
              <span className={styles.tecla}>Espacio</span> pinta con el teclado
            </span>
          </Caption1>
        </Surface>
      </div>
    </Page>
  );
}
