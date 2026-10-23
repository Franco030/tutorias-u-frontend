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
  Divider,
  Field,
  Link,
  makeStyles,
  MessageBar,
  MessageBarBody,
  Spinner,
  Text,
  Textarea,
  tokens,
} from "@fluentui/react-components";
import {
  BookOpen20Regular,
  CalendarLtr20Regular,
  Clock20Regular,
  Dismiss24Regular,
  Lightbulb20Regular,
  Notepad20Regular,
  Person20Regular,
  Video20Regular,
} from "@fluentui/react-icons";
import { cancelarCita } from "../../services/citaService";
import { EstadoBadge } from "../../components/ui/EstadoBadge";
import { DangerButton } from "../../components/ui/DangerButton";

const useStyles = makeStyles({
  surface: {
    width: "100%",
    maxWidth: "520px",
  },
  details: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
    margin: 0,
  },
  row: {
    display: "grid",
    gridTemplateColumns: "20px minmax(0, 1fr)",
    columnGap: tokens.spacingHorizontalM,
    alignItems: "start",
  },
  // Centrado con el par etiqueta + primera línea del valor (como el ícono de
  // una SettingsCard de Windows); en notas largas no baja al centro del párrafo.
  icon: {
    display: "flex",
    alignItems: "center",
    height: `calc(${tokens.lineHeightBase200} + ${tokens.lineHeightBase300})`,
    color: tokens.colorNeutralForeground3,
  },
  // Bloque de 16 px de alto exactos (Text es inline por defecto).
  term: {
    display: "block",
    color: tokens.colorNeutralForeground3,
  },
  value: {
    margin: 0,
    overflowWrap: "anywhere",
  },
  notes: {
    margin: 0,
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
  },
  muted: {
    color: tokens.colorNeutralForeground3,
  },
  cancelZone: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
    marginTop: tokens.spacingVerticalL,
  },
});

function Dato({ icon, termino, children }) {
  const styles = useStyles();
  return (
    <div className={styles.row}>
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
      <div>
        <Caption1 as="dt" className={styles.term}>
          {termino}
        </Caption1>
        <dd className={styles.value}>{children}</dd>
      </div>
    </div>
  );
}

export default function TutoriaDetallesModal({
  isOpen,
  onClose,
  tutoria,
  onCancelled,
}) {
  const styles = useStyles();
  const [confirmandoCancelacion, setConfirmandoCancelacion] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [cancelando, setCancelando] = useState(false);
  const [errorCancelacion, setErrorCancelacion] = useState("");

  if (!isOpen || !tutoria) {
    return null;
  }

  const puedeCancelar = ["Pendiente", "Aceptada"].includes(tutoria.estado);
  const fecha = new Date(tutoria.fechaHoraInicio);

  const fechaFormateada = fecha.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const horaFormateada = fecha.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleCancelar = async () => {
    if (cancelando) return;

    try {
      setCancelando(true);
      setErrorCancelacion("");
      await cancelarCita(tutoria.id, motivo.trim());
      onCancelled(tutoria);
      handleClose();
    } catch (err) {
      console.error("Error al cancelar la tutoría:", err);
      setErrorCancelacion(err.message || "No se pudo cancelar la tutoría.");
    } finally {
      setCancelando(false);
    }
  };

  const handleClose = () => {
    setConfirmandoCancelacion(false);
    setMotivo("");
    setErrorCancelacion("");
    onClose();
  };

  return (
    <Dialog
      open
      onOpenChange={(_, data) => {
        if (!data.open && !cancelando) handleClose();
      }}
    >
      <DialogSurface className={styles.surface}>
        <DialogBody>
          <DialogTitle
            action={
              <Button
                appearance="subtle"
                aria-label="Cerrar detalles"
                icon={<Dismiss24Regular />}
                onClick={handleClose}
                disabled={cancelando}
              />
            }
          >
            {tutoria.materia}
          </DialogTitle>

          <DialogContent>
            <dl className={styles.details}>
              <Dato icon={<BookOpen20Regular />} termino="Estado">
                <EstadoBadge estado={tutoria.estado || "Aceptada"} />
              </Dato>
              <Dato icon={<Person20Regular />} termino="Tutor o estudiante">
                <Text>{tutoria.rolOpuestoNombre}</Text>
              </Dato>
              <Dato icon={<CalendarLtr20Regular />} termino="Fecha">
                <Text>{fechaFormateada}</Text>
              </Dato>
              <Dato icon={<Clock20Regular />} termino="Hora">
                <Text>{horaFormateada}</Text>
              </Dato>
              <Dato icon={<Video20Regular />} termino="Enlace de reunión">
                {tutoria.linkReunion ? (
                  <Link href={tutoria.linkReunion} target="_blank" rel="noopener noreferrer">
                    Unirse a la videollamada
                  </Link>
                ) : (
                  <Text className={styles.muted}>Aún no disponible</Text>
                )}
              </Dato>
              {tutoria.tema && (
                <Dato icon={<Lightbulb20Regular />} termino="Quiere repasar">
                  <Body1 as="p" className={styles.notes}>
                    {tutoria.tema}
                  </Body1>
                </Dato>
              )}
              {tutoria.notas && (
                <Dato icon={<Notepad20Regular />} termino="Notas">
                  <Body1 as="p" className={styles.notes}>
                    {tutoria.notas}
                  </Body1>
                </Dato>
              )}
            </dl>

            {puedeCancelar && confirmandoCancelacion && (
              <div className={styles.cancelZone}>
                <Divider />
                <Text weight="semibold">¿Cancelar esta tutoría?</Text>
                <Body1 className={styles.muted}>
                  La otra persona verá la sesión como cancelada. Esta acción no se puede deshacer.
                </Body1>
                <Field label="Motivo (opcional)">
                  <Textarea
                    id="motivo-cancelacion"
                    value={motivo}
                    onChange={(_, data) => setMotivo(data.value)}
                    maxLength={1000}
                    rows={3}
                    resize="vertical"
                    disabled={cancelando}
                  />
                </Field>
                {errorCancelacion && (
                  <MessageBar intent="error" layout="multiline">
                    <MessageBarBody>{errorCancelacion}</MessageBarBody>
                  </MessageBar>
                )}
              </div>
            )}
          </DialogContent>

          <DialogActions fluid>
            {puedeCancelar && confirmandoCancelacion ? (
              <>
                <Button
                  appearance="secondary"
                  onClick={() => {
                    setConfirmandoCancelacion(false);
                    setMotivo("");
                    setErrorCancelacion("");
                  }}
                  disabled={cancelando}
                >
                  Volver
                </Button>
                <DangerButton
                  onClick={handleCancelar}
                  disabled={cancelando}
                  icon={cancelando ? <Spinner size="tiny" /> : undefined}
                >
                  {cancelando ? "Cancelando…" : "Confirmar cancelación"}
                </DangerButton>
              </>
            ) : (
              <>
                {puedeCancelar && (
                  <DangerButton variant="outline" onClick={() => setConfirmandoCancelacion(true)}>
                    Cancelar tutoría
                  </DangerButton>
                )}
                <Button appearance="primary" onClick={handleClose}>
                  Cerrar
                </Button>
              </>
            )}
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
