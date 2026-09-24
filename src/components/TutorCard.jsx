import { Star } from "lucide-react";

function getInitial(name) {
  return name ? name.charAt(0).toUpperCase() : "?";
}

export default function TutorCard({ tutor, onClick }) {
  const rating = Number(tutor.calificacionPromedio);
  const hasRating = Number.isFinite(rating) && rating > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-col overflow-hidden rounded-3xl border border-granite-200 bg-white p-6 text-left transition-all duration-300 hover:border-deep-space-blue-400 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-deep-space-blue-500 focus:ring-offset-2 dark:border-deep-space-blue-800 dark:bg-deep-space-blue-900/20 dark:hover:border-emerald-500 dark:focus:ring-emerald-400 dark:focus:ring-offset-deep-space-blue-950"
      aria-label={`Ver perfil de ${tutor.nombre}`}
    >
      <div className="mb-4 flex items-center gap-4">
        {tutor.fotoUrl ? (
          <img
            src={tutor.fotoUrl}
            alt={`Foto de ${tutor.nombre}`}
            className="h-16 w-16 rounded-full border-2 border-granite-50 object-cover dark:border-deep-space-blue-800"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-granite-50 bg-deep-space-blue-50 text-xl font-medium text-deep-space-blue-600 dark:border-deep-space-blue-800 dark:bg-deep-space-blue-800/50 dark:text-emerald-400"
          >
            {getInitial(tutor.nombre)}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-granite-900 dark:text-white">
            {tutor.nombre}
          </h3>
          <div className="mt-1 flex items-center gap-1" aria-label={hasRating ? `Calificación ${rating.toFixed(1)} de 5` : "Sin calificación"}>
            <Star
              className={`h-4 w-4 ${hasRating ? "fill-yellow-400 text-yellow-400" : "text-granite-300 dark:text-deep-space-blue-700"}`}
            />
            <span className="text-sm text-granite-600 dark:text-deep-space-blue-300">
              {hasRating ? rating.toFixed(1) : "Sin calificación"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(tutor.materias || []).slice(0, 3).map((materia) => (
          <span
            key={materia}
            className="rounded-full border border-granite-200 bg-granite-100 px-2 py-1 text-xs text-granite-700 dark:border-deep-space-blue-700/50 dark:bg-deep-space-blue-800/50 dark:text-deep-space-blue-200"
          >
            {materia}
          </span>
        ))}
        {(tutor.materias || []).length > 3 && (
          <span className="rounded-full border border-granite-200 bg-granite-50 px-2 py-1 text-xs text-granite-500 dark:border-deep-space-blue-800 dark:bg-deep-space-blue-900/50 dark:text-deep-space-blue-400">
            +{tutor.materias.length - 3} más
          </span>
        )}
      </div>
    </button>
  );
}
