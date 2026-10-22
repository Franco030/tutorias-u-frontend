import { useRef, useState } from "react";
import { Caption1, makeStyles, mergeClasses, tokens } from "@fluentui/react-components";
import { veloHover } from "../../../theme/superficies";
import {
  CELDAS,
  CELDAS_SESION,
  celdaATexto,
  DIAS,
  DIAS_CORTOS,
  formatoHoras,
  franjasDelDia,
  HORA_INICIO,
  horasDelDia,
  MINUTOS_CELDA,
  ORDEN_DIAS,
} from "./franjas";

// Con 19 px la semana entera (6:00 a 22:00) cabe sin desplazar la página en
// una pantalla de 1080 px con la barra del navegador.
const ALTO_CELDA = 19;
const ANCHO_HORAS = 52;
const COLUMNAS = `${ANCHO_HORAS}px repeat(7, minmax(0, 1fr))`;

const useStyles = makeStyles({
  rejilla: {
    userSelect: "none",
  },
  cabecera: {
    position: "sticky",
    top: 0,
    zIndex: 3,
    display: "grid",
    gridTemplateColumns: COLUMNAS,
    backgroundColor: tokens.colorNeutralBackground1,
    borderBottom: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
  },
  dia: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2px",
    minWidth: 0,
    paddingBlock: tokens.spacingVerticalS,
    border: "none",
    borderBottom: `${tokens.strokeWidthThick} solid transparent`,
    backgroundColor: "transparent",
    color: tokens.colorNeutralForeground2,
    font: "inherit",
    cursor: "pointer",
    "@media (hover: hover)": {
      ":hover": { backgroundColor: veloHover },
    },
    ":focus-visible": {
      outline: `${tokens.strokeWidthThick} solid ${tokens.colorStrokeFocus2}`,
      outlineOffset: "-2px",
    },
  },
  diaActivo: {
    color: tokens.colorBrandForeground1,
    fontWeight: tokens.fontWeightSemibold,
    borderBottomColor: tokens.colorCompoundBrandStroke,
  },
  diaHoy: {
    color: tokens.colorBrandForeground1,
  },
  horasDia: {
    color: tokens.colorNeutralForeground3,
    fontVariantNumeric: "tabular-nums",
  },
  cuerpo: {
    position: "relative",
    display: "grid",
    gridTemplateColumns: COLUMNAS,
    gridTemplateRows: `repeat(${CELDAS}, ${ALTO_CELDA}px)`,
    // Se pinta arrastrando: el gesto no debe desplazar la página…
    touchAction: "none",
  },
  fila: {
    display: "contents",
  },
  hora: {
    position: "relative",
    paddingInlineEnd: tokens.spacingHorizontalS,
    textAlign: "end",
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase100,
    lineHeight: tokens.lineHeightBase100,
    fontVariantNumeric: "tabular-nums",
    // …salvo en la columna de horas, desde donde sí se desplaza en móvil.
    touchAction: "pan-y",
  },
  horaTexto: {
    position: "relative",
    top: "-7px",
  },
  celda: {
    borderLeft: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke3}`,
    cursor: "crosshair",
    "@media (hover: hover)": {
      ":hover": { backgroundColor: veloHover },
    },
    ":focus-visible": {
      outline: `${tokens.strokeWidthThick} solid ${tokens.colorStrokeFocus2}`,
      outlineOffset: "-2px",
      zIndex: 2,
    },
  },
  // Línea de cada hora en punto (las medias horas van punteadas).
  celdaHora: {
    borderTop: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
  },
  celdaMedia: {
    borderTop: `${tokens.strokeWidthThin} dashed ${tokens.colorNeutralStroke3}`,
  },
  capa: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: `${ANCHO_HORAS}px`,
    right: 0,
    display: "grid",
    gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
    gridTemplateRows: `repeat(${CELDAS}, ${ALTO_CELDA}px)`,
    pointerEvents: "none",
  },
  franja: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: "1px",
    minWidth: 0,
    marginBlock: "1px",
    marginInline: "3px",
    paddingBlock: "3px",
    paddingInline: tokens.spacingHorizontalXS,
    overflow: "hidden",
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    boxShadow: tokens.shadow2,
    fontSize: tokens.fontSizeBase100,
    lineHeight: tokens.lineHeightBase100,
    fontVariantNumeric: "tabular-nums",
    "& .grip": { opacity: 0 },
    "@media (hover: hover)": {
      ":hover .grip": { opacity: 1 },
    },
  },
  franjaTexto: {
    fontWeight: tokens.fontWeightSemibold,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  franjaHoras: {
    opacity: 0.85,
  },
  // Media hora al final que no completa una sesión de 1 h: rayada.
  sobrante: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: `${ALTO_CELDA}px`,
    backgroundImage: `repeating-linear-gradient(135deg, transparent 0 5px, color-mix(in srgb, ${tokens.colorNeutralForegroundOnBrand} 35%, transparent) 5px 7px)`,
  },
  // Bordes para estirar la franja.
  grip: {
    position: "absolute",
    left: 0,
    right: 0,
    height: "8px",
    cursor: "ns-resize",
    pointerEvents: "auto",
    touchAction: "none",
    transitionProperty: "opacity",
    transitionDuration: tokens.durationFaster,
    "::after": {
      content: '""',
      position: "absolute",
      left: "50%",
      top: "3px",
      width: "20px",
      height: "2px",
      marginLeft: "-10px",
      borderRadius: tokens.borderRadiusCircular,
      backgroundColor: tokens.colorNeutralForegroundOnBrand,
    },
  },
  gripInicio: { top: 0 },
  gripFin: { bottom: 0 },
  // Vista previa del gesto, siempre por encima de las franjas: al borrar se
  // ve qué parte del horario se va a cortar.
  vista: {
    position: "relative",
    zIndex: 2,
    margin: "1px 3px",
    borderRadius: tokens.borderRadiusMedium,
    border: `${tokens.strokeWidthThick} dashed ${tokens.colorBrandStroke1}`,
    backgroundColor: `color-mix(in srgb, ${tokens.colorBrandBackground} 18%, transparent)`,
  },
  vistaBorrar: {
    border: `${tokens.strokeWidthThick} solid ${tokens.colorPaletteRedBorderActive}`,
    backgroundColor: `color-mix(in srgb, ${tokens.colorPaletteRedBackground3} 45%, transparent)`,
    backgroundImage: `repeating-linear-gradient(135deg, transparent 0 6px, color-mix(in srgb, ${tokens.colorPaletteRedBorderActive} 55%, transparent) 6px 8px)`,
  },
  ahora: {
    position: "absolute",
    left: 0,
    right: 0,
    height: "2px",
    backgroundColor: tokens.colorPaletteRedBorderActive,
    zIndex: 1,
    "::before": {
      content: '""',
      position: "absolute",
      left: "-4px",
      top: "-3px",
      width: "8px",
      height: "8px",
      borderRadius: tokens.borderRadiusCircular,
      backgroundColor: tokens.colorPaletteRedBorderActive,
    },
  },
});

const limitar = (valor, min, max) => Math.min(max, Math.max(min, valor));

/*
 * Rejilla semanal para pintar la disponibilidad (estilo calendario de
 * Outlook): columna de horas, una columna por día y las franjas en azul.
 * Ratón o táctil: arrastrar pinta (o borra, con la herramienta Borrar, con
 * Mayús o con el botón derecho) un rectángulo que puede abarcar varios días; los bordes de una franja
 * se estiran. Teclado: es una rejilla ARIA; las flechas mueven la celda
 * activa, Espacio pinta y Mayús + Espacio borra.
 */
export function RejillaFranjas({ celdas, onCambiar, herramienta, diaActivo, onDiaActivo, hoy }) {
  const styles = useStyles();
  const cuerpoRef = useRef(null);
  const [arrastre, setArrastre] = useState(null);
  const [foco, setFoco] = useState({ col: 0, celda: (9 - HORA_INICIO) * 2 });

  const posicionDe = (event) => {
    const rect = cuerpoRef.current.getBoundingClientRect();
    const anchoCol = (rect.width - ANCHO_HORAS) / 7;
    return {
      col: limitar(Math.floor((event.clientX - rect.left - ANCHO_HORAS) / anchoCol), 0, 6),
      celda: limitar(Math.floor((event.clientY - rect.top) / ALTO_CELDA), 0, CELDAS - 1),
    };
  };

  // Celdas resultantes del gesto en curso (o de uno terminado).
  const aplicar = (gesto, base = celdas) => {
    const nuevas = base.map((dia) => [...dia]);
    if (gesto.tipo === "estirar") {
      const { dia, inicio, fin, borde } = gesto.franja;
      const nuevoInicio = borde === "inicio" ? limitar(gesto.hasta.celda, 0, fin - 1) : inicio;
      const nuevoFin = borde === "fin" ? limitar(gesto.hasta.celda + 1, inicio + 1, CELDAS) : fin;
      for (let c = inicio; c < fin; c += 1) nuevas[dia][c] = false;
      for (let c = nuevoInicio; c < nuevoFin; c += 1) nuevas[dia][c] = true;
      return nuevas;
    }
    const [c0, c1] = [gesto.desde.col, gesto.hasta.col].sort((a, b) => a - b);
    const [s0, s1] = [gesto.desde.celda, gesto.hasta.celda].sort((a, b) => a - b);
    for (let col = c0; col <= c1; col += 1) {
      for (let c = s0; c <= s1; c += 1) nuevas[ORDEN_DIAS[col]][c] = gesto.tipo === "pintar";
    }
    return nuevas;
  };

  const alPresionar = (event) => {
    // Botón principal pinta (según la herramienta); el derecho siempre borra.
    if (event.button !== 0 && event.button !== 2) return;
    const borrar = event.button === 2 || event.shiftKey || herramienta === "borrar";
    const grip = event.target.closest("[data-grip]");
    const rect = cuerpoRef.current.getBoundingClientRect();
    if (!grip && event.clientX - rect.left < ANCHO_HORAS) return;

    event.preventDefault();
    cuerpoRef.current.setPointerCapture(event.pointerId);
    const pos = posicionDe(event);
    if (grip && event.button === 0) {
      const franja = {
        dia: Number(grip.dataset.dia),
        inicio: Number(grip.dataset.inicio),
        fin: Number(grip.dataset.fin),
        borde: grip.dataset.grip,
      };
      setArrastre({ tipo: "estirar", franja, desde: pos, hasta: pos });
      onDiaActivo(franja.dia);
      return;
    }
    setArrastre({ tipo: borrar ? "borrar" : "pintar", desde: pos, hasta: pos });
    setFoco(pos);
    onDiaActivo(ORDEN_DIAS[pos.col]);
  };

  const alMover = (event) => {
    if (!arrastre) return;
    const pos = posicionDe(event);
    if (pos.col !== arrastre.hasta.col || pos.celda !== arrastre.hasta.celda) {
      setArrastre({ ...arrastre, hasta: pos });
    }
  };

  const alSoltar = () => {
    if (!arrastre) return;
    onCambiar(aplicar(arrastre));
    setArrastre(null);
  };

  const enfocar = (pos) => {
    setFoco(pos);
    onDiaActivo(ORDEN_DIAS[pos.col]);
    cuerpoRef.current?.querySelector(`[data-celda="${pos.col}-${pos.celda}"]`)?.focus();
  };

  const alTeclear = (event) => {
    const movimientos = {
      ArrowUp: { col: 0, celda: -1 },
      ArrowDown: { col: 0, celda: 1 },
      ArrowLeft: { col: -1, celda: 0 },
      ArrowRight: { col: 1, celda: 0 },
    };
    if (movimientos[event.key]) {
      event.preventDefault();
      const delta = movimientos[event.key];
      enfocar({ col: limitar(foco.col + delta.col, 0, 6), celda: limitar(foco.celda + delta.celda, 0, CELDAS - 1) });
    } else if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      const tipo = event.shiftKey || herramienta === "borrar" ? "borrar" : "pintar";
      onCambiar(aplicar({ tipo, desde: foco, hasta: foco }));
    }
  };

  // Mientras se arrastra se muestra el resultado; al soltar se aplica.
  const vistaEstirar = arrastre?.tipo === "estirar" ? aplicar(arrastre) : null;
  const visibles = vistaEstirar ?? celdas;
  const hoyCol = hoy ? ORDEN_DIAS.indexOf(hoy.dia) : -1;
  const hoyTop = hoy ? ((hoy.minutos - HORA_INICIO * 60) / MINUTOS_CELDA) * ALTO_CELDA : -1;

  return (
    <div
      role="grid"
      aria-label="Disponibilidad semanal"
      aria-rowcount={CELDAS + 1}
      aria-colcount={8}
      className={styles.rejilla}
      onKeyDown={alTeclear}
    >
      <div role="rowgroup">
        <div role="row" className={styles.cabecera}>
          <span role="columnheader" aria-label="Hora" />
          {ORDEN_DIAS.map((dia) => (
            <span key={dia} role="columnheader" aria-label={DIAS[dia]} style={{ display: "contents" }}>
              <button
                type="button"
                className={mergeClasses(
                  styles.dia,
                  dia === hoy?.dia && styles.diaHoy,
                  dia === diaActivo && styles.diaActivo
                )}
                aria-pressed={dia === diaActivo}
                onClick={() => onDiaActivo(dia)}
              >
                <span>{DIAS_CORTOS[dia]}</span>
                <Caption1 className={styles.horasDia}>{formatoHoras(horasDelDia(celdas[dia]))} h</Caption1>
              </button>
            </span>
          ))}
        </div>
      </div>

      <div
        role="rowgroup"
        ref={cuerpoRef}
        className={styles.cuerpo}
        onPointerDown={alPresionar}
        onPointerMove={alMover}
        onPointerUp={alSoltar}
        onPointerCancel={() => setArrastre(null)}
        // El clic derecho borra: sin el menú contextual del navegador.
        onContextMenu={(event) => event.preventDefault()}
      >
        {Array.from({ length: CELDAS }, (_, celda) => {
          const enPunto = celda % CELDAS_SESION === 0;
          return (
            <div key={celda} role="row" className={styles.fila}>
              <span role="rowheader" className={styles.hora} aria-label={celdaATexto(celda)}>
                {enPunto && celda > 0 && <span className={styles.horaTexto}>{celdaATexto(celda)}</span>}
              </span>
              {ORDEN_DIAS.map((dia, col) => {
                const pintada = celdas[dia][celda];
                const activa = foco.col === col && foco.celda === celda;
                return (
                  <span
                    key={dia}
                    role="gridcell"
                    data-celda={`${col}-${celda}`}
                    tabIndex={activa ? 0 : -1}
                    aria-selected={pintada}
                    aria-label={`${DIAS[dia]}, ${celdaATexto(celda)} a ${celdaATexto(celda + 1)}, ${pintada ? "disponible" : "libre"}`}
                    className={mergeClasses(styles.celda, enPunto ? styles.celdaHora : styles.celdaMedia)}
                    onFocus={() => setFoco({ col, celda })}
                  />
                );
              })}
            </div>
          );
        })}

        <div className={styles.capa} aria-hidden="true">
          {ORDEN_DIAS.map((dia, col) =>
            franjasDelDia(visibles[dia]).map(({ inicio, fin }) => {
              const largo = fin - inicio;
              const datos = { "data-dia": dia, "data-inicio": inicio, "data-fin": fin };
              return (
                <div
                  key={`${dia}-${inicio}`}
                  className={styles.franja}
                  style={{ gridColumn: col + 1, gridRow: `${inicio + 1} / ${fin + 1}` }}
                >
                  <span className={mergeClasses("grip", styles.grip, styles.gripInicio)} data-grip="inicio" {...datos} />
                  <span className={styles.franjaTexto}>
                    {celdaATexto(inicio)} – {celdaATexto(fin)}
                  </span>
                  {largo >= 3 && (
                    <span className={styles.franjaHoras}>{formatoHoras(largo / CELDAS_SESION)} h</span>
                  )}
                  {largo % CELDAS_SESION !== 0 && <span className={styles.sobrante} />}
                  <span className={mergeClasses("grip", styles.grip, styles.gripFin)} data-grip="fin" {...datos} />
                </div>
              );
            })
          )}

          {arrastre && arrastre.tipo !== "estirar" && (
            <div
              className={mergeClasses(styles.vista, arrastre.tipo === "borrar" && styles.vistaBorrar)}
              style={{
                gridColumn: `${Math.min(arrastre.desde.col, arrastre.hasta.col) + 1} / ${Math.max(arrastre.desde.col, arrastre.hasta.col) + 2}`,
                gridRow: `${Math.min(arrastre.desde.celda, arrastre.hasta.celda) + 1} / ${Math.max(arrastre.desde.celda, arrastre.hasta.celda) + 2}`,
              }}
            />
          )}

          {hoyCol >= 0 && hoyTop >= 0 && hoyTop <= CELDAS * ALTO_CELDA && (
            <div className={styles.ahora} style={{ gridColumn: `${hoyCol + 1} / ${hoyCol + 2}`, gridRow: "1 / -1", top: `${hoyTop}px` }} />
          )}
        </div>
      </div>
    </div>
  );
}

export default RejillaFranjas;
