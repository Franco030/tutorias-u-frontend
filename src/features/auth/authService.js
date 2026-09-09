import apiClient from '../../services/apiClient';
import { AUTH_STORAGE_KEYS } from '../../types/auth.types';

/**
 * Servicio de autenticación para interactuar con los endpoints del backend en ASP.NET Core.
 */
export const authService = {
  /**
   * Envía el idToken de Google al backend para validación y generación del JWT de la app.
   *
   * @param {string} idToken - Token de Google (credential retornado por el popup/one-tap)
   * @returns {Promise<import('../../types/auth.types').AuthResponse>}
   */
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

  /**
   * Envía el idToken de Microsoft al backend para validación y generación del JWT de la app.
   *
   * @param {string} idToken - Token de Microsoft retornado por MSAL
   * @returns {Promise<import('../../types/auth.types').AuthResponse>}
   */
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

  /**
   * Almacena de forma persistente el token y los datos del usuario en localStorage.
   *
   * @param {import('../../types/auth.types').AuthResponse} authData
   */
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

  /**
   * Elimina la sesión persistida en el navegador.
   */
  clearSession() {
    localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
  },

  /**
   * Recupera la sesión persistida si existe.
   *
   * @returns {{ token: string | null, user: import('../../types/auth.types').User | null }}
   */
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
