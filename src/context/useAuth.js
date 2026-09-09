import { useContext } from 'react';
import { AuthContext } from './AuthContext';

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

export default useAuth;
