
import { CalendarDays, Clock3, BookOpen, UserRound, Video, FileText, X } from "lucide-react";

export default function TutoriaDetallesModal({
  isOpen,
  onClose,
  tutoria,
}) {
  if (!isOpen || !tutoria) {
    return null;
  }

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6"
      onClick={onClose}
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
          onClick={onClose}
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
          Información de tu próxima sesión.
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

        <div className="mt-8 flex justify-end border-t border-granite-200 pt-5 dark:border-deep-space-blue-800">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-md bg-deep-space-blue-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-deep-space-blue-700 dark:bg-emerald-500 dark:text-deep-space-blue-950 dark:hover:bg-emerald-600"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
