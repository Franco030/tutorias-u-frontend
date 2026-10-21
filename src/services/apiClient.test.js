import { afterEach, describe, expect, it, vi } from "vitest";
import apiClient, { ApiError } from "./apiClient";

const responderProblema = (status, cuerpo) =>
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify(cuerpo), {
      status,
      headers: { "Content-Type": "application/problem+json; charset=utf-8" },
    })
  );

describe("apiClient con ProblemDetails", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("usa el title del ProblemDetails como mensaje", async () => {
    responderProblema(409, { title: "El tutor ya tiene un compromiso en este horario", status: 409 });

    const error = await apiClient.post("/api/citas/agendar", {}, { skipAuth: true }).catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(409);
    expect(error.message).toBe("El tutor ya tiene un compromiso en este horario");
    expect(error.data.title).toBe("El tutor ya tiene un compromiso en este horario");
  });

  it("muestra el primer error de campo en problemas de validación", async () => {
    responderProblema(400, {
      title: "Revisa los datos enviados.",
      status: 400,
      errors: { Puntuacion: ["La puntuación debe estar entre 1 y 5."] },
    });

    const error = await apiClient.post("/api/resenas", {}, { skipAuth: true }).catch((e) => e);

    expect(error.message).toBe("La puntuación debe estar entre 1 y 5.");
  });
});
