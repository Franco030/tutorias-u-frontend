import { useState } from "react";
import {
  Body1,
  Button,
  Caption1,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Field,
  Input,
  makeStyles,
  Spinner,
  Text,
  Textarea,
  tokens,
} from "@fluentui/react-components";
import { Dismiss24Regular } from "@fluentui/react-icons";

const useStyles = makeStyles({
  surface: {
    width: "min(520px, calc(100vw - 32px))",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalL,
  },
  summary: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXXS,
    padding: tokens.spacingHorizontalM,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground3,
  },
  muted: {
    color: tokens.colorNeutralForeground3,
  },
  tema: {
    marginTop: tokens.spacingVerticalXS,
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
  },
});

export default function ConfirmarTutoriaModal({
  cita,
  abierto,
  onCerrar,
  onConfirmar,
  guardando,
  linkPredeterminado = "",
}) {
  const styles = useStyles();
  const [linkReunion, setLinkReunion] = useState("");
  const [notas, setNotas] = useState("");
  const [citaAnterior, setCitaAnterior] = useState(null);

  // Al abrir otra solicitud, el enlace arranca con el enlace fijo del tutor.
  if (cita !== citaAnterior) {
    setCitaAnterior(cita);
    setLinkReunion(linkPredeterminado ?? "");
  }

  if (!abierto || !cita) {
    return null;
  }

  const limpiarFormulario = () => {
    setLinkReunion("");
    setNotas("");
  };

  const cerrar = () => {
    limpiarFormulario();
    onCerrar();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onConfirmar({
      linkReunion: linkReunion.trim() || null,
      notas: notas.trim() || null,
    });

    limpiarFormulario();
  };

  return (
    <Dialog
      open
      onOpenChange={(_, data) => {
        if (!data.open && !guardando) cerrar();
      }}
    >
      <DialogSurface className={styles.surface}>
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <DialogTitle
              action={
                <Button
                  appearance="subtle"
                  aria-label="Cerrar"
                  icon={<Dismiss24Regular />}
                  onClick={cerrar}
                  disabled={guardando}
                />
              }
            >
              Aceptar solicitud
            </DialogTitle>

            <DialogContent className={styles.form}>
              <div className={styles.summary}>
                <Text weight="semibold">{cita.materiaNombre}</Text>
                <Caption1 className={styles.muted}>Estudiante: {cita.estudianteNombre}</Caption1>
                {cita.tema && (
                  <Body1 className={styles.tema}>
                    <span className={styles.muted}>Quiere repasar: </span>
                    {cita.tema}
                  </Body1>
                )}
              </div>

              <Body1 className={styles.muted}>
                Agrega el enlace de la reunión y cualquier indicación para el estudiante. Ambos son opcionales.
              </Body1>

              <Field
                label="Enlace de reunión"
                hint={
                  linkPredeterminado && linkReunion === linkPredeterminado
                    ? "Es tu enlace fijo; cámbialo solo si esta sesión usa otro."
                    : undefined
                }
              >
                <Input
                  id="linkReunion"
                  type="url"
                  value={linkReunion}
                  onChange={(_, data) => setLinkReunion(data.value)}
                  placeholder="https://meet.google.com/abc-defg-hij"
                  disabled={guardando}
                />
              </Field>

              <Field label="Notas">
                <Textarea
                  id="notas"
                  value={notas}
                  onChange={(_, data) => setNotas(data.value)}
                  rows={4}
                  resize="vertical"
                  disabled={guardando}
                />
              </Field>
            </DialogContent>

            <DialogActions>
              <Button appearance="secondary" onClick={cerrar} disabled={guardando}>
                Cancelar
              </Button>
              <Button
                type="submit"
                appearance="primary"
                disabled={guardando}
                icon={guardando ? <Spinner size="tiny" /> : undefined}
              >
                {guardando ? "Aceptando…" : "Confirmar tutoría"}
              </Button>
            </DialogActions>
          </DialogBody>
        </form>
      </DialogSurface>
    </Dialog>
  );
}
