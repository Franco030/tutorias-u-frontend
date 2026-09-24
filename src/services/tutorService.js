import apiClient from "./apiClient";

export const aplicarComoTutor = (datos) => {
  return apiClient.post("/api/tutores/aplicar", datos);
};

export const getTutorById = (id) => {
  return apiClient.get(`/api/tutores/${id}`);
};

export const getTutores = () => {
  return apiClient.get("/api/tutores");
};

export const getTutoresRecomendados = async () => {
  return apiClient.get("/api/tutores/recomendados");
};

export const updateMisMaterias = (materiaIds) => {
  return apiClient.put("/api/tutores/mis-materias", { materiaIds });
};