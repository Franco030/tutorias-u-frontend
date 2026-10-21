// Formatos de fecha compartidos (es-MX).
export const formatoSesion = new Intl.DateTimeFormat("es-MX", {
  weekday: "long",
  hour: "2-digit",
  minute: "2-digit",
});

export const formatoFecha = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export const opiniones = (total) => `${total} ${total === 1 ? "opinión" : "opiniones"}`;
