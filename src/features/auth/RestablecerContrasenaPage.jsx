import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Body1,
  Button,
  Field,
  Input,
  makeStyles,
  mergeClasses,
  MessageBar,
  MessageBarBody,
  Spinner,
  Title2,
  tokens,
} from "@fluentui/react-components";
import { CheckmarkCircle48Regular, Eye20Regular, EyeOff20Regular } from "@fluentui/react-icons";
import authService from "./authService";
import { CuentaLayout } from "./CuentaLayout";

const MINIMO = 6;

const useStyles = makeStyles({
  form: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalL,
  },
  icon: { display: "flex" },
  success: { color: tokens.colorPaletteGreenForeground1 },
  title: { margin: 0 },
  muted: { color: tokens.colorNeutralForeground3 },
  accion: { alignSelf: "flex-start" },
});

/*
 * Nueva contraseña desde el enlace del correo ("¿Olvidaste tu contraseña?").
 * El enlace vence en una hora y sirve una sola vez; el backend lo valida.
 */
export function RestablecerContrasenaPage() {
  const styles = useStyles();
  const navigate = useNavigate();
  const token = new URLSearchParams(window.location.search).get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(token ? "" : "El enlace no trae el código para restablecer la contraseña.");
  const [listo, setListo] = useState(false);

  const corta = password.length > 0 && password.length < MINIMO;
  const distinta = confirmacion.length > 0 && confirmacion !== password;
  const valido = token && password.length >= MINIMO && confirmacion === password;

  const enviar = async (evento) => {
    evento.preventDefault();
    if (!valido || enviando) return;
    setEnviando(true);
    setError("");
    try {
      await authService.restablecerContrasena(token, password);
      setListo(true);
    } catch (err) {
      setError(err?.message || "No se pudo cambiar la contraseña. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  if (listo) {
    return (
      <CuentaLayout>
        <span className={mergeClasses(styles.icon, styles.success)} aria-hidden="true">
          <CheckmarkCircle48Regular />
        </span>
        <Title2 as="h1" className={styles.title}>
          Tu contraseña cambió
        </Title2>
        <Body1 className={styles.muted}>Ya puedes iniciar sesión con la contraseña nueva.</Body1>
        <Button appearance="primary" className={styles.accion} onClick={() => navigate("/", { replace: true })}>
          Iniciar sesión
        </Button>
      </CuentaLayout>
    );
  }

  const ojo = (
    <Button
      appearance="transparent"
      size="small"
      icon={mostrar ? <EyeOff20Regular /> : <Eye20Regular />}
      aria-label={mostrar ? "Ocultar contraseña" : "Mostrar contraseña"}
      onClick={() => setMostrar((valor) => !valor)}
    />
  );

  return (
    <CuentaLayout>
      <Title2 as="h1" className={styles.title}>
        Elige una contraseña nueva
      </Title2>
      <Body1 className={styles.muted}>Usa al menos {MINIMO} caracteres. Después iniciarás sesión con ella.</Body1>

      <form className={styles.form} onSubmit={enviar}>
        {error && (
          <MessageBar intent="error" layout="multiline">
            <MessageBarBody>{error}</MessageBarBody>
          </MessageBar>
        )}

        <Field
          label="Contraseña nueva"
          required
          validationState={corta ? "error" : "none"}
          validationMessage={corta ? `Debe tener al menos ${MINIMO} caracteres.` : undefined}
        >
          <Input
            type={mostrar ? "text" : "password"}
            value={password}
            onChange={(_, data) => setPassword(data.value)}
            autoComplete="new-password"
            contentAfter={ojo}
          />
        </Field>

        <Field
          label="Confirma la contraseña"
          required
          validationState={distinta ? "error" : "none"}
          validationMessage={distinta ? "Las contraseñas no coinciden." : undefined}
        >
          <Input
            type={mostrar ? "text" : "password"}
            value={confirmacion}
            onChange={(_, data) => setConfirmacion(data.value)}
            autoComplete="new-password"
          />
        </Field>

        <Button
          type="submit"
          appearance="primary"
          size="large"
          disabled={!valido || enviando}
          icon={enviando ? <Spinner size="tiny" /> : undefined}
        >
          {enviando ? "Guardando…" : "Cambiar contraseña"}
        </Button>
      </form>
    </CuentaLayout>
  );
}

export default RestablecerContrasenaPage;
