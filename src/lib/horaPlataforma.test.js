import { describe, expect, it } from "vitest";
import { ahoraEnPlataforma, crearFechaHora, esFuturo } from "./horaPlataforma";

// 22:00 UTC son las 16:00 en Ciudad de México (UTC-6).
const instante = new Date("2026-10-22T22:00:00Z");

describe("horaPlataforma", () => {
  it("da la fecha y hora actuales en la zona de la plataforma", () => {
    expect(ahoraEnPlataforma(instante)).toEqual({ fecha: "2026-10-22", hora: "16:00" });
  });

  it("cambia de día según la zona y no según UTC", () => {
    // 03:00 UTC del 23 todavía es el 22 a las 21:00 en México.
    expect(ahoraEnPlataforma(new Date("2026-10-23T03:00:00Z"))).toEqual({
      fecha: "2026-10-22",
      hora: "21:00",
    });
  });

  it("compara los bloques contra la hora local de la plataforma", () => {
    expect(esFuturo("2026-10-22", "17:00", instante)).toBe(true);
    expect(esFuturo("2026-10-22", "16:00", instante)).toBe(false);
    expect(esFuturo("2026-10-22", "10:00", instante)).toBe(false);
    expect(esFuturo("2026-10-23", "08:00", instante)).toBe(true);
  });

  it("arma la fecha sin zona para el backend", () => {
    expect(crearFechaHora("2026-10-22", "16:00")).toBe("2026-10-22T16:00:00");
  });
});
