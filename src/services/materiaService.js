import apiClient from "./apiClient";

export const getMaterias = () => {
  return apiClient.get("/api/materias");
};

export const guardarIntereses = (materiaIds) => {
  return apiClient.post("/api/estudiantes/intereses", {
    materiaIds,
  });
};

export const getMisIntereses = () => {
  return apiClient.get("/api/estudiantes/intereses");
};