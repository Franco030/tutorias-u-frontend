import { createPresenceComponent, motionTokens } from "@fluentui/react-components";

/*
 * Movimiento del menú lateral (patrón Enter/Exit de Fluent 2).
 * - Entrada: 300 ms con desaceleración suave (curveDecelerateMin): arranca
 *   sin salto y se asienta con suavidad.
 * - Salida: 200 ms con la misma curva: empieza a moverse en cuanto se hace
 *   clic (sin el retraso de un ease-in) y es más corta que la entrada.
 * La opacidad solo cambia al principio de la entrada / final de la salida,
 * para que el panel no se vea transparente mientras se desliza.
 */
export const PanelLateralMotion = createPresenceComponent(() => ({
  enter: {
    keyframes: [
      { transform: "translate3d(-100%, 0, 0)", opacity: 0 },
      { opacity: 1, offset: 0.4 },
      { transform: "translate3d(0, 0, 0)", opacity: 1 },
    ],
    duration: motionTokens.durationSlow,
    easing: motionTokens.curveDecelerateMin,
  },
  exit: {
    keyframes: [
      { transform: "translate3d(0, 0, 0)", opacity: 1 },
      { opacity: 1, offset: 0.6 },
      { transform: "translate3d(-100%, 0, 0)", opacity: 0 },
    ],
    duration: motionTokens.durationNormal,
    easing: motionTokens.curveDecelerateMin,
  },
}));

export default PanelLateralMotion;
