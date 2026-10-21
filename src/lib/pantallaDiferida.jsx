import { lazy, useState } from "react";

/*
 * Como React.lazy, pero una vez que el módulo ya se descargó (por la
 * precarga o por una visita anterior) la pantalla se renderiza directamente.
 * React.lazy vuelve a esperar la promesa aunque el módulo esté listo, y esa
 * espera mínima activa el fallback de Suspense, que React mantiene al menos
 * 300 ms: eso se veía como un spinner al entrar a una pantalla.
 */
export function pantallaDiferida(cargar) {
  let Componente = null;
  let promesa = null;

  const precargar = () => {
    promesa ??= cargar().then((modulo) => {
      Componente = modulo.default;
      return modulo;
    });
    return promesa;
  };

  const Diferida = lazy(precargar);

  function Pantalla(props) {
    // La elección se fija al montar: cambiar de Diferida a Componente en un
    // re-render cambiaría el tipo de elemento y React remontaría la pantalla.
    const [Directo] = useState(() => Componente);
    return Directo ? <Directo {...props} /> : <Diferida {...props} />;
  }
  Pantalla.precargar = precargar;
  return Pantalla;
}

export default pantallaDiferida;
