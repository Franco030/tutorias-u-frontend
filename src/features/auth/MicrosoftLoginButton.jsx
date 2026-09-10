import { useState } from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "./msalConfig";
import { useAuth } from "../../context/AuthContext";
import { Loader2 } from "lucide-react";

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
        redirectUri: window.location.origin,
      });
    } catch (err) {
      console.error(
        "[MicrosoftLoginButton] Error durante el inicio de sesión:",
        err,
      );
      if (err?.errorCode === "user_cancelled") {
        setLocalError("Inicio de sesión cancelado por el usuario.");
      } else {
        setLocalError(
          err?.message || "Ocurrió un error al autenticar con Microsoft.",
        );
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
        className="group relative flex items-center justify-center w-full py-3 cursor-pointer text-granite-700 dark:text-white hover:text-deep-space-blue-600 dark:hover:text-emerald-400 font-medium text-sm disabled:opacity-60 focus:outline-none"
      >
        <span className="absolute bottom-0 left-1/2 w-0 h-[1px] bg-deep-space-blue-600 dark:bg-emerald-400 group-hover:w-full group-hover:left-0 transition-all duration-500 ease-out"></span>
        <div className="flex items-center gap-3 relative z-10">
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-deep-space-blue-600 dark:text-deep-space-blue-400" />
              <span>Autenticando...</span>
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                viewBox="0 0 21 21"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
                <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
                <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
              </svg>
              <span className="truncate tracking-wide">
                Continuar con Microsoft
              </span>
            </>
          )}
        </div>
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
