import { useState } from "react";
import {
  Button,
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
});

export function LocalAuthForm() {
  const styles = useStyles();
  const { loginLocal, isLoading, clearError } = useAuth();
  const [isRegister, setIsRegister] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const [localError, setLocalError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMsg(null);
    setIsProcessing(true);

    try {
      if (isRegister) {
        await authService.registerLocal(email, nombre, password);
        setSuccessMsg(
          "Cuenta creada. Revisa tu bandeja de entrada (o la carpeta de spam) para verificar tu correo.",
        );
        setIsRegister(false); // Cambiamos a login
        setPassword("");
      } else {
        await loginLocal(email, password);
      }
    } catch (err) {
      console.error(err);
      // El formulario muestra su propio mensaje; se limpia el error global para no duplicarlo.
      clearError();
      setLocalError(
        isRegister
          ? "No se pudo crear la cuenta. Revisa los datos o prueba con otro correo."
          : "El correo o la contraseña no coinciden. Revísalos e inténtalo de nuevo.",
      );
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
        <MessageBar intent="error" layout="multiline">
          <MessageBarBody>{localError}</MessageBarBody>
        </MessageBar>
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
          }}
          placeholder="nombre@universidad.edu"
          autoComplete="email"
        />
      </Field>

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

      <Button
        type="submit"
        appearance="primary"
        size="large"
        disabled={isBusy}
        icon={isProcessing ? <Spinner size="tiny" /> : undefined}
        className={styles.submit}
      >
        {isRegister ? "Crear cuenta" : "Iniciar sesión"}
      </Button>

      <Link
        as="button"
        type="button"
        className={styles.switch}
        onClick={() => {
          setIsRegister(!isRegister);
          setLocalError(null);
          setSuccessMsg(null);
        }}
      >
        {isRegister ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
      </Link>
    </form>
  );
}

export default LocalAuthForm;
