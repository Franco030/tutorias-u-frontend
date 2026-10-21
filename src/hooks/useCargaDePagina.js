import { createContext, useContext, useId, useLayoutEffect } from "react";

/*
 * Coordinación de cargas de una página. `Page` monta su contenido oculto y
 * espera a que todas las secciones terminen de cargar (o a que pasen 300 ms)
 * antes de hacer su único fundido: así no se ven esqueletos, spinners ni
 * textos provisionales cuando los datos llegan rápido.
 */
export const CargaDePaginaContext = createContext(null);

// Una sección avisa que está cargando; al terminar (o desmontarse) se libera.
export function useCargaDePagina(cargando) {
  const contexto = useContext(CargaDePaginaContext);
  const id = useId();

  useLayoutEffect(() => {
    if (!contexto || !cargando) return undefined;
    contexto.agregar(id);
    return () => contexto.quitar(id);
  }, [contexto, cargando, id]);
}

export default useCargaDePagina;
