import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { agendarCita } from "../../services/citaService";
import { getMaterias } from "../../services/materiaService";

export default function BookingModal({
  isOpen,
  onClose,
  tutorId,
  materiasDisponibles,
}) {
  const [materiaId, setMateriaId] = useState("");
  const [fechaHoraInicio, setFechaHoraInicio] = useState("");
  const [materias, setMaterias] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const cargarMaterias = async () => {
      try {
        setError("");

        const catalogo = await getMaterias();

        const nombresDisponibles = new Set(
          (materiasDisponibles || []).map((nombre) =>
            nombre.trim().toLowerCase()
          )
        );

        const materiasDelTutor = catalogo.filter((materia) =>
          nombresDisponibles.has(materia.nombre.trim().toLowerCase())
        );

        setMaterias(materiasDelTutor);
      } catch (err) {
        console.error("Error al cargar materias:", err);
        setError("No se pudieron cargar las materias del tutor.");
      }
    };

    cargarMaterias();
  }, [isOpen, materiasDisponibles]);

  const obtenerFechaMinima = () => {
    const ahora = new Date();
    const offset = ahora.getTimezoneOffset() * 60000;

    return new Date(ahora.getTime() - offset)
      .toISOString()
      .slice(0, 16);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) {
      return;
    }

    setError("");
    setMensajeExito("");

    if (!materiaId) {
      setError("Selecciona una materia.");
      return;
    }

    if (!fechaHoraInicio) {
      setError("Selecciona una fecha y hora.");
      return;
    }

    const fechaSeleccionada = new Date(fechaHoraInicio);

    if (fechaSeleccionada <= new Date()) {
      setError("No puedes agendar una cita en una fecha u hora pasada.");
      return;
    }

    try {
      setSubmitting(true);

      await agendarCita({
        tutorId: Number(tutorId),
        materiaId: Number(materiaId),
        fechaHoraInicio: fechaSeleccionada.toISOString(),
      });

      setMensajeExito("Cita agendada exitosamente.");

      setMateriaId("");
      setFechaHoraInicio("");

      setTimeout(() => {
        setMensajeExito("");
        onClose();
      }, 1200);
    } catch (err) {
      console.error("Error al agendar la cita:", err);

      setError(
        err.message || "No se pudo agendar la cita. Intenta nuevamente."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="relative w-full max-w-lg rounded-lg border border-granite-200 bg-white p-6 shadow-xl dark:border-deep-space-blue-800 dark:bg-deep-space-blue-950">
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="absolute right-4 top-4 text-granite-500 transition-colors hover:text-granite-900 disabled:cursor-not-allowed disabled:opacity-50 dark:text-deep-space-blue-300 dark:hover:text-white"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-2xl font-semibold text-granite-900 dark:text-white">
          Agendar cita
        </h2>

        <p className="mt-2 text-sm text-granite-600 dark:text-deep-space-blue-300">
          Selecciona la materia, fecha y hora para tu tutoría.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="materia"
              className="mb-2 block text-sm font-medium text-granite-800 dark:text-white"
            >
              Materia
            </label>

            <select
              id="materia"
              value={materiaId}
              onChange={(e) => setMateriaId(e.target.value)}
              disabled={submitting}
              className="w-full rounded-md border border-granite-300 bg-white px-3 py-2.5 text-granite-900 outline-none focus:border-deep-space-blue-500 dark:border-deep-space-blue-700 dark:bg-deep-space-blue-900 dark:text-white"
            >
              <option value="">Selecciona una materia</option>

              {materias.map((materia) => (
                <option key={materia.id} value={materia.id}>
                  {materia.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="fechaHoraInicio"
              className="mb-2 block text-sm font-medium text-granite-800 dark:text-white"
            >
              Fecha y hora
            </label>

            <input
              id="fechaHoraInicio"
              type="datetime-local"
              min={obtenerFechaMinima()}
              value={fechaHoraInicio}
              onChange={(e) => setFechaHoraInicio(e.target.value)}
              disabled={submitting}
              className="w-full rounded-md border border-granite-300 bg-white px-3 py-2.5 text-granite-900 outline-none focus:border-deep-space-blue-500 dark:border-deep-space-blue-700 dark:bg-deep-space-blue-900 dark:text-white"
            />
          </div>

          {error && (
            <p className="text-sm font-medium text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          {mensajeExito && (
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              {mensajeExito}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-md border border-granite-300 px-5 py-2.5 font-medium text-granite-700 transition-colors hover:bg-granite-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-deep-space-blue-700 dark:text-white dark:hover:bg-deep-space-blue-900"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-deep-space-blue-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-deep-space-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-500 dark:text-deep-space-blue-950 dark:hover:bg-emerald-600"
            >
              {submitting ? "Agendando..." : "Confirmar cita"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}