import pizarron from "./onboarding/intereses-1.jpg";

/*
 * Fotografías reales del proyecto (verticales, 1000×1500). Lo abstracto va
 * en components/illustrations (SVG propio). Cada foto lleva su
 * texto alternativo y el punto focal para `object-position`, de modo que el
 * recorte siga mostrando el sujeto en contenedores anchos o bajos.
 */
export const fotos = {
  pizarron: {
    src: pizarron,
    alt: "Mano escribiendo una ecuación en un pizarrón blanco",
    foco: "55% 60%",
    width: 1000,
    height: 1500,
  },
};

export default fotos;
