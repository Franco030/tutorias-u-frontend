
import apiClient from "./apiClient";

export const agendarCita = ({
  tutorId,
  materiaId,
  fechaHoraInicio,
  fechaHoraFin,
}) => {
  return apiClient.post("/api/citas/agendar", {
    tutorId,
    materiaId,
    fechaHoraInicio,
    fechaHoraFin,
  });
};

export const getCitasPendientes = () => {
  return apiClient.get("/api/citas/pendientes");
};

export const aceptarCita = (id, data) => {
  return apiClient.put(`/api/citas/${id}/aceptar`, data);
};

export const rechazarCita = (id) => {
  return apiClient.put(`/api/citas/${id}/rechazar`);
};

// US-4: Consultar las próximas tutorías del usuario autenticado
export const getProximasTutorias = () => {
  return apiClient.get("/api/citas/proximas");
};

export const getHistorialTutorias = () => {
  return apiClient.get("/api/citas/historial");
};

export const getHorasOcupadas = (tutorId, fecha) => {
  const params = new URLSearchParams({ tutorId: String(tutorId), fecha });
  return apiClient.get(`/api/citas/ocupadas?${params.toString()}`);
};

export const cancelarCita = (id, motivo = "") => {
  return apiClient.put(`/api/citas/${id}/cancelar`, { motivo });
};
