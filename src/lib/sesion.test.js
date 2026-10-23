import { describe, expect, it } from "vitest";
import { duracionLegible, faseDeSesion, minutosParaEmpezar } from "./sesion";

// 22 de octubre de 2026, 15:00 en Ciudad de México (UTC-6) = 21:00 UTC.
const alas = (hora) => new Date(`2026-10-22T${hora}:00-06:00`);
const sesion = { estado: "Aceptada", fechaHoraInicio: "2026-10-22T16:00:00" };

describe("minutosParaEmpezar", () => {
  it("cuenta en la hora de la plataforma, no en la del navegador", () => {
    expect(minutosParaEmpezar(sesion.fechaHoraInicio, alas("13:45"))).toBe(135);
    expect(minutosParaEmpezar(sesion.fechaHoraInicio, alas("16:20"))).toBe(-20);
  });

  it("cruza la medianoche", () => {
    expect(minutosParaEmpezar("2026-10-23T00:30:00", alas("23:50"))).toBe(40);
  });
});

describe("faseDeSesion", () => {
  it.each([
    ["13:45", "pronto", 135],
    ["15:49", "pronto", 11],
    // Diez minutos antes ya aparece el botón para unirse.
    ["15:50", "unirse", 10],
    ["15:59", "unirse", 1],
    ["16:00", "en-curso", 60],
    ["16:25", "en-curso", 35],
    ["16:59", "en-curso", 1],
    ["17:00", "terminada", 0],
  ])("a las %s la sesión de las 16:00 está en «%s»", (hora, fase, minutos) => {
    expect(faseDeSesion(sesion, alas(hora))).toEqual({ fase, minutos });
  });

  it("una solicitud pendiente no tiene fase", () => {
    expect(faseDeSesion({ ...sesion, estado: "Pendiente" }, alas("15:55"))).toBeNull();
  });
});

describe("duracionLegible", () => {
  it.each([
    [0, "menos de 1 min"],
    [1, "1 min"],
    [45, "45 min"],
    [60, "1 h"],
    [135, "2 h 15 min"],
    [1440, "1 día"],
    [1500, "1 día y 1 h"],
    [3000, "2 días y 2 h"],
  ])("%i minutos -> %s", (minutos, texto) => {
    expect(duracionLegible(minutos)).toBe(texto);
  });
});
