// Normaliza para buscar sin distinguir acentos ni mayúsculas.
export const normalizarTexto = (texto = "") =>
  texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
