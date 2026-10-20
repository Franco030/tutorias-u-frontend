import { useEffect, useState } from "react";
import {
  Body1,
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  MessageBar,
  MessageBarBody,
  Spinner,
} from "@fluentui/react-components";
import { Checkmark20Regular, TaskListSquareLtr24Regular } from "@fluentui/react-icons";
import {
  aceptarCita,
  getCitasPendientes,
  rechazarCita,
} from "../../services/citaService";
import ConfirmarTutoriaModal from "./ConfirmarTutoriaModal";
import { DangerButton } from "../../components/ui/DangerButton";
import { EmptyState } from "../../components/ui/EmptyState";
import { Page, PageHeader } from "../../components/ui/Page";
import { formatoSesion } from "../../lib/formato";
import {
  SessionList,
  SessionListSkeleton,
  SessionRow,
} from "../../components/ui/SessionList";

export default function MisTutorias() {
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [rechazandoId, setRechazandoId] = useState(null);
  const [citaARechazar, setCitaARechazar] = useState(null);

  useEffect(() => {
    const cargarCitas = async () => {
      try {
        setCargando(true);
        setError("");

        const data = await getCitasPendientes();
        setCitas(data);
      } catch (err) {
        console.error("Error al cargar citas pendientes:", err);

        setError(
          err.message || "No se pudieron cargar las solicitudes pendientes."
        );
      } finally {
        setCargando(false);
      }
    };

    cargarCitas();
  }, []);

  const removerCita = (id) => {
    setCitas((prev) => prev.filter((cita) => cita.id !== id));
  };

  const handleAceptar = (cita) => {
    setError("");
    setCitaSeleccionada(cita);
  };

  const handleConfirmarAceptacion = async (data) => {
    if (!citaSeleccionada) {
      return;
    }

    try {
      setGuardando(true);
      setError("");

      await aceptarCita(citaSeleccionada.id, data);

      removerCita(citaSeleccionada.id);
      setCitaSeleccionada(null);
    } catch (err) {
      console.error("Error al aceptar la cita:", err);

      setError(
        err.message || "No se pudo aceptar la solicitud."
      );
    } finally {
      setGuardando(false);
    }
  };

  // Antes era window.confirm: ahora la confirmación vive en un diálogo propio.
  const handleRechazar = (cita) => {
    setCitaARechazar(cita);
  };

  const confirmarRechazo = async () => {
    const cita = citaARechazar;
    if (!cita) return;

    try {
      setRechazandoId(cita.id);
      setError("");

      await rechazarCita(cita.id);

      removerCita(cita.id);
    } catch (err) {
      console.error("Error al rechazar la cita:", err);

      setError(
        err.message || "No se pudo rechazar la solicitud."
      );
    } finally {
      setRechazandoId(null);
      setCitaARechazar(null);
    }
  };

  return (
    <>
      <Page>
        <PageHeader
          title="Solicitudes"
          description="Tutorías que los estudiantes te pidieron. Acepta las que puedas atender o recházalas para liberar el horario."
        />

        {error && (
          <MessageBar intent="error" layout="multiline">
            <MessageBarBody>{error}</MessageBarBody>
          </MessageBar>
        )}

        {cargando ? (
          <SessionListSkeleton rows={3} />
        ) : citas.length === 0 ? (
          <EmptyState
            icon={<TaskListSquareLtr24Regular />}
            title="No tienes solicitudes pendientes"
            description="Cuando un estudiante solicite una tutoría, aparecerá aquí."
          />
        ) : (
          <SessionList label="Solicitudes pendientes">
            {citas.map((cita) => {
              const fecha = new Date(cita.fechaHoraInicio);
              const rechazando = rechazandoId === cita.id;
              return (
                <SessionRow
                  key={cita.id}
                  fecha={fecha}
                  title={cita.materiaNombre}
                  meta={`${formatoSesion.format(fecha)} · ${cita.estudianteNombre}`}
                  actions={
                    <>
                      <DangerButton
                        variant="outline"
                        onClick={() => handleRechazar(cita)}
                        disabled={rechazando}
                        aria-label={`Rechazar solicitud de ${cita.estudianteNombre}`}
                      >
                        {rechazando ? "Rechazando…" : "Rechazar"}
                      </DangerButton>
                      <Button
                        appearance="primary"
                        icon={<Checkmark20Regular />}
                        onClick={() => handleAceptar(cita)}
                        disabled={rechazando}
                        aria-label={`Aceptar solicitud de ${cita.estudianteNombre}`}
                      >
                        Aceptar
                      </Button>
                    </>
                  }
                />
              );
            })}
          </SessionList>
        )}
      </Page>

      <ConfirmarTutoriaModal
        cita={citaSeleccionada}
        abierto={Boolean(citaSeleccionada)}
        guardando={guardando}
        onCerrar={() => {
          if (!guardando) {
            setCitaSeleccionada(null);
          }
        }}
        onConfirmar={handleConfirmarAceptacion}
      />

      <Dialog
        open={Boolean(citaARechazar)}
        onOpenChange={(_, data) => {
          if (!data.open && rechazandoId === null) setCitaARechazar(null);
        }}
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle>¿Rechazar esta solicitud?</DialogTitle>
            <DialogContent>
              <Body1>
                {citaARechazar &&
                  `${citaARechazar.estudianteNombre} pidió ${citaARechazar.materiaNombre}. La solicitud quedará marcada como rechazada.`}
              </Body1>
            </DialogContent>
            <DialogActions>
              <Button
                appearance="secondary"
                onClick={() => setCitaARechazar(null)}
                disabled={rechazandoId !== null}
              >
                Volver
              </Button>
              <DangerButton
                onClick={confirmarRechazo}
                disabled={rechazandoId !== null}
                icon={rechazandoId !== null ? <Spinner size="tiny" /> : undefined}
              >
                {rechazandoId !== null ? "Rechazando…" : "Rechazar solicitud"}
              </DangerButton>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  );
}
