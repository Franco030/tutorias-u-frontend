import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';

/**
 * Componente de inicio de sesión con Google.
 * Recibe el idToken del popup oficial y lo envía al backend en ASP.NET Core (/api/auth/google).
 */
export function GoogleLoginButton() {
  const { loginWithGoogle, isLoading } = useAuth();
  const [localError, setLocalError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const isConfigured = Boolean(googleClientId && googleClientId !== 'TU_GOOGLE_CLIENT_ID');

  const handleSuccess = async (credentialResponse) => {
    setLocalError(null);
    setIsProcessing(true);

    try {
      if (!credentialResponse?.credential) {
        throw new Error('No se recibió la credencial (idToken) de Google.');
      }
      await loginWithGoogle(credentialResponse.credential);
    } catch (err) {
      console.error('[GoogleLoginButton] Error en login con backend:', err);
      setLocalError(err?.message || 'Error al autenticar con el servidor de TutoriasU.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleError = () => {
    console.error('[GoogleLoginButton] Falló la autenticación con Google.');
    setLocalError('No se pudo completar el inicio de sesión con Google.');
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Indicador si falta configurar el Client ID */}
      {!isConfigured && (
        <div className="w-full mb-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>Nota:</strong> Define <code>VITE_GOOGLE_CLIENT_ID</code> en tu archivo <code>.env</code> para habilitar la autenticación real con Google.
          </span>
        </div>
      )}

      {/* Botón de Google */}
      <div className="w-full relative flex justify-center">
        {(isLoading || isProcessing) && (
          <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-10 rounded-lg">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
            <span className="ml-2 text-xs font-medium text-slate-700 dark:text-slate-300">
              Validando con backend...
            </span>
          </div>
        )}

        <div className="w-full flex justify-center overflow-hidden rounded-xl">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            useOneTap={false}
            shape="rectangular"
            theme="outline"
            size="large"
            text="continue_with"
            locale="es"
            width="360"
          />
        </div>
      </div>

      {localError && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400 font-medium text-center">
          {localError}
        </p>
      )}
    </div>
  );
}

export default GoogleLoginButton;
