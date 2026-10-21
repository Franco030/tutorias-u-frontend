import { useState } from "react";

/*
 * Guarda la selección que había al montar el componente. Sirve para animar
 * solo lo que el usuario agrega después, y no todo al entrar a la página.
 */
export function useSeleccionInicial(ids) {
  const [iniciales] = useState(() => new Set(ids));
  return (id) => !iniciales.has(id);
}

export default useSeleccionInicial;
