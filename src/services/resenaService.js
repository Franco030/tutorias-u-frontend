import apiClient from "./apiClient";

export const crearResena = ({ citaId, puntuacion, comentario }) => {
  return apiClient.post("/api/resenas", { citaId, puntuacion, comentario });
};

export const getResenasTutor = (tutorId, { pagina = 1, tamanoPagina = 10 } = {}) => {
  const params = new URLSearchParams({ pagina: String(pagina), tamanoPagina: String(tamanoPagina) });
  return apiClient.get(`/api/tutores/${tutorId}/resenas?${params.toString()}`);
};
