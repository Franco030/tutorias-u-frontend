import apiClient from '../../services/apiClient';
import { AUTH_STORAGE_KEYS } from '../../types/auth.types';

export const authService = {
  async loginWithGoogle(idToken) {
    if (!idToken) {
      throw new Error('El token de Google es requerido');
    }
    return apiClient.post(
      '/api/auth/google',
      { idToken },
      { skipAuth: true }
    );
  },

  async loginWithMicrosoft(idToken) {
    if (!idToken) {
      throw new Error('El token de Microsoft es requerido');
    }
    return apiClient.post(
      '/api/auth/microsoft',
      { idToken },
      { skipAuth: true }
    );
  },

  async loginLocal(email, password) {
    return apiClient.post(
      '/api/auth/login',
      { email, password },
      { skipAuth: true }
    );
  },

  async registerLocal(email, nombre, password) {
    return apiClient.post(
      '/api/auth/register',
      { email, nombre, password },
      { skipAuth: true }
    );
  },

  async verifyEmail(token) {
    return apiClient.get(`/api/auth/verify-email?token=${encodeURIComponent(token)}`, {
      skipAuth: true
    });
  },

  saveSession(authData) {
    if (!authData || !authData.token) return;

    localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, authData.token);

    const user = {
      id: authData.id,
      email: authData.email,
      nombre: authData.nombre,
      rol: authData.rol,
      fotoUrl: authData.fotoUrl ?? null,
    };
    localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
    return user;
  },

  clearSession() {
    localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
  },

  getStoredSession() {
    const token = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
    const userJson = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
    let user = null;

    if (userJson) {
      try {
        user = JSON.parse(userJson);
      } catch (err) {
        console.error('Error parseando usuario guardado en localStorage', err);
        localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
      }
    }

    return { token, user };
  },
};

export default authService;
