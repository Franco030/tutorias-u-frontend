import { describe, expect, it } from "vitest";
import {
  bloquesParaGuardar,
  CELDAS,
  celdasDesdeBloques,
  franjasDelDia,
  horasTotales,
  resumenEnPalabras,
  semanaVacia,
} from "./franjas";

// Pinta [desde, hasta) en horas ("9:00" = 9) para un día.
const pintar = (celdas, dia, desde, hasta) => {
  for (let c = (desde - 6) * 2; c < (hasta - 6) * 2; c += 1) celdas[dia][c] = true;
  return celdas;
};

describe("franjas", () => {
  it("convierte bloques guardados en celdas y de vuelta en sesiones de 1 h", () => {
    const { celdas, ajustados, fuera } = celdasDesdeBloques([
      { diaSemana: 1, horaInicio: "09:00", horaFin: "10:00" },
      { diaSemana: 1, horaInicio: "10:00:00", horaFin: "11:00:00" },
    ]);

    expect(ajustados).toBe(false);
    expect(fuera).toBe(false);
    expect(franjasDelDia(celdas[1])).toEqual([{ inicio: 6, fin: 10 }]);
    expect(bloquesParaGuardar(celdas).bloques).toEqual([
      { diaSemana: 1, horaInicio: "09:00", horaFin: "10:00" },
      { diaSemana: 1, horaInicio: "10:00", horaFin: "11:00" },
    ]);
  });

  it("divide una franja en sesiones de 1 h y reporta la media hora sobrante", () => {
    const celdas = pintar(semanaVacia(), 5, 9, 12.5);

    const { bloques, sobrantes } = bloquesParaGuardar(celdas);

    expect(bloques.map((b) => `${b.horaInicio}-${b.horaFin}`)).toEqual(["09:00-10:00", "10:00-11:00", "11:00-12:00"]);
    expect(sobrantes).toEqual([{ diaSemana: 5, inicio: 12, fin: 13 }]);
  });

  it("ajusta a la rejilla los bloques que no caen exactos y recorta lo que queda fuera", () => {
    const { celdas, ajustados, fuera } = celdasDesdeBloques([
      { diaSemana: 2, horaInicio: "09:15", horaFin: "10:15" },
      { diaSemana: 3, horaInicio: "21:00", horaFin: "23:00" },
    ]);

    expect(ajustados).toBe(true);
    expect(fuera).toBe(true);
    expect(franjasDelDia(celdas[2])).toEqual([{ inicio: 6, fin: 9 }]);
    expect(franjasDelDia(celdas[3])).toEqual([{ inicio: 30, fin: CELDAS }]);
  });

  it("suma las horas pintadas de la semana", () => {
    const celdas = pintar(pintar(semanaVacia(), 1, 9, 13), 2, 14, 15.5);
    expect(horasTotales(celdas)).toBe(5.5);
  });

  it("resume en palabras agrupando días con el mismo horario", () => {
    const celdas = semanaVacia();
    for (const dia of [1, 2, 3, 4]) {
      pintar(celdas, dia, 9, 13);
      pintar(celdas, dia, 14, 18);
    }
    pintar(celdas, 5, 9, 12.5);

    expect(resumenEnPalabras(celdas)).toBe(
      "Lun a jue, de 9:00 a 13:00 y de 14:00 a 18:00; vie, de 9:00 a 12:30."
    );
  });

  it("lista los días no seguidos y avisa cuando no hay horarios", () => {
    const celdas = semanaVacia();
    for (const dia of [1, 3, 5]) pintar(celdas, dia, 16, 18);

    expect(resumenEnPalabras(celdas)).toBe("Lun, mié y vie, de 16:00 a 18:00.");
    expect(resumenEnPalabras(semanaVacia())).toMatch(/^Aún no hay horarios/);
  });
});
