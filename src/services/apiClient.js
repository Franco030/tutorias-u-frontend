import { AUTH_STORAGE_KEYS } from '../types/auth.types';

export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

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

export async function apiClient(endpoint, options = {}) {
  const { skipAuth = false, token: explicitToken, headers = {}, body, ...customOptions } = options;

  const baseUrl = getApiBaseUrl();
  const url = endpoint.startsWith('http://') || endpoint.startsWith('https://')
    ? endpoint
    : `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const finalHeaders = new Headers(headers);

  if (!skipAuth) {
    const token = explicitToken || localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
    if (token) {
      finalHeaders.set('Authorization', `Bearer ${token}`);
    }
  }

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

    if (response.status === 204) {
      return null;
    }

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

    if (!response.ok) {
      let errorMessage = `Error en la petición: ${response.status} ${response.statusText}`;

      if (data && typeof data === 'object') {
        errorMessage = data.message || data.error || data.title || errorMessage;
      } else if (typeof data === 'string' && data.trim().length > 0) {
        errorMessage = data;
      }

      // Notificar 401 para resetear la sesión en el cliente
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
    throw new ApiError(
      err?.message || 'Error de conexión con el servidor. Revisa tu red o el estado del backend.',
      0,
      err
    );
  }
}

apiClient.get = (endpoint, options) => apiClient(endpoint, { ...options, method: 'GET' });
apiClient.post = (endpoint, body, options) => apiClient(endpoint, { ...options, method: 'POST', body });
apiClient.put = (endpoint, body, options) => apiClient(endpoint, { ...options, method: 'PUT', body });
apiClient.patch = (endpoint, body, options) => apiClient(endpoint, { ...options, method: 'PATCH', body });
apiClient.delete = (endpoint, options) => apiClient(endpoint, { ...options, method: 'DELETE' });

export default apiClient;
