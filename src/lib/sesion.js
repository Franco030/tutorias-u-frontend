import { ahoraEnPlataforma } from "./horaPlataforma";

// Las sesiones duran una hora (como en el backend: ReglasCita.DuracionSesion).
export const DURACION_MINUTOS = 60;
// El botón para unirse aparece este tiempo antes de empezar.
export const MINUTOS_PARA_UNIRSE = 10;

// "AAAA-MM-DDTHH:mm" -> minutos desde una referencia fija (sin zona: ambos
// lados están en la hora de la plataforma).
const enMinutos = (fecha, hora) => {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  const [horas, minutos] = hora.split(":").map(Number);
  return Date.UTC(anio, mes - 1, dia, horas, minutos) / 60000;
};

// Minutos que faltan para que empiece la sesión (negativos si ya empezó).
export function minutosParaEmpezar(fechaHoraInicio, instante = new Date()) {
  const ahora = ahoraEnPlataforma(instante);
  const [fecha, hora] = fechaHoraInicio.split("T");
  return enMinutos(fecha, hora.slice(0, 5)) - enMinutos(ahora.fecha, ahora.hora);
}

/*
 * Fase de una sesión aceptada:
 *  - "pronto":    falta más de MINUTOS_PARA_UNIRSE para empezar;
 *  - "unirse":    ya se puede entrar a la videollamada;
 *  - "en-curso":  dentro de su hora;
 *  - "terminada": pasó su hora.
 * Una solicitud pendiente (u otro estado) no tiene fase: regresa null.
 */
export function faseDeSesion(sesion, instante = new Date()) {
  if (sesion?.estado !== "Aceptada") return null;
  const faltan = minutosParaEmpezar(sesion.fechaHoraInicio, instante);
  if (faltan > MINUTOS_PARA_UNIRSE) return { fase: "pronto", minutos: faltan };
  if (faltan > 0) return { fase: "unirse", minutos: faltan };
  if (faltan > -DURACION_MINUTOS) return { fase: "en-curso", minutos: DURACION_MINUTOS + faltan };
  return { fase: "terminada", minutos: 0 };
}

// 135 -> "2 h 15 min"; 45 -> "45 min"; 120 -> "2 h"; 1500 -> "1 día y 1 h".
export function duracionLegible(minutos) {
  if (minutos < 1) return "menos de 1 min";
  const dias = Math.floor(minutos / 1440);
  const horas = Math.floor((minutos % 1440) / 60);
  const resto = minutos % 60;
  if (dias > 0) {
    const textoDias = `${dias} ${dias === 1 ? "día" : "días"}`;
    return horas > 0 ? `${textoDias} y ${horas} h` : textoDias;
  }
  if (horas > 0) return resto > 0 ? `${horas} h ${resto} min` : `${horas} h`;
  return `${resto} min`;
}
