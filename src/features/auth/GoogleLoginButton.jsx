import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';

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
      const idToken = credentialResponse.credential;
      if (!idToken) {
        throw new Error('No se recibió la credencial (idToken) de Google.');
      }
      await loginWithGoogle(idToken);
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

  const isBusy = isLoading || isProcessing;

  return (
    <div className="w-full flex flex-col items-center">
      {!isConfigured && (
        <div className="w-full mb-2 p-2.5 rounded-xl bg-burgundy-50 dark:bg-burgundy-950/40 border border-burgundy-200 dark:border-burgundy-800 text-burgundy-800 dark:text-burgundy-300 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-burgundy-600 dark:text-burgundy-400 shrink-0 mt-0.5" />
          <span>
            <strong>Nota:</strong> Define <code>VITE_GOOGLE_CLIENT_ID</code> en tu archivo <code>.env</code>.
          </span>
        </div>
      )}

      <div className="w-full relative flex justify-center">
        {isBusy && (
          <div className="absolute inset-0 bg-white/70 dark:bg-granite-900/70 backdrop-blur-xs flex items-center justify-center z-10 rounded-xl">
            <Loader2 className="w-5 h-5 animate-spin text-deep-space-blue-600 dark:text-deep-space-blue-400" />
            <span className="ml-2 text-xs font-medium text-granite-700 dark:text-granite-300">
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
        <p className="mt-2 text-xs text-burgundy-600 dark:text-burgundy-400 font-medium text-center">
          {localError}
        </p>
      )}
    </div>
  );
}

export default GoogleLoginButton;
