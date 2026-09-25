import apiClient from "./apiClient";

export const agendarCita = ({ tutorId, materiaId, fechaHoraInicio }) => {
  return apiClient.post("/api/citas/agendar", {
    tutorId,
    materiaId,
    fechaHoraInicio,
  });
};