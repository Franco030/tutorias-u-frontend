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

export const obtenerCitasPendientes = () => {
  return apiClient.get("/api/citas/pendientes");
};