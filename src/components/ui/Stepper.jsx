import { Caption1, makeStyles, mergeClasses, Text, tokens } from "@fluentui/react-components";
import { Checkmark16Filled } from "@fluentui/react-icons";
import { keyframes } from "../../theme/motion";

const useStyles = makeStyles({
  list: {
    display: "flex",
    gap: tokens.spacingHorizontalS,
    margin: 0,
    padding: 0,
    listStyleType: "none",
    overflowX: "auto",
    "@media (min-width: 1024px)": {
      flexDirection: "column",
      gap: 0,
      overflowX: "visible",
    },
  },
  item: {
    position: "relative",
    flexShrink: 0,
    "@media (min-width: 1024px)": {
      paddingBottom: tokens.spacingVerticalXL,
      ":last-child": { paddingBottom: 0 },
      // Conector vertical entre pasos.
      "::after": {
        content: '""',
        position: "absolute",
        left: "15px",
        top: "36px",
        bottom: "4px",
        width: "2px",
        borderRadius: tokens.borderRadiusCircular,
        backgroundColor: tokens.colorNeutralStroke1,
        transitionProperty: "background-color",
        transitionDuration: tokens.durationSlow,
      },
      ":last-child::after": { display: "none" },
    },
  },
  itemDone: {
    "@media (min-width: 1024px)": {
      "::after": { backgroundColor: tokens.colorCompoundBrandBackground },
    },
  },
  button: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
    paddingBlock: tokens.spacingVerticalXS,
    paddingInlineStart: 0,
    paddingInlineEnd: tokens.spacingHorizontalS,
    font: "inherit",
    textAlign: "start",
    color: tokens.colorNeutralForeground1,
    backgroundColor: "transparent",
    border: "none",
    borderRadius: tokens.borderRadiusMedium,
    cursor: "pointer",
    whiteSpace: "nowrap",
    ":focus-visible": {
      outline: `${tokens.strokeWidthThick} solid ${tokens.colorStrokeFocus2}`,
    },
    "@media (hover: hover)": {
      ":hover .titulo": { textDecorationLine: "underline" },
    },
  },
  circle: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    boxSizing: "border-box",
    borderRadius: tokens.borderRadiusCircular,
    border: `${tokens.strokeWidthThick} solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground2,
    fontWeight: tokens.fontWeightSemibold,
    fontVariantNumeric: "tabular-nums",
    transitionProperty: "background-color, color",
    transitionDuration: tokens.durationNormal,
  },
  circleDone: {
    backgroundColor: tokens.colorCompoundBrandBackground,
    border: `${tokens.strokeWidthThick} solid ${tokens.colorCompoundBrandBackground}`,
    color: tokens.colorNeutralForegroundOnBrand,
  },
  check: {
    display: "flex",
    animationName: keyframes.scaleIn,
    animationDuration: tokens.durationNormal,
    animationTimingFunction: tokens.curveDecelerateMax,
  },
  text: {
    display: "flex",
    flexDirection: "column",
  },
  status: {
    color: tokens.colorNeutralForeground3,
    display: "none",
    "@media (min-width: 1024px)": {
      display: "block",
    },
  },
  statusDone: {
    color: tokens.colorBrandForeground1,
  },
  srOnly: {
    position: "absolute",
    width: "1px",
    height: "1px",
    overflow: "hidden",
    clipPath: "inset(50%)",
    whiteSpace: "nowrap",
  },
});

const irA = (id) => {
  const destino = document.getElementById(id);
  if (!destino) return;
  const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  destino.scrollIntoView({ behavior: reducido ? "auto" : "smooth", block: "start" });
  destino.focus({ preventScroll: true });
};

/*
 * Indicador de pasos: horizontal en móvil, vertical con conectores en
 * escritorio. Cada paso lleva a su sección del formulario.
 */
export function Stepper({ pasos, label, className }) {
  const styles = useStyles();

  return (
    <ol className={mergeClasses(styles.list, className)} aria-label={label}>
      {pasos.map((paso, index) => (
        <li key={paso.id} className={mergeClasses(styles.item, paso.completo && styles.itemDone)}>
          <button type="button" className={styles.button} onClick={() => irA(paso.id)}>
            <span className={mergeClasses(styles.circle, paso.completo && styles.circleDone)} aria-hidden="true">
              {paso.completo ? (
                <span className={styles.check}>
                  <Checkmark16Filled />
                </span>
              ) : (
                index + 1
              )}
            </span>
            <span className={styles.text}>
              <Text weight="semibold" className="titulo">
                {paso.titulo}
              </Text>
              <Caption1 className={mergeClasses(styles.status, paso.completo && styles.statusDone)}>
                {paso.completo ? "Listo" : paso.pendiente}
              </Caption1>
              <span className={styles.srOnly}>
                {paso.completo ? " (completo)" : " (pendiente)"}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ol>
  );
}

export default Stepper;
