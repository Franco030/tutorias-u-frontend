import { useEffect, useState } from "react";

export default function ConfirmarTutoriaModal({
  cita,
  abierto,
  onCerrar,
  onConfirmar,
  guardando,
}) {
  const [linkReunion, setLinkReunion] = useState("");
  const [notas, setNotas] = useState("");

  useEffect(() => {
    if (abierto) {
      setLinkReunion("");
      setNotas("");
    }
  }, [abierto, cita]);

  if (!abierto || !cita) {
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    onConfirmar({
      linkReunion: linkReunion.trim() || null,
      notas: notas.trim() || null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Cerrar modal"
        onClick={onCerrar}
        disabled={guardando}
        className="absolute inset-0 bg-deep-space-blue-950/60 backdrop-blur-sm"
      />

      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-granite-200 bg-white p-6 shadow-xl dark:border-deep-space-blue-800 dark:bg-deep-space-blue-950">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-deep-space-blue-500 dark:text-emerald-400">
            Confirmar tutoría
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-granite-900 dark:text-white">
            Aceptar solicitud
          </h2>

          <p className="mt-2 text-sm text-granite-500 dark:text-deep-space-blue-300">
            Puedes agregar un enlace de reunión y notas para el estudiante.
          </p>
        </div>

        <div className="mb-6 rounded-xl border border-granite-200 bg-granite-50 p-4 dark:border-deep-space-blue-800 dark:bg-deep-space-blue-900/40">
          <p className="font-medium text-granite-900 dark:text-white">
            {cita.materiaNombre}
          </p>

          <p className="mt-1 text-sm text-granite-500 dark:text-deep-space-blue-300">
            Estudiante: {cita.estudianteNombre}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="linkReunion"
              className="mb-2 block text-sm font-medium text-granite-700 dark:text-deep-space-blue-200"
            >
              Enlace de reunión
            </label>

            <input
              id="linkReunion"
              type="url"
              value={linkReunion}
              onChange={(e) => setLinkReunion(e.target.value)}
              placeholder="https://meet.google.com/..."
              disabled={guardando}
              className="
                w-full
                rounded-xl
                border
                border-granite-200
                bg-white
                px-4
                py-3
                text-sm
                text-granite-900
                outline-none
                transition
                placeholder:text-granite-400
                focus:border-deep-space-blue-500
                dark:border-deep-space-blue-800
                dark:bg-deep-space-blue-900/40
                dark:text-white
                dark:focus:border-emerald-500
              "
            />
          </div>

          <div>
            <label
              htmlFor="notas"
              className="mb-2 block text-sm font-medium text-granite-700 dark:text-deep-space-blue-200"
            >
              Notas
            </label>

            <textarea
              id="notas"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Información adicional para la sesión..."
              rows={4}
              disabled={guardando}
              className="
                w-full
                resize-none
                rounded-xl
                border
                border-granite-200
                bg-white
                px-4
                py-3
                text-sm
                text-granite-900
                outline-none
                transition
                placeholder:text-granite-400
                focus:border-deep-space-blue-500
                dark:border-deep-space-blue-800
                dark:bg-deep-space-blue-900/40
                dark:text-white
                dark:focus:border-emerald-500
              "
            />
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCerrar}
              disabled={guardando}
              className="
                rounded-full
                border
                border-granite-200
                px-6
                py-2.5
                text-sm
                font-medium
                text-granite-600
                transition
                hover:bg-granite-50
                disabled:opacity-50
                dark:border-deep-space-blue-800
                dark:text-deep-space-blue-300
                dark:hover:bg-deep-space-blue-900/50
              "
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={guardando}
              className="
                rounded-full
                bg-deep-space-blue-600
                px-6
                py-2.5
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-deep-space-blue-700
                disabled:cursor-not-allowed
                disabled:opacity-50
                dark:bg-emerald-500
                dark:text-deep-space-blue-950
              "
            >
              {guardando ? "Aceptando..." : "Confirmar tutoría"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}