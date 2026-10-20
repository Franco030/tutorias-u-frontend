import { useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Caption1, makeStyles, mergeClasses, tokens, Tooltip } from "@fluentui/react-components";

const ITEM_HEIGHT = 40;
const SECTION_HEADER_HEIGHT = 32;

const useStyles = makeStyles({
  root: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXXS,
    paddingBlock: tokens.spacingVerticalS,
    paddingInline: tokens.spacingHorizontalS,
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
  // En el riel el título se sustituye por una línea centrada en ese mismo alto.
  sectionRule: {
    position: "absolute",
    left: tokens.spacingHorizontalS,
    right: tokens.spacingHorizontalS,
    top: "50%",
    height: "1px",
    backgroundColor: tokens.colorNeutralStroke2,
  },
  item: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
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
    transitionProperty: "background-color, color",
    transitionDuration: tokens.durationFaster,
    transitionTimingFunction: tokens.curveEasyEase,
    "@media (hover: hover)": {
      ":hover": {
        backgroundColor: tokens.colorSubtleBackgroundHover,
        color: tokens.colorNeutralForeground1,
      },
    },
    ":active": {
      backgroundColor: tokens.colorSubtleBackgroundPressed,
    },
    ":focus-visible": {
      outline: `${tokens.strokeWidthThick} solid ${tokens.colorStrokeFocus2}`,
      outlineOffset: "-2px",
    },
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
    flexShrink: 0,
    fontSize: "20px",
    width: "20px",
    height: "20px",
    transitionProperty: "transform",
    transitionDuration: tokens.durationFast,
    transitionTimingFunction: tokens.curveDecelerateMid,
  },
  iconSelected: {
    color: tokens.colorBrandForeground2,
  },
  label: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    transitionProperty: "opacity, transform",
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveDecelerateMid,
  },
  hidden: {
    opacity: 0,
    transform: "translateX(-4px)",
    pointerEvents: "none",
  },
  // Indicador de selección: cuatro escuadras de marca en las esquinas del
  // elemento activo (10 px por brazo, 2 px de grosor), sin relleno. Se dibujan
  // con 8 degradados planos; las esquinas son rectas a propósito.
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
    transitionDuration: tokens.durationSlow,
    transitionTimingFunction: tokens.curveDecelerateMax,
  },
});

/*
 * Navegación al estilo NavigationView de Windows: cuatro escuadras de marca
 * enmarcan el elemento activo y se deslizan al cambiar de página, modo compacto (solo íconos con tooltip) y
 * transición de etiquetas. El elemento activo usa el ícono Filled en azul.
 */
export function SideNav({ sections, selectedValue, compact = false, onNavigate }) {
  const styles = useStyles();
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const itemRefs = useRef(new Map());
  const [indicator, setIndicator] = useState({ x: 0, y: 0, width: 0, visible: false, animate: false });

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
        width: item.offsetWidth,
        visible: true,
        animate: prev.visible,
      }));
    };
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, [selectedValue, compact, sections]);

  const handleClick = (event, to) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button === 1) return;
    event.preventDefault();
    if (to !== selectedValue) navigate(to);
    onNavigate?.(to);
  };

  return (
    <nav ref={rootRef} className={styles.root} aria-label="Navegación principal">
      <span
        aria-hidden="true"
        className={mergeClasses(styles.indicator, indicator.animate && styles.indicatorMoving)}
        style={{
          transform: `translate(${indicator.x}px, ${indicator.y}px)`,
          width: `${indicator.width}px`,
          opacity: indicator.visible ? 1 : 0,
        }}
      />
      {sections.map((section, index) => (
        <div key={section.title || index} role="group" aria-label={section.title}>
          {index > 0 && (
            <div className={styles.sectionHeader} role={compact || !section.title ? "separator" : undefined}>
              {section.title && !compact ? (
                <Caption1 as="span">{section.title}</Caption1>
              ) : (
                <span className={styles.sectionRule} aria-hidden="true" />
              )}
            </div>
          )}
          {section.items.map(({ to, label, icon: Icon }) => {
            const activo = to === selectedValue;
            const enlace = (
              <a
                href={to}
                ref={(el) => {
                  if (el) itemRefs.current.set(to, el);
                  else itemRefs.current.delete(to);
                }}
                className={mergeClasses(styles.item, activo && styles.selected)}
                aria-current={activo ? "page" : undefined}
                aria-label={compact ? label : undefined}
                onClick={(event) => handleClick(event, to)}
              >
                <span className={mergeClasses(styles.icon, activo && styles.iconSelected)} aria-hidden="true">
                  <Icon filled={activo} />
                </span>
                <span className={mergeClasses(styles.label, compact && styles.hidden)}>{label}</span>
              </a>
            );

            return compact ? (
              <Tooltip key={to} content={label} relationship="description" positioning="after" withArrow>
                {enlace}
              </Tooltip>
            ) : (
              <div key={to}>{enlace}</div>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export default SideNav;
