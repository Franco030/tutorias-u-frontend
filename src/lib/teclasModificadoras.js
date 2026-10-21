/*
 * Fluent (vía keyborg/tabster) entra en "modo teclado" con cualquier tecla y
 * entonces dibuja el anillo de foco en el elemento enfocado. Así, al pulsar
 * solo la tecla de Windows, Alt o Ctrl (p. ej. para abrir Inicio o cambiar de
 * ventana) aparecía un borde en el botón de cerrar de un diálogo. Una tecla
 * modificadora sola no navega: se detiene antes de que llegue a keyborg. Las
 * combinaciones (Ctrl+C, Shift+Tab…) llegan intactas porque el evento de la
 * segunda tecla no es una modificadora, y no se cancela la acción del navegador.
 */
const MODIFICADORAS = new Set(["Meta", "OS", "Alt", "AltGraph", "Control", "Shift", "CapsLock"]);

export function ignorarModificadorasSolas(win = window) {
  const alPresionar = (event) => {
    if (MODIFICADORAS.has(event.key)) event.stopImmediatePropagation();
  };
  // Captura en window y registrado antes de montar React: corre primero.
  win.addEventListener("keydown", alPresionar, true);
  return () => win.removeEventListener("keydown", alPresionar, true);
}
