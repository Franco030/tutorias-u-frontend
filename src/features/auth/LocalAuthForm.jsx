import { useState } from "react";
import {
  Button,
  Caption1,
  Field,
  Input,
  Link,
  makeStyles,
  MessageBar,
  MessageBarBody,
  Spinner,
  tokens,
} from "@fluentui/react-components";
import { Eye20Regular, EyeOff20Regular } from "@fluentui/react-icons";
import { useAuth } from "../../context/AuthContext";
import authService from "./authService";
import { EnlaceInterno } from "../../components/ui/EnlaceInterno";
import { ReenviarVerificacion } from "./ReenviarVerificacion";

const useStyles = makeStyles({
  form: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalL,
  },
  submit: {
    width: "100%",
  },
  switch: {
    alignSelf: "center",
  },
  // Debajo de la contraseña, alineado a la izquierda (patrón de cuenta Microsoft).
  olvide: {
    alignSelf: "flex-start",
    marginTop: `calc(${tokens.spacingVerticalS} * -1)`,
  },
  aviso: {
    marginTop: `calc(${tokens.spacingVerticalS} * -1)`,
    textAlign: "center",
    color: tokens.colorNeutralForeground3,
  },
  sinVerificar: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: tokens.spacingVerticalS,
  },
});

// Mensaje de un inicio de sesión fallido: el del backend cuando dice algo útil
// (correo sin verificar, cuenta de Google/Microsoft); si no, uno genérico.
function mensajeDeAcceso(err) {
  if (err?.data?.codigo === "correo-sin-verificar") return err.message;
  if (/Google|Microsoft/.test(err?.message ?? "")) return err.message;
  return "El correo o la contraseña no coinciden. Revísalos e inténtalo de nuevo.";
}

/*
 * Correo y contraseña. `modo` lo controla el panel de acceso: "acceso"
 * (iniciar sesión), "registro" o "recuperar" (pedir el enlace para
 * restablecer la contraseña).
 */
export function LocalAuthForm({ modo = "acceso", onModo }) {
  const styles = useStyles();
  const { loginLocal, isLoading, clearError } = useAuth();
  const isRegister = modo === "registro";
  const recuperando = modo === "recuperar";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const [localError, setLocalError] = useState(null);
  const [sinVerificar, setSinVerificar] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const cambiarModo = (nuevo) => {
    setLocalError(null);
    setSinVerificar(false);
    setSuccessMsg(null);
    onModo(nuevo);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setSinVerificar(false);
    setSuccessMsg(null);
    setIsProcessing(true);

    try {
      if (recuperando) {
        await authService.solicitarRestablecimiento(email.trim());
        setSuccessMsg(
          "Si hay una cuenta con ese correo, te enviamos un enlace para elegir una contraseña nueva. Vence en una hora; revisa también la carpeta de spam."
        );
      } else if (isRegister) {
        await authService.registerLocal(email, nombre, password);
        setSuccessMsg(
          "Cuenta creada. Revisa tu bandeja de entrada (o la carpeta de spam) para verificar tu correo.",
        );
        onModo("acceso");
        setPassword("");
      } else {
        await loginLocal(email, password);
      }
    } catch (err) {
      console.error(err);
      // El formulario muestra su propio mensaje; se limpia el error global para no duplicarlo.
      clearError();
      if (recuperando) {
        setLocalError("No pudimos enviar el enlace. Inténtalo de nuevo en unos minutos.");
      } else if (isRegister) {
        setLocalError("No se pudo crear la cuenta. Revisa los datos o prueba con otro correo.");
      } else {
        setLocalError(mensajeDeAcceso(err));
        setSinVerificar(err?.data?.codigo === "correo-sin-verificar");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const isBusy = isLoading || isProcessing;

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {successMsg && (
        <MessageBar intent="success" layout="multiline">
          <MessageBarBody>{successMsg}</MessageBarBody>
        </MessageBar>
      )}

      {localError && (
        <MessageBar intent={sinVerificar ? "warning" : "error"} layout="multiline">
          <MessageBarBody>{localError}</MessageBarBody>
        </MessageBar>
      )}

      {sinVerificar && (
        <div className={styles.sinVerificar}>
          <ReenviarVerificacion email={email.trim()} />
        </div>
      )}

      {isRegister && (
        <Field label="Nombre completo" required>
          <Input
            id="nombre"
            value={nombre}
            onChange={(_, data) => setNombre(data.value)}
            autoComplete="name"
          />
        </Field>
      )}

      <Field label="Correo electrónico" required>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(_, data) => {
            setEmail(data.value);
            setLocalError(null);
            setSinVerificar(false);
          }}
          placeholder="nombre@universidad.edu"
          autoComplete="email"
        />
      </Field>

      {!recuperando && (
        <Field label="Contraseña" required>
          <Input
            id="password"
            type={mostrarPassword ? "text" : "password"}
            value={password}
            onChange={(_, data) => {
              setPassword(data.value);
              setLocalError(null);
            }}
            autoComplete={isRegister ? "new-password" : "current-password"}
            contentAfter={
              <Button
                appearance="transparent"
                size="small"
                icon={mostrarPassword ? <EyeOff20Regular /> : <Eye20Regular />}
                aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                onClick={() => setMostrarPassword((valor) => !valor)}
              />
            }
          />
        </Field>
      )}

      {modo === "acceso" && (
        <Link as="button" type="button" className={styles.olvide} onClick={() => cambiarModo("recuperar")}>
          ¿Olvidaste tu contraseña?
        </Link>
      )}

      <Button
        type="submit"
        appearance="primary"
        size="large"
        disabled={isBusy || (recuperando && !email.trim())}
        icon={isProcessing ? <Spinner size="tiny" /> : undefined}
        className={styles.submit}
      >
        {recuperando ? "Enviar enlace" : isRegister ? "Crear cuenta" : "Iniciar sesión"}
      </Button>

      {isRegister && (
        <Caption1 className={styles.aviso}>
          Al crear tu cuenta aceptas los <EnlaceInterno to="/terminos">Términos de uso</EnlaceInterno> y el{" "}
          <EnlaceInterno to="/privacidad">Aviso de privacidad</EnlaceInterno>.
        </Caption1>
      )}

      <Link
        as="button"
        type="button"
        className={styles.switch}
        onClick={() => cambiarModo(modo === "acceso" ? "registro" : "acceso")}
      >
        {recuperando
          ? "Volver a iniciar sesión"
          : isRegister
            ? "¿Ya tienes cuenta? Inicia sesión"
            : "¿No tienes cuenta? Regístrate"}
      </Link>
    </form>
  );
}

export default LocalAuthForm;
