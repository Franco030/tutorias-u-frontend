import { useMemo, useState } from "react";
import {
  Body1,
  Caption1,
  makeStyles,
  mergeClasses,
  SearchBox,
  shorthands,
  Subtitle2,
  Tab,
  TabList,
  tokens,
} from "@fluentui/react-components";
import { Checkmark12Filled } from "@fluentui/react-icons";
import { keyframes } from "../../theme/motion";

const normalizarTexto = (texto = "") =>
  texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const SIN_CATEGORIA = "Otras materias";
const TODAS = "__todas__";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalL,
  },
  toolbar: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
  },
  searchRow: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalS,
    "@media (min-width: 640px)": {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
  },
  search: {
    width: "100%",
    maxWidth: "none",
    "@media (min-width: 640px)": {
      maxWidth: "360px",
    },
  },
  count: {
    color: tokens.colorNeutralForeground3,
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
  },
  tabs: {
    overflowX: "auto",
    marginInline: `calc(${tokens.spacingHorizontalS} * -1)`,
    scrollbarWidth: "none",
  },
  groups: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXL,
  },
  group: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalS,
    margin: 0,
    padding: 0,
    border: "none",
    minWidth: 0,
  },
  groupTitle: {
    padding: 0,
    color: tokens.colorNeutralForeground2,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 180px), 1fr))",
    gap: tokens.spacingHorizontalS,
  },
  tile: {
    boxSizing: "border-box",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 20px",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
    minHeight: "48px",
    paddingBlock: tokens.spacingVerticalS,
    paddingInline: tokens.spacingHorizontalM,
    textAlign: "start",
    font: "inherit",
    fontSize: tokens.fontSizeBase300,
    lineHeight: tokens.lineHeightBase300,
    color: tokens.colorNeutralForeground1,
    cursor: "pointer",
    backgroundColor: tokens.colorNeutralBackground1,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    transitionProperty: "background-color, border-color, box-shadow, transform",
    transitionDuration: tokens.durationFast,
    transitionTimingFunction: tokens.curveDecelerateMid,
    "@media (hover: hover)": {
      ":hover": {
        backgroundColor: tokens.colorNeutralBackground1Hover,
        ...shorthands.borderColor(tokens.colorNeutralStroke1Hover),
        boxShadow: tokens.shadow4,
      },
    },
    ":active": {
      transform: "scale(0.98)",
      transitionDuration: tokens.durationFaster,
    },
    ":focus-visible": {
      outline: `${tokens.strokeWidthThick} solid ${tokens.colorStrokeFocus2}`,
      outlineOffset: "2px",
    },
    ":disabled": {
      cursor: "not-allowed",
      opacity: 0.55,
    },
  },
  tileSelected: {
    backgroundColor: tokens.colorBrandBackground2,
    ...shorthands.borderColor(tokens.colorBrandStroke1),
    "@media (hover: hover)": {
      ":hover": {
        backgroundColor: tokens.colorBrandBackground2Hover,
        ...shorthands.borderColor(tokens.colorBrandStroke1),
      },
    },
  },
  tileName: {
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  },
  check: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "20px",
    height: "20px",
    boxSizing: "border-box",
    borderRadius: tokens.borderRadiusCircular,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStrokeAccessible}`,
    color: tokens.colorNeutralForegroundOnBrand,
    transitionProperty: "background-color, border-color",
    transitionDuration: tokens.durationFast,
  },
  checkSelected: {
    backgroundColor: tokens.colorCompoundBrandBackground,
    ...shorthands.borderColor(tokens.colorCompoundBrandBackground),
  },
  checkIcon: {
    display: "flex",
    animationName: keyframes.scaleIn,
    animationDuration: tokens.durationNormal,
    animationTimingFunction: tokens.curveDecelerateMax,
  },
  empty: {
    color: tokens.colorNeutralForeground3,
    paddingBlock: tokens.spacingVerticalL,
  },
});

/*
 * Selector de materias compartido: búsqueda sin acentos, pestañas por
 * categoría y mosaicos de tamaño fijo con estado aria-pressed. Seleccionar
 * solo cambia color e indicador; ningún elemento cambia de tamaño.
 */
export function MateriaSelector({ materias, seleccionadas, onToggle, disabled = false }) {
  const styles = useStyles();
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState(TODAS);

  const categorias = useMemo(
    () => [...new Set(materias.map((materia) => materia.categoria || SIN_CATEGORIA))],
    [materias]
  );

  const grupos = useMemo(() => {
    const termino = normalizarTexto(busqueda.trim());
    const mapa = new Map();
    materias.forEach((materia) => {
      const cat = materia.categoria || SIN_CATEGORIA;
      if (categoria !== TODAS && cat !== categoria) return;
      if (!normalizarTexto(materia.nombre).includes(termino)) return;
      if (!mapa.has(cat)) mapa.set(cat, []);
      mapa.get(cat).push(materia);
    });
    return [...mapa.entries()];
  }, [materias, busqueda, categoria]);

  const total = seleccionadas.length;
  const mostrarTitulos = categoria === TODAS && grupos.length > 1;

  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <div className={styles.searchRow}>
          <SearchBox
            className={styles.search}
            placeholder="Buscar materia"
            aria-label="Buscar materia"
            value={busqueda}
            onChange={(_, data) => setBusqueda(data.value)}
          />
          <Caption1 className={styles.count} role="status">
            {total === 0
              ? "Ninguna materia seleccionada"
              : `${total} ${total === 1 ? "materia seleccionada" : "materias seleccionadas"}`}
          </Caption1>
        </div>

        {categorias.length > 1 && (
          <div className={styles.tabs}>
            <TabList
              size="small"
              selectedValue={categoria}
              onTabSelect={(_, data) => setCategoria(data.value)}
              aria-label="Filtrar por categoría"
            >
              <Tab value={TODAS}>Todas</Tab>
              {categorias.map((cat) => (
                <Tab key={cat} value={cat}>
                  {cat}
                </Tab>
              ))}
            </TabList>
          </div>
        )}
      </div>

      {grupos.length === 0 ? (
        <Body1 className={styles.empty}>
          {busqueda
            ? `Ninguna materia coincide con “${busqueda}”. Prueba con otra palabra.`
            : "No hay materias en esta categoría."}
        </Body1>
      ) : (
        <div className={styles.groups}>
          {grupos.map(([cat, lista]) => (
            <fieldset key={cat} className={styles.group}>
              {mostrarTitulos && (
                <Subtitle2 as="legend" className={styles.groupTitle}>
                  {cat}
                </Subtitle2>
              )}
              <div className={styles.grid}>
                {lista.map((materia) => {
                  const activa = seleccionadas.includes(materia.id);
                  return (
                    <button
                      key={materia.id}
                      type="button"
                      aria-pressed={activa}
                      disabled={disabled}
                      className={mergeClasses(styles.tile, activa && styles.tileSelected)}
                      onClick={() => onToggle(materia.id)}
                    >
                      <span className={styles.tileName}>{materia.nombre}</span>
                      <span className={mergeClasses(styles.check, activa && styles.checkSelected)} aria-hidden="true">
                        {activa && (
                          <span className={styles.checkIcon}>
                            <Checkmark12Filled />
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>
      )}
    </div>
  );
}

export default MateriaSelector;
