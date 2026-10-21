import { useCallback } from "react";
import { Toast, ToastBody, ToastTitle, useToastController } from "@fluentui/react-components";

export const TOASTER_ID = "tutoriasu-avisos";

/*
 * Aviso breve tras una acción cuyo resultado no se ve en la misma vista
 * (aceptar, rechazar, guardar). Los errores siguen en la página.
 */
export function useNotificar() {
  const { dispatchToast } = useToastController(TOASTER_ID);

  return useCallback(
    (titulo, { cuerpo, intent = "success" } = {}) => {
      dispatchToast(
        <Toast>
          <ToastTitle>{titulo}</ToastTitle>
          {cuerpo && <ToastBody>{cuerpo}</ToastBody>}
        </Toast>,
        { intent, timeout: 4000 }
      );
    },
    [dispatchToast]
  );
}

export default useNotificar;
