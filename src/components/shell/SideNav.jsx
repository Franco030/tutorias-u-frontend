import { useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Caption1, makeStyles, mergeClasses, tokens, Tooltip } from "@fluentui/react-components";
import { veloHover, veloPresionado } from "../../theme/superficies";

const ITEM_HEIGHT = 40;
const SECTION_HEADER_HEIGHT = 32;
// Relleno lateral del menú (spacingHorizontalS): en compacto el elemento mide
// lo mismo que su alto, un cuadrado de 40 px dentro del riel de 56 px.
const NAV_PADDING = 8;

const useStyles = makeStyles({
  root: {
    boxSizing: "border-box",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXXS,
    // Ocupa todo el alto del panel para poder anclar la sección fija al pie.
    minHeight: "100%",
    paddingBlock: tokens.spacingVerticalS,
    paddingInline: `${NAV_PADDING}px`,
  },
  // Sección fija (Ayuda): al pie del menú, como Configuración en NavigationView.
  seccionFija: {
    marginTop: "auto",
    paddingTop: tokens.spacingVerticalL,
  },
  // Encabezado de sección con la misma altura en riel y panel: así, al abrir
  // el menú, ningún elemento cambia de posición vertical.
  sectionHeader: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    height: `${SECTION_HEADER_HEIGHT}px`,
    paddingInline: tokens.spacingHorizontalM,
    color: tokens.colorNeutralForeground3,
    fontWeight: tokens.fontWeightSemibold,
    whiteSpace: "nowrap",
    overflow: "hidden",
  },
  // En el riel el título cede su lugar a una línea centrada en ese mismo alto;
  // ambos están siempre montados y se cruzan con un fundido.
  sectionTitle: {
    transitionProperty: "opacity",
    transitionDuration: tokens.durationNormal,
    transitionDelay: tokens.durationUltraFast,
    transitionTimingFunction: tokens.curveDecelerateMid,
  },
  sectionRule: {
    position: "absolute",
    left: `${NAV_PADDING}px`,
    width: "24px",
    top: "50%",
    height: "1px",
    backgroundColor: tokens.colorNeutralStroke2,
    opacity: 0,
    transitionProperty: "opacity",
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveDecelerateMid,
  },
  item: {
    boxSizing: "border-box",
    position: "relative",
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
    width: "100%",
    height: `${ITEM_HEIGHT}px`,
    paddingInline: "10px",
    // Casi recto para acompañar las escuadras del indicador.
    borderRadius: tokens.borderRadiusSmall,
    color: tokens.colorNeutralForeground2,
    textDecorationLine: "none",
    whiteSpace: "nowrap",
    overflow: "hidden",
    fontSize: tokens.fontSizeBase300,
    lineHeight: tokens.lineHeightBase300,
    // El ancho acompaña la apertura del panel (300 ms, misma curva).
    transitionProperty: "background-color, color, width",
    transitionDuration: `${tokens.durationFaster}, ${tokens.durationFaster}, ${tokens.durationSlow}`,
    transitionTimingFunction: `${tokens.curveEasyEase}, ${tokens.curveEasyEase}, ${tokens.curveDecelerateMin}`,
    "@media (hover: hover)": {
      ":hover": {
        backgroundColor: veloHover,
        color: tokens.colorNeutralForeground1,
      },
    },
    ":active": {
      backgroundColor: veloPresionado,
    },
    ":focus-visible": {
      outline: `${tokens.strokeWidthThick} solid ${tokens.colorStrokeFocus2}`,
      outlineOffset: "-2px",
    },
  },
  // Compacto: cuadrado bajo el ícono; se cierra con la salida del panel (200 ms).
  itemCompact: {
    width: `${ITEM_HEIGHT}px`,
    transitionDuration: `${tokens.durationFaster}, ${tokens.durationFaster}, ${tokens.durationNormal}`,
  },
  // El activo se marca con las escuadras (indicador) y el texto/ícono en azul.
  selected: {
    color: tokens.colorBrandForeground2,
    fontWeight: tokens.fontWeightSemibold,
    "@media (hover: hover)": {
      ":hover": {
        backgroundColor: `color-mix(in srgb, ${tokens.colorBrandBackground} 8%, transparent)`,
        color: tokens.colorBrandForeground2,
      },
    },
    ":active": {
      backgroundColor: `color-mix(in srgb, ${tokens.colorBrandBackground} 14%, transparent)`,
    },
  },
  icon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    fontSize: "20px",
    width: "20px",
    height: "20px",
  },
  iconSelected: {
    color: tokens.colorBrandForeground2,
  },
  // Al abrir, las etiquetas aparecen un instante después de que el panel
  // empieza a crecer; al cerrar se desvanecen enseguida, antes del recorte.
  label: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    transitionProperty: "opacity, transform",
    transitionDuration: tokens.durationNormal,
    transitionDelay: tokens.durationUltraFast,
    transitionTimingFunction: tokens.curveDecelerateMid,
  },
  oculto: {
    opacity: 0,
    transform: "translateX(-4px)",
    pointerEvents: "none",
    transitionDuration: tokens.durationFaster,
    transitionDelay: "0s",
  },
  visible: {
    opacity: 1,
  },
  // Indicador de selección: cuatro escuadras de marca en las esquinas del
  // elemento activo (10 px por brazo, 2 px de grosor), sin relleno. Se dibujan
  // con 8 degradados planos; las esquinas son rectas a propósito. Son siempre
  // las mismas cuatro: al cambiar de página se deslizan y al abrir o cerrar el
  // menú las de la derecha se desplazan junto con el ancho del elemento.
  indicator: {
    position: "absolute",
    top: 0,
    left: 0,
    height: `${ITEM_HEIGHT}px`,
    backgroundImage: Array(8).fill(`linear-gradient(${tokens.colorCompoundBrandStroke}, ${tokens.colorCompoundBrandStroke})`).join(", "),
    backgroundSize: "10px 2px, 2px 10px, 10px 2px, 2px 10px, 10px 2px, 2px 10px, 10px 2px, 2px 10px",
    backgroundPosition: "0 0, 0 0, 100% 0, 100% 0, 0 100%, 0 100%, 100% 100%, 100% 100%",
    backgroundRepeat: "no-repeat",
    pointerEvents: "none",
    zIndex: 2,
  },
  indicatorMoving: {
    transitionProperty: "transform, width, opacity",
    transitionDuration: `${tokens.durationSlow}, ${tokens.durationSlow}, ${tokens.durationSlow}`,
    transitionTimingFunction: `${tokens.curveDecelerateMax}, ${tokens.curveDecelerateMin}, ${tokens.curveDecelerateMax}`,
  },
  indicatorMovingCompact: {
    transitionDuration: `${tokens.durationSlow}, ${tokens.durationNormal}, ${tokens.durationSlow}`,
  },
});

// Tooltip solo en modo compacto. Siempre montado para que el elemento no se
// vuelva a crear al abrir o cerrar el menú (y así sus transiciones corran).
function NavTooltip({ label, compact, children }) {
  const [abierto, setAbierto] = useState(false);
  return (
    <Tooltip
      content={label}
      relationship="description"
      positioning="after"
      withArrow
      visible={compact && abierto}
      onVisibleChange={(_, data) => setAbierto(data.visible)}
    >
      {children}
    </Tooltip>
  );
}

/*
 * Navegación al estilo NavigationView de Windows: cuatro escuadras de marca
 * enmarcan el elemento activo y se deslizan al cambiar de página. El mismo
 * menú sirve de riel compacto (solo íconos, con tooltip) y de panel abierto;
 * al cambiar de modo, las etiquetas y los títulos se desvanecen en vez de
 * aparecer o desaparecer de golpe. El elemento activo usa el ícono Filled en azul.
 */
export function SideNav({ sections, selectedValue, compact = false, onNavigate }) {
  const styles = useStyles();
  const navigate = useNavigate();
  const itemRefs = useRef(new Map());
  const [indicator, setIndicator] = useState({ x: 0, y: 0, visible: false, animate: false });

  useLayoutEffect(() => {
    const medir = () => {
      const item = itemRefs.current.get(selectedValue);
      if (!item) {
        setIndicator((prev) => ({ ...prev, visible: false }));
        return;
      }
      setIndicator((prev) => ({
        x: item.offsetLeft,
        y: item.offsetTop,
        visible: true,
        animate: prev.visible,
      }));
    };
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, [selectedValue, sections]);

  const handleClick = (event, to) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button === 1) return;
    event.preventDefault();
    if (to !== selectedValue) navigate(to);
    onNavigate?.(to);
  };

  return (
    <nav className={styles.root} aria-label="Navegación principal">
      <span
        aria-hidden="true"
        className={mergeClasses(
          styles.indicator,
          indicator.animate && styles.indicatorMoving,
          indicator.animate && compact && styles.indicatorMovingCompact
        )}
        style={{
          transform: `translate(${indicator.x}px, ${indicator.y}px)`,
          // Ancho del elemento: cuadrado en compacto, todo el panel al abrir.
          width: compact ? `${ITEM_HEIGHT}px` : `calc(100% - ${NAV_PADDING * 2}px)`,
          opacity: indicator.visible ? 1 : 0,
        }}
      />
      {sections.map((section, index) => (
        <div
          key={section.title || index}
          role="group"
          aria-label={section.title}
          className={section.fija ? styles.seccionFija : undefined}
        >
          {index > 0 && !section.fija && (
            <div className={styles.sectionHeader} role={compact || !section.title ? "separator" : undefined}>
              {section.title && (
                <Caption1
                  as="span"
                  className={mergeClasses(styles.sectionTitle, compact ? styles.oculto : styles.visible)}
                  aria-hidden={compact || undefined}
                >
                  {section.title}
                </Caption1>
              )}
              <span
                className={styles.sectionRule}
                style={{ opacity: compact || !section.title ? 1 : 0 }}
                aria-hidden="true"
              />
            </div>
          )}
          {section.items.map(({ to, label, icon: Icon }) => {
            const activo = to === selectedValue;
            return (
              <div key={to}>
                <NavTooltip label={label} compact={compact}>
                  <a
                    href={to}
                    ref={(el) => {
                      if (el) itemRefs.current.set(to, el);
                      else itemRefs.current.delete(to);
                    }}
                    className={mergeClasses(styles.item, compact && styles.itemCompact, activo && styles.selected)}
                    aria-current={activo ? "page" : undefined}
                    onClick={(event) => handleClick(event, to)}
                  >
                    <span className={mergeClasses(styles.icon, activo && styles.iconSelected)} aria-hidden="true">
                      <Icon filled={activo} />
                    </span>
                    <span className={mergeClasses(styles.label, compact ? styles.oculto : styles.visible)}>
                      {label}
                    </span>
                  </a>
                </NavTooltip>
              </div>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export default SideNav;
