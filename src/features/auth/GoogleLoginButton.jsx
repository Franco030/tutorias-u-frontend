import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../context/AuthContext";
import { MessageBar, MessageBarBody } from "@fluentui/react-components";
import { GoogleLogo, ProviderButton } from "./ProviderButton";

export function GoogleLoginButton() {
  const { loginWithGoogle, isLoading, clearError } = useAuth();
  const [localError, setLocalError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const isConfigured = Boolean(
    googleClientId && googleClientId !== "TU_GOOGLE_CLIENT_ID",
  );

  const loginConGoogle = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      setLocalError(null);
      setIsProcessing(true);
      try {
        const token = codeResponse.access_token;
        if (!token) {
          throw new Error("No se recibió el token de acceso de Google.");
        }
        await loginWithGoogle(token);
      } catch (err) {
        console.error("[GoogleLoginButton] Error en login con backend:", err);
        clearError();
        setLocalError(
          err?.message || "Error al autenticar con el servidor de TutoriasU.",
        );
      } finally {
        setIsProcessing(false);
      }
    },
    onError: (error) => {
      console.error(
        "[GoogleLoginButton] Falló la autenticación con Google:",
        error,
      );
      setLocalError("No se pudo completar el inicio de sesión con Google.");
    },
  });

  const isBusy = isLoading || isProcessing;

  return (
    <>
      {!isConfigured && (
        <MessageBar intent="warning" layout="multiline">
          <MessageBarBody>
            Define <code>VITE_GOOGLE_CLIENT_ID</code> en tu archivo <code>.env</code> para habilitar Google.
          </MessageBarBody>
        </MessageBar>
      )}

      <ProviderButton
        logo={<GoogleLogo />}
        busy={isProcessing}
        disabled={isBusy}
        onClick={() => loginConGoogle()}
      >
        Continuar con Google
      </ProviderButton>

      {localError && (
        <MessageBar intent="error" layout="multiline">
          <MessageBarBody>{localError}</MessageBarBody>
        </MessageBar>
      )}
    </>
  );
}

export default GoogleLoginButton;
