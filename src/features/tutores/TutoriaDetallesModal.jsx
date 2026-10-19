
import { useState } from "react";
import { CalendarDays, Clock3, BookOpen, UserRound, Video, FileText, X } from "lucide-react";
import { cancelarCita } from "../../services/citaService";

export default function TutoriaDetallesModal({
  isOpen,
  onClose,
  tutoria,
  onCancelled,
}) {
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-detalles-tutoria"
        className="relative w-full max-w-lg rounded-xl border border-granite-200 bg-white p-6 shadow-xl dark:border-deep-space-blue-800 dark:bg-deep-space-blue-950 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Cerrar detalles"
          className="absolute right-5 top-5 cursor-pointer text-granite-500 transition-colors hover:text-granite-900 dark:text-deep-space-blue-300 dark:hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <h2
          id="titulo-detalles-tutoria"
          className="pr-8 text-2xl font-semibold text-granite-900 dark:text-white"
        >
          Detalles de la tutoría
        </h2>

        <p className="mt-2 text-sm text-granite-600 dark:text-deep-space-blue-300">
          Información de tu sesión.
        </p>

        <div className="mt-7 space-y-5">
          <div className="flex items-start gap-3">
            <BookOpen className="mt-0.5 h-5 w-5 text-deep-space-blue-600 dark:text-emerald-400" />
            <div>
              <p className="text-xs text-granite-500 dark:text-deep-space-blue-300">
                Materia
              </p>
              <p className="font-medium text-granite-900 dark:text-white">
                {tutoria.materia}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <UserRound className="mt-0.5 h-5 w-5 text-deep-space-blue-600 dark:text-emerald-400" />
            <div>
              <p className="text-xs text-granite-500 dark:text-deep-space-blue-300">
                Tutor o estudiante
              </p>
              <p className="font-medium text-granite-900 dark:text-white">
                {tutoria.rolOpuestoNombre}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CalendarDays className="mt-0.5 h-5 w-5 text-deep-space-blue-600 dark:text-emerald-400" />
            <div>
              <p className="text-xs text-granite-500 dark:text-deep-space-blue-300">
                Fecha
              </p>
              <p className="font-medium text-granite-900 dark:text-white">
                {fechaFormateada}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock3 className="mt-0.5 h-5 w-5 text-deep-space-blue-600 dark:text-emerald-400" />
            <div>
              <p className="text-xs text-granite-500 dark:text-deep-space-blue-300">
                Hora
              </p>
              <p className="font-medium text-granite-900 dark:text-white">
                {horaFormateada}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Video className="mt-0.5 h-5 w-5 text-deep-space-blue-600 dark:text-emerald-400" />
            <div className="min-w-0">
              <p className="text-xs text-granite-500 dark:text-deep-space-blue-300">
                Enlace de reunión
              </p>

              {tutoria.linkReunion ? (
                <a
                  href={tutoria.linkReunion}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all font-medium text-deep-space-blue-600 underline hover:text-deep-space-blue-800 dark:text-emerald-400 dark:hover:text-emerald-300"
                >
                  Unirse a la videollamada
                </a>
              ) : (
                <p className="text-sm text-granite-500 dark:text-deep-space-blue-300">
                  Enlace no disponible
                </p>
              )}
            </div>
          </div>

          {tutoria.notas && (
            <div className="flex items-start gap-3">
              <FileText className="mt-0.5 h-5 w-5 text-deep-space-blue-600 dark:text-emerald-400" />
              <div>
                <p className="text-xs text-granite-500 dark:text-deep-space-blue-300">
                  Notas
                </p>
                <p className="whitespace-pre-wrap break-words text-sm text-granite-800 dark:text-deep-space-blue-100">
                  {tutoria.notas}
                </p>
              </div>
            </div>
          )}
        </div>

        {puedeCancelar && (
          <div className="mt-8 border-t border-granite-200 pt-5 dark:border-deep-space-blue-800">
            {confirmandoCancelacion ? (
              <div className="space-y-3">
                <label
                  htmlFor="motivo-cancelacion"
                  className="block text-sm font-medium text-granite-800 dark:text-white"
                >
                  Motivo (opcional)
                </label>
                <textarea
                  id="motivo-cancelacion"
                  value={motivo}
                  onChange={(event) => setMotivo(event.target.value)}
                  maxLength={1000}
                  rows={3}
                  disabled={cancelando}
                  className="w-full rounded-md border border-granite-300 bg-white px-3 py-2 text-sm text-granite-900 outline-none focus:border-red-500 dark:border-deep-space-blue-700 dark:bg-deep-space-blue-900 dark:text-white"
                />
                <p className="text-sm text-granite-600 dark:text-deep-space-blue-300">
                  ¿Confirmas que deseas cancelar esta tutoría?
                </p>
                {errorCancelacion && (
                  <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
                    {errorCancelacion}
                  </p>
                )}
                <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmandoCancelacion(false);
                      setMotivo("");
                      setErrorCancelacion("");
                    }}
                    disabled={cancelando}
                    className="rounded-md border border-granite-300 px-5 py-2.5 font-medium text-granite-700 transition-colors hover:bg-granite-100 disabled:opacity-50 dark:border-deep-space-blue-700 dark:text-white dark:hover:bg-deep-space-blue-900"
                  >
                    Volver
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelar}
                    disabled={cancelando}
                    className="rounded-md bg-red-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {cancelando ? "Cancelando..." : "Confirmar cancelación"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col-reverse justify-between gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setConfirmandoCancelacion(true)}
                  className="rounded-md bg-red-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-red-700"
                >
                  Cancelar tutoría
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-md bg-deep-space-blue-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-deep-space-blue-700 dark:bg-emerald-500 dark:text-deep-space-blue-950 dark:hover:bg-emerald-600"
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        )}

        {!puedeCancelar && (
        <div className="mt-8 flex justify-end border-t border-granite-200 pt-5 dark:border-deep-space-blue-800">
          <button
            type="button"
            onClick={handleClose}
            className="cursor-pointer rounded-md bg-deep-space-blue-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-deep-space-blue-700 dark:bg-emerald-500 dark:text-deep-space-blue-950 dark:hover:bg-emerald-600"
          >
            Cerrar
          </button>
        </div>
        )}
      </div>
    </div>
  );
}
