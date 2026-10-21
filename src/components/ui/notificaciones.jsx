import { Toaster } from "@fluentui/react-components";
import { TOASTER_ID } from "../../hooks/useNotificar";

// Contenedor único de avisos (abajo a la derecha). Se monta en el shell;
// los avisos se lanzan con useNotificar (src/hooks/useNotificar.jsx).
export function Avisos() {
  return <Toaster toasterId={TOASTER_ID} position="bottom-end" pauseOnHover pauseOnWindowBlur />;
}

export default Avisos;
