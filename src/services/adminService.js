import apiClient from './apiClient';

export async function getSolicitudesPendientes() {
  return apiClient.get('/api/admin/solicitudes');
}

export async function aprobarTutor(id) {
  return apiClient.put(`/api/admin/tutores/${id}/aprobar`);
}

export async function rechazarTutor(id) {
  return apiClient.put(`/api/admin/tutores/${id}/rechazar`);
}

export default {
  getSolicitudesPendientes,
  aprobarTutor,
  rechazarTutor,
};
