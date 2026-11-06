import { ZONA_PLATAFORMA } from "./horaPlataforma";
import { DURACION_MINUTOS } from "./sesion";

/**
 * Normaliza las fechas de inicio y fin a strings compactos y estándar.
 * Si la tutoría no tiene fechaHoraFin, se calculan DURACION_MINUTOS (60 min) después.
 */
export function obtenerFechasEvento(tutoria) {
  if (!tutoria?.fechaHoraInicio) {
    throw new Error("La tutoría no cuenta con fecha de inicio.");
  }

  // fechaHoraInicio viene como "AAAA-MM-DDTHH:mm:ss" o "AAAA-MM-DDTHH:mm"
  const inicioRaw = tutoria.fechaHoraInicio.replace(/Z$/, "");
  const [fechaInicio, horaInicio = "00:00"] = inicioRaw.split("T");
  const [anio, mes, dia] = fechaInicio.split("-").map(Number);
  const [hIni, mIni] = horaInicio.slice(0, 5).split(":").map(Number);

  // Fecha base para cálculos (el mes en Date es 0-indexed)
  const dInicio = new Date(anio, mes - 1, dia, hIni, mIni);

  let dFin;
  if (tutoria.fechaHoraFin) {
    const finRaw = tutoria.fechaHoraFin.replace(/Z$/, "");
    const [fechaFin, horaFin = "00:00"] = finRaw.split("T");
    const [anioF, mesF, diaF] = fechaFin.split("-").map(Number);
    const [hFin, mFin] = horaFin.slice(0, 5).split(":").map(Number);
    dFin = new Date(anioF, mesF - 1, diaF, hFin, mFin);
  } else {
    dFin = new Date(dInicio.getTime() + DURACION_MINUTOS * 60000);
  }

  const pad = (n) => String(n).padStart(2, "0");

  const startIso = `${dInicio.getFullYear()}-${pad(dInicio.getMonth() + 1)}-${pad(dInicio.getDate())}T${pad(dInicio.getHours())}:${pad(dInicio.getMinutes())}:00`;
  const endIso = `${dFin.getFullYear()}-${pad(dFin.getMonth() + 1)}-${pad(dFin.getDate())}T${pad(dFin.getHours())}:${pad(dFin.getMinutes())}:00`;

  // Formato compacto para URLs y calendarios (YYYYMMDDTHHmmss)
  const startCompact = `${dInicio.getFullYear()}${pad(dInicio.getMonth() + 1)}${pad(dInicio.getDate())}T${pad(dInicio.getHours())}${pad(dInicio.getMinutes())}00`;
  const endCompact = `${dFin.getFullYear()}${pad(dFin.getMonth() + 1)}${pad(dFin.getDate())}T${pad(dFin.getHours())}${pad(dFin.getMinutes())}00`;

  return {
    dInicio,
    dFin,
    startIso,
    endIso,
    startCompact,
    endCompact,
  };
}

/**
 * Prepara el resumen (título), descripción y ubicación de la sesión.
 */
export function construirDatosEvento(tutoria) {
  const materia = tutoria.materia || "Tutoría";
  const contraparte = tutoria.rolOpuestoNombre ? ` con ${tutoria.rolOpuestoNombre}` : "";
  const titulo = `Tutoría: ${materia}${contraparte}`;

  const partesDescripcion = [];
  if (tutoria.tema) {
    partesDescripcion.push(`Tema a repasar: ${tutoria.tema}`);
  }
  if (tutoria.notas) {
    partesDescripcion.push(`Notas: ${tutoria.notas}`);
  }
  if (tutoria.linkReunion) {
    partesDescripcion.push(`Enlace de videollamada: ${tutoria.linkReunion}`);
  }
  partesDescripcion.push("Generado por TutoriasU");

  const descripcion = partesDescripcion.join("\n\n");
  const ubicacion = tutoria.linkReunion || "TutoriasU (En línea)";

  return {
    titulo,
    descripcion,
    ubicacion,
  };
}

/**
 * Genera el enlace directo para añadir el evento a Google Calendar.
 */
export function generarEnlaceGoogle(tutoria) {
  const { startCompact, endCompact } = obtenerFechasEvento(tutoria);
  const { titulo, descripcion, ubicacion } = construirDatosEvento(tutoria);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: titulo,
    dates: `${startCompact}/${endCompact}`,
    details: descripcion,
    location: ubicacion,
    ctz: ZONA_PLATAFORMA,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Desfase UTC de la zona de la plataforma en la fecha indicada, como "-06:00".
 * La hora de la tutoría es hora local de la plataforma, no la del navegador.
 */
export function desfaseDeZona(fecha, zona = ZONA_PLATAFORMA) {
  const nombre = new Intl.DateTimeFormat("en-US", {
    timeZone: zona,
    timeZoneName: "longOffset",
  })
    .formatToParts(fecha)
    .find((parte) => parte.type === "timeZoneName")?.value;
  // "GMT-06:00" -> "-06:00"; "GMT" (UTC) -> "+00:00"
  return nombre?.replace("GMT", "") || "+00:00";
}

/**
 * Genera el enlace profundo para añadir el evento a Outlook / Microsoft 365.
 */
export function generarEnlaceOutlook(tutoria) {
  const { dInicio, dFin, startIso: inicioLocal, endIso: finLocal } = obtenerFechasEvento(tutoria);
  // Sin desfase, Outlook interpreta la hora en la zona de quien abre el enlace.
  const startIso = `${inicioLocal}${desfaseDeZona(dInicio)}`;
  const endIso = `${finLocal}${desfaseDeZona(dFin)}`;
  const { titulo, descripcion, ubicacion } = construirDatosEvento(tutoria);

  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: titulo,
    startdt: startIso,
    enddt: endIso,
    body: descripcion,
    location: ubicacion,
  });

  return `https://outlook.office.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Escapa caracteres especiales según la especificación RFC 5545 para iCalendar.
 */
function escaparTextoIcs(texto = "") {
  return texto
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * Construye el contenido en texto del archivo .ics (iCalendar) para la tutoría.
 */
export function generarContenidoIcs(tutoria) {
  const { dInicio, startCompact, endCompact } = obtenerFechasEvento(tutoria);
  const { titulo, descripcion, ubicacion } = construirDatosEvento(tutoria);
  // RFC 5545: todo TZID usado debe definirse en un VTIMEZONE del archivo.
  const desfaseIcs = desfaseDeZona(dInicio).replace(":", "");

  const ahora = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const dtStamp = `${ahora.getUTCFullYear()}${pad(ahora.getUTCMonth() + 1)}${pad(ahora.getUTCDate())}T${pad(ahora.getUTCHours())}${pad(ahora.getUTCMinutes())}${pad(ahora.getUTCSeconds())}Z`;
  const uid = `tutoria-${tutoria.id || Date.now()}@tutorias-u`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TutoriasU//TutoriasU Web//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VTIMEZONE",
    `TZID:${ZONA_PLATAFORMA}`,
    "BEGIN:STANDARD",
    "DTSTART:19700101T000000",
    `TZOFFSETFROM:${desfaseIcs}`,
    `TZOFFSETTO:${desfaseIcs}`,
    "END:STANDARD",
    "END:VTIMEZONE",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART;TZID=${ZONA_PLATAFORMA}:${startCompact}`,
    `DTEND;TZID=${ZONA_PLATAFORMA}:${endCompact}`,
    `SUMMARY:${escaparTextoIcs(titulo)}`,
    `DESCRIPTION:${escaparTextoIcs(descripcion)}`,
    `LOCATION:${escaparTextoIcs(ubicacion)}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/**
 * Descarga el archivo .ics en el navegador del usuario.
 */
export function descargarArchivoIcs(tutoria) {
  if (typeof document === "undefined") {
    return;
  }

  const contenido = generarContenidoIcs(tutoria);
  const blob = new Blob([contenido], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const nombreMateria = (tutoria.materia || "tutoria")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  link.href = url;
  link.setAttribute("download", `tutoria-${nombreMateria}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
