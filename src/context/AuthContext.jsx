import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import authService from '../features/auth/authService';

export const AuthContext = createContext(null);

/**
 * Proveedor global de autenticación para TutoriasU.
 * Gestiona el ciclo de vida de la sesión, sincronización con localStorage y estado de usuario.
 */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => authService.getStoredSession().token);
  const [user, setUser] = useState(() => authService.getStoredSession().user);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const isAuthenticated = Boolean(token && user);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Cierra la sesión activa en el frontend y limpia el almacenamiento local.
   */
  const logout = useCallback(() => {
    authService.clearSession();
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  // Escuchar evento de token expirado o 401 Unauthorized desde apiClient
  useEffect(() => {
    const handleUnauthorized = () => {
      console.warn('[AuthContext] Sesión expirada o no autorizada (401). Cerrando sesión...');
      logout();
      setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [logout]);

  /**
   * Autenticación con Google enviando la credencial (idToken) al backend.
   * @param {string} idToken - Credential de Google devuelta por el login popup
   */
  const loginWithGoogle = useCallback(async (idToken) => {
    setIsLoading(true);
    setError(null);

    try {
      const authData = await authService.loginWithGoogle(idToken);
      const savedUser = authService.saveSession(authData);

      setToken(authData.token);
      setUser(savedUser);
      return authData;
    } catch (err) {
      const errorMsg = err?.message || 'Error al autenticar con Google en el servidor';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Autenticación con Microsoft enviando el idToken al backend.
   * @param {string} idToken - Token emitido por Microsoft Entra ID
   */
  const loginWithMicrosoft = useCallback(async (idToken) => {
    setIsLoading(true);
    setError(null);

    try {
      const authData = await authService.loginWithMicrosoft(idToken);
      const savedUser = authService.saveSession(authData);

      setToken(authData.token);
      setUser(savedUser);
      return authData;
    } catch (err) {
      const errorMsg = err?.message || 'Error al autenticar con Microsoft en el servidor';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated,
      isLoading,
      error,
      loginWithGoogle,
      loginWithMicrosoft,
      logout,
      clearError,
    }),
    [user, token, isAuthenticated, isLoading, error, loginWithGoogle, loginWithMicrosoft, logout, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook personalizado para consumir el estado de autenticación de la aplicación.
 * @returns {{
 *   user: import('../types/auth.types').User | null,
 *   token: string | null,
 *   isAuthenticated: boolean,
 *   isLoading: boolean,
 *   error: string | null,
 *   loginWithGoogle: (idToken: string) => Promise<any>,
 *   loginWithMicrosoft: (idToken: string) => Promise<any>,
 *   logout: () => void,
 *   clearError: () => void
 * }}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}

export default AuthContext;
