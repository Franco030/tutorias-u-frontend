import { Link } from "react-router-dom";
import {
  Caption1,
  makeStyles,
  mergeClasses,
  Skeleton,
  SkeletonItem,
  Text,
  tokens,
} from "@fluentui/react-components";
import { ChevronRight20Regular } from "@fluentui/react-icons";

const formatoMes = new Intl.DateTimeFormat("es-MX", { month: "short" });

const useStyles = makeStyles({
  list: {
    display: "flex",
    flexDirection: "column",
    margin: 0,
    padding: 0,
    listStyleType: "none",
    backgroundColor: tokens.colorNeutralBackground1,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusXLarge,
    boxShadow: tokens.shadow4,
    overflow: "hidden",
  },
  item: {
    borderBottom: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke3}`,
    ":last-child": {
      borderBottomStyle: "none",
    },
    // Las filas tocan el borde de la lista: heredan el radio en sus esquinas
    // exteriores para que el hover y el anillo de foco no se corten.
    ":first-child > *": {
      borderTopLeftRadius: tokens.borderRadiusXLarge,
      borderTopRightRadius: tokens.borderRadiusXLarge,
    },
    ":last-child > *": {
      borderBottomLeftRadius: tokens.borderRadiusXLarge,
      borderBottomRightRadius: tokens.borderRadiusXLarge,
    },
  },
  row: {
    boxSizing: "border-box",
    display: "grid",
    gridTemplateColumns: "56px minmax(0, 1fr) auto",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
    width: "100%",
    paddingBlock: tokens.spacingVerticalM,
    paddingInline: tokens.spacingHorizontalL,
    textAlign: "start",
    font: "inherit",
    color: tokens.colorNeutralForeground1,
    textDecorationLine: "none",
    backgroundColor: "transparent",
    border: "none",
  },
  interactive: {
    cursor: "pointer",
    transitionProperty: "background-color",
    transitionDuration: tokens.durationFaster,
    "& .chevron": {
      transitionProperty: "transform",
      transitionDuration: tokens.durationNormal,
      transitionTimingFunction: tokens.curveDecelerateMid,
    },
    "@media (hover: hover)": {
      ":hover": { backgroundColor: tokens.colorNeutralBackground1Hover },
      ":hover .chevron": { transform: "translateX(3px)" },
    },
    ":active": { backgroundColor: tokens.colorNeutralBackground1Pressed },
    ":focus-visible": {
      outline: `${tokens.strokeWidthThick} solid ${tokens.colorStrokeFocus2}`,
      outlineOffset: "-2px",
    },
  },
  stacked: {
    "@media (max-width: 639px)": {
      gridTemplateColumns: "56px minmax(0, 1fr)",
    },
  },
  date: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "56px",
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground2,
    fontVariantNumeric: "tabular-nums",
  },
  muted: {
    backgroundColor: tokens.colorNeutralBackground3,
    color: tokens.colorNeutralForeground3,
  },
  dateDay: {
    fontSize: tokens.fontSizeBase500,
    lineHeight: tokens.lineHeightBase500,
    fontWeight: tokens.fontWeightSemibold,
  },
  dateMonth: {
    textTransform: "uppercase",
    fontSize: tokens.fontSizeBase100,
    lineHeight: tokens.lineHeightBase100,
  },
  text: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
  },
  title: {
    fontWeight: tokens.fontWeightSemibold,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  meta: {
    color: tokens.colorNeutralForeground3,
    fontVariantNumeric: "tabular-nums",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  end: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: tokens.spacingHorizontalS,
    color: tokens.colorNeutralForeground3,
  },
  endStacked: {
    "@media (max-width: 639px)": {
      gridColumn: "1 / -1",
      justifyContent: "stretch",
      "& > *": { flexGrow: 1 },
    },
  },
  skeletonRow: {
    display: "grid",
    gridTemplateColumns: "56px minmax(0, 1fr)",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
    padding: tokens.spacingHorizontalL,
  },
  skeletonText: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalS,
  },
});

export function SessionList({ children, label }) {
  const styles = useStyles();
  return (
    <ul className={styles.list} aria-label={label}>
      {children}
    </ul>
  );
}

function DateBlock({ fecha, muted }) {
  const styles = useStyles();
  return (
    <span className={mergeClasses(styles.date, muted && styles.muted)} aria-hidden="true">
      <span className={styles.dateDay}>{fecha.getDate()}</span>
      <span className={styles.dateMonth}>{formatoMes.format(fecha).replace(".", "")}</span>
    </span>
  );
}

/*
 * Fila de sesión: bloque de fecha, título y metadatos, y un extremo opcional.
 * Con `to` es un enlace, con `onClick` un botón; con `actions` muestra botones
 * propios (que en móvil pasan a una línea completa). Con `id`, el título y los
 * metadatos llevan ids para `descripcionDeFila` (lib/filas.js).
 */
export function SessionRow({ id, fecha, title, meta, end, actions, to, onClick, muted = false }) {
  const styles = useStyles();
  const contenido = (
    <>
      <DateBlock fecha={fecha} muted={muted} />
      <span className={styles.text}>
        <Text className={styles.title} id={id ? `${id}-titulo` : undefined}>
          {title}
        </Text>
        {meta && (
          <Caption1 className={styles.meta} id={id ? `${id}-meta` : undefined}>
            {meta}
          </Caption1>
        )}
      </span>
      {(end || to || onClick) && !actions && (
        <span className={styles.end}>
          {end}
          {(to || onClick) && <ChevronRight20Regular className="chevron" aria-hidden="true" />}
        </span>
      )}
    </>
  );

  if (to) {
    return (
      <li className={styles.item}>
        <Link to={to} className={mergeClasses(styles.row, styles.interactive)}>
          {contenido}
        </Link>
      </li>
    );
  }

  if (onClick) {
    return (
      <li className={styles.item}>
        <button
          type="button"
          onClick={onClick}
          className={mergeClasses(styles.row, styles.interactive)}
        >
          {contenido}
        </button>
      </li>
    );
  }

  return (
    <li className={styles.item}>
      <div className={mergeClasses(styles.row, actions && styles.stacked)}>
        {contenido}
        {actions && <span className={mergeClasses(styles.end, styles.endStacked)}>{actions}</span>}
      </div>
    </li>
  );
}

export function SessionListSkeleton({ rows = 2 }) {
  const styles = useStyles();
  return (
    <Skeleton aria-label="Cargando" className={styles.list}>
      {Array.from({ length: rows }, (_, fila) => (
        <div key={fila} className={styles.skeletonRow}>
          <SkeletonItem shape="square" size={56} />
          <div className={styles.skeletonText}>
            <SkeletonItem size={16} style={{ width: "40%" }} />
            <SkeletonItem size={12} style={{ width: "65%" }} />
          </div>
        </div>
      ))}
    </Skeleton>
  );
}
