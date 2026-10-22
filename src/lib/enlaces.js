// ¿Es una dirección web completa (http o https)? Para enlaces de videollamada.
export const esEnlaceWeb = (texto) => {
  try {
    const url = new URL(texto);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
};
