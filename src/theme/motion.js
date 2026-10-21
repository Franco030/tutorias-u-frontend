import { tokens } from "@fluentui/react-components";

/*
 * Movimiento compartido (Fluent 2): entradas cortas con desaceleración,
 * salidas más rápidas que las entradas. `prefers-reduced-motion` las anula
 * desde src/index.css.
 */
export const keyframes = {
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

// Cambio de página (navegación de nivel superior en Fluent 2): un fundido
// rápido de todo el contenido, sin desplazar ni escalonar elementos.
export const pageFade = {
  animationName: keyframes.fadeIn,
  animationDuration: tokens.durationNormal,
  animationTimingFunction: tokens.curveDecelerateMid,
  animationFillMode: "both",
};

// Indicador de carga diferido: solo aparece si la espera supera 300 ms, así
// una carga rápida no muestra un destello de spinner antes del contenido.
export const delayedFade = {
  ...pageFade,
  animationDelay: "300ms",
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
