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
  makeStyles,
  MessageBar,
  MessageBarBody,
  Rating,
  Spinner,
  Text,
  Textarea,
  tokens,
} from "@fluentui/react-components";
import { Dismiss24Regular } from "@fluentui/react-icons";
import { crearResena } from "../../services/resenaService";
import { formatoSesion } from "../../lib/formato";

const MAX_COMENTARIO = 1000;

const ETIQUETAS_PUNTUACION = ["", "Muy mala", "Mala", "Regular", "Buena", "Excelente"];

const useStyles = makeStyles({
  surface: {
    width: "100%",
    maxWidth: "520px",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalL,
  },
  muted: {
    color: tokens.colorNeutralForeground3,
  },
  puntuacion: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXS,
  },
  estrellas: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    columnGap: tokens.spacingHorizontalM,
    rowGap: tokens.spacingVerticalXS,
  },
  etiqueta: {
    minWidth: "72px",
    color: tokens.colorNeutralForeground2,
  },
  contador: {
    color: tokens.colorNeutralForeground3,
    fontVariantNumeric: "tabular-nums",
  },
});

/*
 * Calificación de una sesión completada: estrellas de 1 a 5 y un comentario
 * opcional. Cada cita se califica una sola vez (el backend lo garantiza).
 */
export default function CalificarTutoriaModal({ tutoria, onClose, onCalificada }) {
  const styles = useStyles();
  const [puntuacion, setPuntuacion] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  if (!tutoria) {
    return null;
  }

  const cerrar = () => {
    if (enviando) return;
    setPuntuacion(0);
    setComentario("");
    setError("");
    onClose();
  };

  const enviar = async (evento) => {
    evento.preventDefault();
    if (enviando || puntuacion < 1) return;

    try {
      setEnviando(true);
      setError("");
      await crearResena({
        citaId: tutoria.id,
        puntuacion,
        comentario: comentario.trim() || null,
      });
      onCalificada(tutoria, puntuacion);
      setPuntuacion(0);
      setComentario("");
      onClose();
    } catch (err) {
      console.error("Error al enviar la reseña:", err);
      setError(err.message || "No se pudo guardar tu reseña.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialog
      open
      onOpenChange={(_, data) => {
        if (!data.open) cerrar();
      }}
    >
      <DialogSurface className={styles.surface}>
        <form onSubmit={enviar}>
          <DialogBody>
            <DialogTitle
              action={
                <Button
                  appearance="subtle"
                  aria-label="Cerrar"
                  icon={<Dismiss24Regular />}
                  onClick={cerrar}
                  disabled={enviando}
                />
              }
            >
              Calificar tutoría
            </DialogTitle>

            <DialogContent className={styles.content}>
              <Body1 className={styles.muted}>
                {tutoria.materia} con {tutoria.rolOpuestoNombre} ·{" "}
                {formatoSesion.format(new Date(tutoria.fechaHoraInicio))}
              </Body1>

              <div className={styles.puntuacion}>
                <Text id="calificar-puntuacion" weight="semibold">
                  ¿Cómo fue la sesión?
                </Text>
                <div className={styles.estrellas}>
                  <Rating
                    aria-labelledby="calificar-puntuacion"
                    value={puntuacion}
                    onChange={(_, data) => setPuntuacion(data.value)}
                    color="marigold"
                    size="extra-large"
                    itemLabel={(valor) => `${valor} de 5 estrellas`}
                    disabled={enviando}
                  />
                  <Caption1 className={styles.etiqueta} aria-live="polite">
                    {ETIQUETAS_PUNTUACION[puntuacion]}
                  </Caption1>
                </div>
              </div>

              <Field
                label="Comentario (opcional)"
                hint={
                  <span className={styles.contador}>
                    {comentario.length} / {MAX_COMENTARIO}
                  </span>
                }
              >
                <Textarea
                  value={comentario}
                  onChange={(_, data) => setComentario(data.value)}
                  maxLength={MAX_COMENTARIO}
                  rows={4}
                  resize="vertical"
                  placeholder="Qué te ayudó, cómo explica, si lo recomendarías…"
                  disabled={enviando}
                />
              </Field>

              {error && (
                <MessageBar intent="error" layout="multiline">
                  <MessageBarBody>{error}</MessageBarBody>
                </MessageBar>
              )}
            </DialogContent>

            <DialogActions fluid>
              <Button appearance="secondary" onClick={cerrar} disabled={enviando}>
                Cancelar
              </Button>
              <Button
                type="submit"
                appearance="primary"
                disabled={enviando || puntuacion < 1}
                icon={enviando ? <Spinner size="tiny" /> : undefined}
              >
                {enviando ? "Enviando…" : "Enviar reseña"}
              </Button>
            </DialogActions>
          </DialogBody>
        </form>
      </DialogSurface>
    </Dialog>
  );
}
