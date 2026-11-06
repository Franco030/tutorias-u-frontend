import { useEffect } from "react";

export const TITULO_APP = "TutoriasU";

// Título de la pestaña con el formato "Pantalla · TutoriasU". Sin título (inicio,
// acceso) queda "TutoriasU", y al salir de la pantalla se restaura ese valor.
export const tituloDePestana = (titulo) => (titulo ? `${titulo} · ${TITULO_APP}` : TITULO_APP);

export function useTituloPagina(titulo) {
  useEffect(() => {
    document.title = tituloDePestana(titulo);
    return () => {
      document.title = TITULO_APP;
    };
  }, [titulo]);
}

export default useTituloPagina;
