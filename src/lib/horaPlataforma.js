/*
 * Hora de la plataforma. Las citas y la disponibilidad de los tutores viven en
 * la hora local de la universidad, sin zona ("2026-10-22T16:00:00"). Para
 * saber si un bloque ya pasó se compara contra la hora actual en esa misma
 * zona, no contra la del navegador ni contra UTC.
 */
export const ZONA_PLATAFORMA = import.meta.env.VITE_ZONA_HORARIA || "America/Mexico_City";

const formato = new Intl.DateTimeFormat("en-CA", {
  timeZone: ZONA_PLATAFORMA,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

// Fecha y hora actuales en la zona de la plataforma: { fecha: "AAAA-MM-DD", hora: "HH:mm" }.
export function ahoraEnPlataforma(instante = new Date()) {
  const partes = Object.fromEntries(
    formato.formatToParts(instante).map(({ type, value }) => [type, value])
  );
  return {
    fecha: `${partes.year}-${partes.month}-${partes.day}`,
    hora: `${partes.hour}:${partes.minute}`,
  };
}

// Valor que espera el backend: hora local de la plataforma, sin "Z".
export const crearFechaHora = (fecha, hora) => `${fecha}T${hora}:00`;

// ¿El bloque (fecha "AAAA-MM-DD", hora "HH:mm") todavía no empieza?
export function esFuturo(fecha, hora, instante = new Date()) {
  const ahora = ahoraEnPlataforma(instante);
  return `${fecha}T${hora}` > `${ahora.fecha}T${ahora.hora}`;
}
