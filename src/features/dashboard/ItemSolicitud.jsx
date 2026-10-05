import { BookOpen, CalendarDays, UserRound } from "lucide-react";

const formatoFecha = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default function ItemSolicitud({ solicitud }) {
  const fecha = new Date(solicitud.fechaHoraInicio);
  const fechaLegible = Number.isNaN(fecha.getTime())
    ? "Fecha no disponible"
    : formatoFecha.format(fecha);

  return (
    <article className="grid gap-4 rounded-lg border border-granite-200 bg-white p-5 dark:border-deep-space-blue-800 dark:bg-deep-space-blue-900/40 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex min-w-0 items-start gap-3">
          <UserRound aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-deep-space-blue-600 dark:text-emerald-400" />
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase text-granite-500 dark:text-deep-space-blue-300">Estudiante</p>
            <p className="break-words text-sm font-medium text-granite-900 dark:text-white">
              {solicitud.alumnoNombre || "Nombre no disponible"}
            </p>
          </div>
        </div>

        <div className="flex min-w-0 items-start gap-3">
          <BookOpen aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-deep-space-blue-600 dark:text-emerald-400" />
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase text-granite-500 dark:text-deep-space-blue-300">Materia</p>
            <p className="break-words text-sm font-medium text-granite-900 dark:text-white">
              {solicitud.materiaNombre || "Materia no disponible"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3 border-t border-granite-100 pt-3 dark:border-deep-space-blue-800 sm:border-0 sm:pt-0">
        <CalendarDays aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-deep-space-blue-600 dark:text-emerald-400" />
        <div>
          <p className="text-xs font-medium uppercase text-granite-500 dark:text-deep-space-blue-300">Fecha propuesta</p>
          <time dateTime={Number.isNaN(fecha.getTime()) ? undefined : fecha.toISOString()} className="text-sm font-medium text-granite-900 dark:text-white">
            {fechaLegible}
          </time>
        </div>
      </div>
    </article>
  );
}