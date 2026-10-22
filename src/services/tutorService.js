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

export const getDisponibilidadTutor = (tutorId) => {
  return apiClient.get(`/api/tutores/${tutorId}/disponibilidad`);
};

export const guardarDisponibilidadTutor = (bloques) => {
  return apiClient.post("/api/tutores/disponibilidad", bloques);
};

// Preferencias de reserva del tutor autenticado: antelación mínima y enlace fijo.
export const getPreferenciasTutor = () => {
  return apiClient.get("/api/tutores/preferencias");
};

export const guardarPreferenciasTutor = (preferencias) => {
  return apiClient.put("/api/tutores/preferencias", preferencias);
};

// Días sin tutorías del tutor autenticado ({ bloqueos, citasAfectadas }).
export const getMisBloqueos = () => {
  return apiClient.get("/api/tutores/bloqueos");
};

export const guardarMisBloqueos = (bloqueos) => {
  return apiClient.put("/api/tutores/bloqueos", bloqueos);
};

// Fechas bloqueadas de un tutor para el calendario de reservas.
export const getBloqueosTutor = (tutorId) => {
  return apiClient.get(`/api/tutores/${tutorId}/bloqueos`);
};
