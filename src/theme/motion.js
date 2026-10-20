import { tokens } from "@fluentui/react-components";

/*
 * Movimiento compartido (Fluent 2): entradas cortas con desaceleración,
 * salidas más rápidas que las entradas. `prefers-reduced-motion` las anula
 * desde src/index.css.
 */
export const keyframes = {
  fadeUp: {
    from: { opacity: 0, transform: "translateY(8px)" },
    to: { opacity: 1, transform: "none" },
  },
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  scaleIn: {
    from: { opacity: 0, transform: "scale(0.6)" },
    to: { opacity: 1, transform: "scale(1)" },
  },
  spinIn: {
    from: { opacity: 0, transform: "rotate(-90deg) scale(0.6)" },
    to: { opacity: 1, transform: "none" },
  },
};

// Entrada de contenido: sube 8 px y aparece (página, tarjetas, filas).
export const enterUp = {
  animationName: keyframes.fadeUp,
  animationDuration: tokens.durationSlow,
  animationTimingFunction: tokens.curveDecelerateMid,
  animationFillMode: "both",
};

// Elevación de tarjeta clicable: sube 2 px y gana sombra; al presionar vuelve.
export const liftOnHover = {
  transitionProperty: "transform, box-shadow, background-color, border-color",
  transitionDuration: tokens.durationNormal,
  transitionTimingFunction: tokens.curveDecelerateMid,
  "@media (hover: hover)": {
    ":hover": {
      transform: "translateY(-2px)",
      boxShadow: tokens.shadow16,
    },
  },
  ":active": {
    transform: "translateY(0)",
    boxShadow: tokens.shadow4,
    transitionDuration: tokens.durationFaster,
  },
};

// Retraso escalonado para listas (máximo 8 elementos animados).
export const stagger = (index, step = 40) => ({
  animationDelay: `${Math.min(index, 8) * step}ms`,
});
