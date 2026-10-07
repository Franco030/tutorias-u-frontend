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