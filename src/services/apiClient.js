import { AUTH_STORAGE_KEYS } from '../types/auth.types';

/**
 * Error personalizado para respuestas no exitosas del API.
 */
export class ApiError extends Error {
  /**
   * @param {string} message - Mensaje descriptivo del error
   * @param {number} status - Código de estado HTTP
   * @param {any} [data] - Datos adicionales devueltos por el servidor
   */
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Obtiene la URL base configurada para la API backend.
 * Remueve la barra final en caso de existir.
 */
export const getApiBaseUrl = () => {
  const url = import.meta.env.VITE_API_URL;
  if (!url) {
    console.warn(
      '[apiClient] VITE_API_URL no está definida en las variables de entorno. Usando fallback vacío.'
    );
    return '';
  }
  return url.replace(/\/+$/, '');
};

/**
 * Wrapper centralizado sobre el API `fetch` nativo.
 *
 * Características:
 * - Resuelve dinámicamente la URL base de Vite según el entorno (dev/prod).
 * - Inyecta automáticamente el encabezado `Authorization: Bearer <token>` si hay sesión activa.
 * - Serializa automáticamente el cuerpo a JSON si se pasa un objeto.
 * - Maneja respuestas sin contenido (204) o no-JSON sin fallar.
 * - Lanza instancias de `ApiError` con información legible de status y payload de error.
 *
 * @param {string} endpoint - Ruta relativa (ej: '/api/auth/google') o absoluta
 * @param {RequestInit & { skipAuth?: boolean, token?: string }} [options={}] - Opciones de fetch adicionales
 * @returns {Promise<any>} Datos parseados de la respuesta
 */
export async function apiClient(endpoint, options = {}) {
  const { skipAuth = false, token: explicitToken, headers = {}, body, ...customOptions } = options;

  const baseUrl = getApiBaseUrl();
  const url = endpoint.startsWith('http://') || endpoint.startsWith('https://')
    ? endpoint
    : `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const finalHeaders = new Headers(headers);

  // Inyectar Bearer token si corresponde
  if (!skipAuth) {
    const token = explicitToken || localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
    if (token) {
      finalHeaders.set('Authorization', `Bearer ${token}`);
    }
  }

  // Configurar Content-Type si hay body y no es FormData
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  let finalBody = body;

  if (body && !isFormData && typeof body === 'object') {
    if (!finalHeaders.has('Content-Type')) {
      finalHeaders.set('Content-Type', 'application/json');
    }
    finalBody = JSON.stringify(body);
  }

  if (!finalHeaders.has('Accept')) {
    finalHeaders.set('Accept', 'application/json');
  }

  try {
    const response = await fetch(url, {
      ...customOptions,
      headers: finalHeaders,
      body: finalBody,
    });

    // Manejo de respuesta 204 No Content
    if (response.status === 204) {
      return null;
    }

    // Intentar extraer el cuerpo como JSON o texto según el encabezado
    let data;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch {
        data = null;
      }
    } else {
      data = await response.text();
    }

    // Si la respuesta no es exitosa (código >= 400), lanzar ApiError
    if (!response.ok) {
      let errorMessage = `Error en la petición: ${response.status} ${response.statusText}`;

      if (data && typeof data === 'object') {
        errorMessage = data.message || data.error || data.title || errorMessage;
      } else if (typeof data === 'string' && data.trim().length > 0) {
        errorMessage = data;
      }

      // Si recibimos 401 Unauthorized, emitir evento para que la app pueda reaccionar
      if (response.status === 401) {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }

      throw new ApiError(errorMessage, response.status, data);
    }

    return data;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    // Errores de red o de parseo
    throw new ApiError(
      err?.message || 'Error de conexión con el servidor. Revisa tu red o el estado del backend.',
      0,
      err
    );
  }
}

// Métodos auxiliares de conveniencia
apiClient.get = (endpoint, options) => apiClient(endpoint, { ...options, method: 'GET' });
apiClient.post = (endpoint, body, options) => apiClient(endpoint, { ...options, method: 'POST', body });
apiClient.put = (endpoint, body, options) => apiClient(endpoint, { ...options, method: 'PUT', body });
apiClient.patch = (endpoint, body, options) => apiClient(endpoint, { ...options, method: 'PATCH', body });
apiClient.delete = (endpoint, options) => apiClient(endpoint, { ...options, method: 'DELETE' });

export default apiClient;
