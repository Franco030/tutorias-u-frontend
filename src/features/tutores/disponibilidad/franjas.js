/*
 * Disponibilidad "a pinceladas": la semana es una rejilla de celdas de 30 min
 * (de 6:00 a 22:00) por día. Las celdas seguidas forman franjas y, al guardar,
 * cada franja se divide en sesiones de 1 hora: cada sesión es una cita que el
 * estudiante puede reservar (así lo espera el backend).
 */
export const HORA_INICIO = 6;
export const HORA_FIN = 22;
export const MINUTOS_CELDA = 30;
export const CELDAS = ((HORA_FIN - HORA_INICIO) * 60) / MINUTOS_CELDA;
// Celdas por sesión de 1 hora.
export const CELDAS_SESION = 60 / MINUTOS_CELDA;

// Columnas de lunes a domingo; los índices siguen al backend (0 = domingo).
export const ORDEN_DIAS = [1, 2, 3, 4, 5, 6, 0];
export const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
export const DIAS_CORTOS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
export const DIAS_HABILES = [1, 2, 3, 4, 5];

export const semanaVacia = () => Array.from({ length: 7 }, () => Array(CELDAS).fill(false));

const aMinutos = (hora) => {
  const [h, m] = String(hora).slice(0, 5).split(":").map(Number);
  return h * 60 + m;
};

// Celda -> "09:00" (para el backend).
export const celdaAHora = (celda) => {
  const minutos = HORA_INICIO * 60 + celda * MINUTOS_CELDA;
  return `${String(Math.floor(minutos / 60)).padStart(2, "0")}:${String(minutos % 60).padStart(2, "0")}`;
};

// Celda -> "9:00" (para leer).
export const celdaATexto = (celda) => celdaAHora(celda).replace(/^0/, "");

/*
 * Bloques guardados -> celdas. Un bloque que no cae exacto en la rejilla se
 * extiende a las celdas que toca (`ajustados`); lo que queda fuera de 6:00 a
 * 22:00 se recorta (`fuera`).
 */
export function celdasDesdeBloques(bloques) {
  const celdas = semanaVacia();
  let ajustados = false;
  let fuera = false;

  for (const bloque of bloques) {
    const inicio = aMinutos(bloque.horaInicio) - HORA_INICIO * 60;
    const fin = aMinutos(bloque.horaFin) - HORA_INICIO * 60;
    if (inicio % MINUTOS_CELDA || fin % MINUTOS_CELDA) ajustados = true;
    let desde = Math.floor(inicio / MINUTOS_CELDA);
    let hasta = Math.ceil(fin / MINUTOS_CELDA);
    if (desde < 0 || hasta > CELDAS) fuera = true;
    desde = Math.max(0, desde);
    hasta = Math.min(CELDAS, hasta);
    for (let c = desde; c < hasta; c += 1) celdas[bloque.diaSemana][c] = true;
  }

  return { celdas, ajustados, fuera };
}

// Franjas de un día: tramos seguidos de celdas pintadas, [inicio, fin).
export function franjasDelDia(celdasDia) {
  const franjas = [];
  let inicio = null;
  for (let c = 0; c <= celdasDia.length; c += 1) {
    if (celdasDia[c] && inicio === null) inicio = c;
    if (!celdasDia[c] && inicio !== null) {
      franjas.push({ inicio, fin: c });
      inicio = null;
    }
  }
  return franjas;
}

/*
 * Celdas -> bloques de 1 hora para guardar. Una franja de 4 h da 4 citas; si
 * mide 2 h 30, la última media hora no forma sesión y se informa en `sobrantes`.
 */
export function bloquesParaGuardar(celdas) {
  const bloques = [];
  const sobrantes = [];
  for (const dia of ORDEN_DIAS) {
    for (const { inicio, fin } of franjasDelDia(celdas[dia])) {
      let c = inicio;
      for (; c + CELDAS_SESION <= fin; c += CELDAS_SESION) {
        bloques.push({ diaSemana: dia, horaInicio: celdaAHora(c), horaFin: celdaAHora(c + CELDAS_SESION) });
      }
      if (c < fin) sobrantes.push({ diaSemana: dia, inicio: c, fin });
    }
  }
  return { bloques, sobrantes };
}

export const horasDelDia = (celdasDia) => (celdasDia.filter(Boolean).length * MINUTOS_CELDA) / 60;

export const horasTotales = (celdas) => celdas.reduce((total, dia) => total + horasDelDia(dia), 0);

// 4 -> "4", 4.5 -> "4.5"
export const formatoHoras = (horas) => (Number.isInteger(horas) ? String(horas) : horas.toFixed(1));

const unirLista = (partes) =>
  partes.length <= 1 ? partes.join("") : `${partes.slice(0, -1).join(", ")} y ${partes[partes.length - 1]}`;

/*
 * Resumen en palabras: agrupa los días con el mismo horario.
 * "Lun a jue, de 9:00 a 13:00 y de 14:00 a 18:00; vie, de 9:00 a 12:30."
 */
export function resumenEnPalabras(celdas) {
  const grupos = [];
  for (const dia of ORDEN_DIAS) {
    const franjas = franjasDelDia(celdas[dia]);
    if (franjas.length === 0) continue;
    const horario = unirLista(franjas.map(({ inicio, fin }) => `de ${celdaATexto(inicio)} a ${celdaATexto(fin)}`));
    const grupo = grupos.find((g) => g.horario === horario);
    if (grupo) grupo.dias.push(dia);
    else grupos.push({ horario, dias: [dia] });
  }

  if (grupos.length === 0) return "Aún no hay horarios. Arrastra sobre la rejilla para pintar tus franjas.";

  const texto = grupos
    .map(({ horario, dias }) => {
      const posiciones = dias.map((dia) => ORDEN_DIAS.indexOf(dia));
      const seguidos = posiciones.every((p, i) => i === 0 || p === posiciones[i - 1] + 1);
      const nombres = dias.map((dia) => DIAS_CORTOS[dia].toLowerCase());
      const cuando =
        seguidos && dias.length >= 3 ? `${nombres[0]} a ${nombres[nombres.length - 1]}` : unirLista(nombres);
      return `${cuando}, ${horario}`;
    })
    .join("; ");

  return `${texto.charAt(0).toUpperCase()}${texto.slice(1)}.`;
}
