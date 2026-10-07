import { beforeEach, describe, expect, it, vi } from "vitest";
import apiClient from "./apiClient";
import {
  agendarCita,
  getCitasPendientes,
  aceptarCita,
  rechazarCita,
} from "./citaService";

vi.mock("./apiClient", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

describe("citaService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe obtener las citas pendientes del tutor", async () => {
    const citasMock = [
      {
        id: 1,
        estudianteNombre: "Ana",
        materiaNombre: "Cálculo",
        estado: "Pendiente",
      },
    ];

    apiClient.get.mockResolvedValue(citasMock);

    const resultado = await getCitasPendientes();

    expect(apiClient.get).toHaveBeenCalledTimes(1);
    expect(apiClient.get).toHaveBeenCalledWith(
      "/api/citas/pendientes"
    );

    expect(resultado).toEqual(citasMock);
  });

  it("debe aceptar una cita enviando link y notas", async () => {
    const datos = {
      linkReunion: "https://meet.google.com/abc-defg-hij",
      notas: "Repasar derivadas.",
    };

    apiClient.put.mockResolvedValue({
      mensaje: "Cita aceptada",
    });

    const resultado = await aceptarCita(12, datos);

    expect(apiClient.put).toHaveBeenCalledTimes(1);
    expect(apiClient.put).toHaveBeenCalledWith(
      "/api/citas/12/aceptar",
      datos
    );

    expect(resultado).toEqual({
      mensaje: "Cita aceptada",
    });
  });

  it("debe permitir aceptar una cita con datos opcionales vacíos", async () => {
    const datos = {
      linkReunion: null,
      notas: null,
    };

    apiClient.put.mockResolvedValue({
      mensaje: "Cita aceptada",
    });

    await aceptarCita(5, datos);

    expect(apiClient.put).toHaveBeenCalledWith(
      "/api/citas/5/aceptar",
      datos
    );
  });

  it("debe rechazar una cita por id", async () => {
    apiClient.put.mockResolvedValue({
      mensaje: "Cita rechazada",
    });

    const resultado = await rechazarCita(8);

    expect(apiClient.put).toHaveBeenCalledTimes(1);

    expect(apiClient.put).toHaveBeenCalledWith(
      "/api/citas/8/rechazar"
    );

    expect(resultado).toEqual({
      mensaje: "Cita rechazada",
    });
  });

  it("debe propagar errores al obtener citas pendientes", async () => {
    const error = new Error("Error al cargar citas");

    apiClient.get.mockRejectedValue(error);

    await expect(
      getCitasPendientes()
    ).rejects.toThrow("Error al cargar citas");
  });

  it("debe propagar errores al aceptar una cita", async () => {
    const error = new Error("No se pudo aceptar");

    apiClient.put.mockRejectedValue(error);

    await expect(
      aceptarCita(1, {
        linkReunion: null,
        notas: null,
      })
    ).rejects.toThrow("No se pudo aceptar");
  });

  it("debe propagar errores al rechazar una cita", async () => {
    const error = new Error("No se pudo rechazar");

    apiClient.put.mockRejectedValue(error);

    await expect(
      rechazarCita(1)
    ).rejects.toThrow("No se pudo rechazar");
  });

  it("debe mantener funcionando el agendado de citas existente", async () => {
    const datos = {
      tutorId: 3,
      materiaId: 4,
      fechaHoraInicio: "2026-10-10T16:00:00",
      fechaHoraFin: "2026-10-10T17:00:00",
    };

    apiClient.post.mockResolvedValue({
      mensaje: "Cita agendada exitosamente",
      citaId: 20,
    });

    await agendarCita(datos);

    expect(apiClient.post).toHaveBeenCalledWith(
      "/api/citas/agendar",
      datos
    );
  });
});