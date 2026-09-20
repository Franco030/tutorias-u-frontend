import apiClient from "./apiClient";

export const aplicarComoTutor = (datos) => {
  return apiClient.post("/api/tutores/aplicar", datos);
};