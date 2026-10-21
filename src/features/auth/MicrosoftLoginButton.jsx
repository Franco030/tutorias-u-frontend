import { useState } from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "./msalConfig";
import { useAuth } from "../../context/AuthContext";
import { MessageBar, MessageBarBody } from "@fluentui/react-components";
import { MicrosoftLogo, ProviderButton } from "./ProviderButton";

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
    <>
      <ProviderButton
        logo={<MicrosoftLogo />}
        busy={isProcessing}
        disabled={isBusy}
        onClick={handleMicrosoftLogin}
      >
        Continuar con Microsoft
      </ProviderButton>

      {localError && (
        <MessageBar intent="error" layout="multiline">
          <MessageBarBody>{localError}</MessageBarBody>
        </MessageBar>
      )}
    </>
  );
}

export default MicrosoftLoginButton;
