import { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from './msalConfig';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * Componente de inicio de sesión con Microsoft (Azure AD / Entra ID).
 * Abre el popup de autenticación de Microsoft, obtiene el idToken y lo envía
 * al endpoint /api/auth/microsoft de nuestro backend en ASP.NET Core.
 */
export function MicrosoftLoginButton() {
  const { instance } = useMsal();
  const { loginWithMicrosoft, isLoading } = useAuth();
  const [localError, setLocalError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleMicrosoftLogin = async (e) => {
    if (e) e.preventDefault(); // ⭐️ Evita cualquier recarga accidental de la página
    
    setLocalError(null);
    setIsProcessing(true);

    try {
      // 1. Iniciar redirección de Microsoft (navega a la página de login)
      await instance.loginRedirect({
        ...loginRequest,
        redirectUri: window.location.origin
      });
      // El código debajo de esta línea no se ejecutará porque la ventana redirige
    } catch (err) {
      console.error('[MicrosoftLoginButton] Error durante el inicio de sesión:', err);
      // Evitar mensaje de error si el usuario cerró el popup voluntariamente
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
        className="w-full max-w-[360px] h-[40px] px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium text-sm shadow-xs hover:bg-slate-50 dark:hover:bg-slate-750 hover:border-slate-400 dark:hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      >
        {isBusy ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
            <span>Autenticando con Microsoft...</span>
          </>
        ) : (
          <>
            {/* Ícono oficial de Microsoft (4 colores) */}
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
        <p className="mt-2 text-xs text-red-600 dark:text-red-400 font-medium text-center">
          {localError}
        </p>
      )}
    </div>
  );
}

export default MicrosoftLoginButton;
