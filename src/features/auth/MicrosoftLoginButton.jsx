import { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from './msalConfig';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

export function MicrosoftLoginButton() {
  const { instance } = useMsal();
  const { isLoading } = useAuth();
  const [localError, setLocalError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleMicrosoftLogin = async (e) => {
    if (e) e.preventDefault();
    
    setLocalError(null);
    setIsProcessing(true);

    try {
      await instance.loginRedirect({
        ...loginRequest,
        redirectUri: window.location.origin
      });
    } catch (err) {
      console.error('[MicrosoftLoginButton] Error durante el inicio de sesión:', err);
      if (err?.errorCode === 'user_cancelled') {
        setLocalError('Inicio de sesión cancelado por el usuario.');
      } else {
        setLocalError(err?.message || 'Ocurrió un error al autenticar con Microsoft.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const isBusy = isLoading || isProcessing;

  return (
    <div className="w-full flex flex-col items-center">
      <button
        type="button"
        onClick={handleMicrosoftLogin}
        disabled={isBusy}
        className="w-full max-w-[360px] h-[40px] px-4 rounded-xl border border-granite-200 dark:border-deep-space-blue-800 bg-white dark:bg-deep-space-blue-900/50 text-granite-900 dark:text-white font-medium text-sm hover:bg-granite-50 dark:hover:bg-deep-space-blue-800 hover:border-granite-300 dark:hover:border-deep-space-blue-700 focus:outline-none focus:ring-2 focus:ring-deep-space-blue-500 focus:ring-offset-2 dark:focus:ring-offset-deep-space-blue-950 transition-[background-color,border-color,box-shadow] duration-200 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      >
        {isBusy ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-deep-space-blue-600 dark:text-deep-space-blue-400" />
            <span>Autenticando con Microsoft...</span>
          </>
        ) : (
          <>
            <svg
              className="w-4 h-4 shrink-0"
              viewBox="0 0 21 21"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <rect x="1" y="1" width="9" height="9" fill="#F25022" />
              <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
              <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
              <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
            </svg>
            <span className="truncate">Continuar con Microsoft</span>
          </>
        )}
      </button>

      {localError && (
        <p className="mt-2 text-xs text-burgundy-600 dark:text-burgundy-400 font-medium text-center">
          {localError}
        </p>
      )}
    </div>
  );
}

export default MicrosoftLoginButton;
