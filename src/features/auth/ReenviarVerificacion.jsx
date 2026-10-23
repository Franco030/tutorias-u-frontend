import { useState } from "react";
import { Button, Field, Input, makeStyles, MessageBar, MessageBarBody, Spinner, tokens } from "@fluentui/react-components";
import authService from "./authService";

const useStyles = makeStyles({
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: tokens.spacingVerticalM,
  },
  campo: {
    alignSelf: "stretch",
  },
});

/*
 * Pide otro correo de verificación. Con `email` (ya escrito al iniciar
 * sesión) es solo el botón; sin él, pide el correo. La respuesta es la misma
 * exista o no la cuenta, así que el mensaje de éxito es neutro.
 */
export function ReenviarVerificacion({ email: emailConocido, appearance = "secondary" }) {
  const styles = useStyles();
  const [email, setEmail] = useState(emailConocido ?? "");
  const [estado, setEstado] = useState("listo");

  // Con el correo ya conocido va dentro del formulario de acceso: sin un
  // <form> propio (no se anidan formularios), solo un botón.
  const conFormulario = emailConocido == null;
  const Contenedor = conFormulario ? "form" : "div";

  const enviar = async (evento) => {
    evento?.preventDefault();
    if (!email.trim()) return;
    setEstado("enviando");
    try {
      await authService.reenviarVerificacion(email.trim());
      setEstado("enviado");
    } catch {
      setEstado("error");
    }
  };

  if (estado === "enviado") {
    return (
      <MessageBar intent="success" layout="multiline">
        <MessageBarBody>
          Si tu cuenta sigue sin verificar, te enviamos un correo nuevo. Revisa también la carpeta de spam.
        </MessageBarBody>
      </MessageBar>
    );
  }

  return (
    <Contenedor className={styles.form} onSubmit={conFormulario ? enviar : undefined}>
      {estado === "error" && (
        <MessageBar intent="error" layout="multiline">
          <MessageBarBody>No pudimos enviar el correo. Inténtalo de nuevo en unos minutos.</MessageBarBody>
        </MessageBar>
      )}
      {conFormulario && (
        <Field label="Correo electrónico" required className={styles.campo}>
          <Input type="email" value={email} onChange={(_, data) => setEmail(data.value)} autoComplete="email" />
        </Field>
      )}
      <Button
        type={conFormulario ? "submit" : "button"}
        onClick={conFormulario ? undefined : enviar}
        appearance={appearance}
        disabled={estado === "enviando" || !email.trim()}
        icon={estado === "enviando" ? <Spinner size="tiny" /> : undefined}
      >
        Reenviar el correo de verificación
      </Button>
    </Contenedor>
  );
}

export default ReenviarVerificacion;
