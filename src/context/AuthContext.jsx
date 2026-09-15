import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useMsal } from '@azure/msal-react';
import authService from '../features/auth/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { instance, inProgress } = useMsal();
  const [token, setToken] = useState(() => authService.getStoredSession().token);
  const [user, setUser] = useState(() => authService.getStoredSession().user);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Procesar redirección de Microsoft de manera transparente
  useEffect(() => {
    const handleMsalResponse = async () => {
      try {
        const response = await instance.handleRedirectPromise();
        if (response && response.idToken) {
          setIsLoading(true);
          try {
            const authData = await authService.loginWithMicrosoft(response.idToken);
            const savedUser = authService.saveSession(authData);
            setToken(authData.token);
            setUser(savedUser);
            // Limpiar la URL para quitar el hash
            window.history.replaceState({}, document.title, window.location.pathname);
          } catch (backendErr) {
            setError(backendErr?.message || 'Error al validar con el servidor.');
          } finally {
            setIsLoading(false);
          }
        }
      } catch (msalErr) {
        console.error('[MSAL] Error en redirección:', msalErr);
      }
    };
    
    // Si Msal está en estado de redirección, lo procesamos
    if (inProgress === "none") {
      handleMsalResponse();
    }
  }, [instance, inProgress]);

  const isAuthenticated = Boolean(token && user);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const logout = useCallback(() => {
    authService.clearSession();
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  // Si apiClient emite 401, cerramos sesión local
  useEffect(() => {
    const handleUnauthorized = () => {
      console.warn('[AuthContext] Sesión expirada o no autorizada (401). Cerrando sesión...');
      logout();
      setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [logout]);

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

  const loginLocal = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const authData = await authService.loginLocal(email, password);
      const savedUser = authService.saveSession(authData);

      setToken(authData.token);
      setUser(savedUser);
      return authData;
    } catch (err) {
      const errorMsg = err?.message || 'Error al iniciar sesión local';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateRole = useCallback(async (nuevoRol) => {
    setIsLoading(true);
    setError(null);

    try {
      const authData = await authService.asignarRol(nuevoRol);
      const savedUser = authService.saveSession(authData);

      setToken(authData.token);
      setUser(savedUser);
      return authData;
    } catch (err) {
      const errorMsg = err?.message || 'Error al asignar el rol';
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
      loginLocal,
      updateRole,
      logout,
      clearError,
    }),
    [user, token, isAuthenticated, isLoading, error, loginWithGoogle, loginWithMicrosoft, loginLocal, updateRole, logout, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}

export default AuthContext;
