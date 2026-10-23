import { useEffect, useState } from "react";

/*
 * Instante actual que se renueva cada `intervaloMs`: para cuentas regresivas
 * y estados que cambian con la hora sin leer el reloj durante el render.
 */
export function useAhora(intervaloMs = 30000) {
  const [ahora, setAhora] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setAhora(new Date()), intervaloMs);
    // Al volver a la pestaña se actualiza enseguida (los timers se frenan en segundo plano).
    const alVolver = () => {
      if (document.visibilityState === "visible") setAhora(new Date());
    };
    document.addEventListener("visibilitychange", alVolver);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", alVolver);
    };
  }, [intervaloMs]);

  return ahora;
}

export default useAhora;
