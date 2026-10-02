import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { agendarCita } from "../../services/citaService";
import { getMaterias } from "../../services/materiaService";
import { getDisponibilidadTutor } from "../../services/tutorService";

const DIAS_SEMANA = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

const FECHA_DIAS_FUTUROS = 90;

const normalizarBloque = (bloque) => ({
  diaSemana: Number(bloque.diaSemana ?? bloque.DiaSemana),
  horaInicio: String(bloque.horaInicio ?? bloque.HoraInicio).slice(0, 5),
  horaFin: String(bloque.horaFin ?? bloque.HoraFin).slice(0, 5),
});

const fechaComoClave = (fecha) =>
  `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;

const crearFechaHoraUtc = (fecha, hora) => `${fecha}T${hora}:00.000Z`;

export default function BookingModal({
  isOpen,
  onClose,
  tutorId,
  materiasDisponibles,
}) {
  const [materiaId, setMateriaId] = useState("");
  const [fecha, setFecha] = useState("");
  const [bloqueSeleccionado, setBloqueSeleccionado] = useState("");
  const [materias, setMaterias] = useState([]);
  const [disponibilidad, setDisponibilidad] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");

  useEffect(() => {
    if (!isOpen) return undefined;

    let activo = true;
    const cargarDatos = async () => {
      try {
        setCargando(true);
        setError("");
        setMensajeExito("");
        setMateriaId("");
        setFecha("");
        setBloqueSeleccionado("");
        setMaterias([]);
        setDisponibilidad([]);

        const [catalogo, bloquesTutor] = await Promise.all([
          getMaterias(),
          getDisponibilidadTutor(tutorId),
        ]);

        if (!activo) return;

        const nombresDisponibles = new Set(
          (materiasDisponibles || []).map((nombre) =>
            nombre.trim().toLowerCase()
          )
        );
        setMaterias(
          (catalogo || []).filter((materia) =>
            nombresDisponibles.has(materia.nombre.trim().toLowerCase())
          )
        );
        setDisponibilidad(
          (Array.isArray(bloquesTutor) ? bloquesTutor : []).map(
            normalizarBloque
          )
        );
      } catch (err) {
        console.error("Error al cargar datos de la reserva:", err);
        if (activo) {
          setError(
            "No se pudieron cargar las materias y horarios del tutor."
          );
        }
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargarDatos();
    return () => {
      activo = false;
    };
  }, [isOpen, tutorId, materiasDisponibles]);

  const opcionesFecha = useMemo(() => {
    const hoy = new Date();
    const opciones = [];

    for (let offset = 0; offset < FECHA_DIAS_FUTUROS; offset += 1) {
      const dia = new Date(
        hoy.getFullYear(),
        hoy.getMonth(),
        hoy.getDate() + offset
      );
      const clave = fechaComoClave(dia);
      const bloquesDelDia = disponibilidad.filter(
        (bloque) => bloque.diaSemana === dia.getDay()
      );
      const tieneHorarioFuturo = bloquesDelDia.some(
        (bloque) =>
          new Date(crearFechaHoraUtc(clave, bloque.horaInicio)) > new Date()
      );

      opciones.push({
        value: clave,
        label: `${DIAS_SEMANA[dia.getDay()]}, ${dia.toLocaleDateString("es-MX", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}`,
        disabled: !tieneHorarioFuturo,
      });
    }
    return opciones;
  }, [disponibilidad]);

  const bloquesDisponibles = useMemo(() => {
    if (!fecha) return [];
    const ahora = new Date();
    const diaSemana = new Date(`${fecha}T12:00:00`).getDay();

    return disponibilidad.filter(
      (bloque) =>
        bloque.diaSemana === diaSemana &&
        new Date(crearFechaHoraUtc(fecha, bloque.horaInicio)) > ahora
    );
  }, [disponibilidad, fecha]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    setError("");
    setMensajeExito("");

    if (!materiaId) {
      setError("Selecciona una materia.");
      return;
    }
    if (!fecha || !bloqueSeleccionado) {
      setError("Selecciona una fecha y un bloque de horario disponible.");
      return;
    }

    const bloque = bloquesDisponibles[Number(bloqueSeleccionado)];
    if (!bloque) {
      setError("El horario seleccionado ya no está disponible.");
      return;
    }

    const fechaHoraInicio = crearFechaHoraUtc(fecha, bloque.horaInicio);
    const fechaHoraFin = crearFechaHoraUtc(fecha, bloque.horaFin);
    if (new Date(fechaHoraInicio) <= new Date()) {
      setError("No puedes agendar una cita en una fecha u hora pasada.");
      return;
    }

    try {
      setSubmitting(true);
      await agendarCita({
        tutorId: Number(tutorId),
        materiaId: Number(materiaId),
        fechaHoraInicio,
        fechaHoraFin,
      });

      setMensajeExito(
        "Tu solicitud de cita quedó en estado Pendiente."
      );
      setMateriaId("");
      setFecha("");
      setBloqueSeleccionado("");
    } catch (err) {
      console.error("Error al agendar la cita:", err);
      setError(
        err.message || "No se pudo agendar la cita. Intenta nuevamente."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

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
          Selecciona una materia y un horario habilitado por el tutor.
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
              onChange={(event) => setMateriaId(event.target.value)}
              disabled={cargando || submitting}
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
              htmlFor="fecha"
              className="mb-2 block text-sm font-medium text-granite-800 dark:text-white"
            >
              Fecha
            </label>
            <select
              id="fecha"
              value={fecha}
              onChange={(event) => {
                setFecha(event.target.value);
                setBloqueSeleccionado("");
              }}
              disabled={cargando || submitting || disponibilidad.length === 0}
              className="w-full rounded-md border border-granite-300 bg-white px-3 py-2.5 text-granite-900 outline-none focus:border-deep-space-blue-500 dark:border-deep-space-blue-700 dark:bg-deep-space-blue-900 dark:text-white"
            >
              <option value="">Selecciona una fecha</option>
              {opcionesFecha.map((opcion) => (
                <option
                  key={opcion.value}
                  value={opcion.value}
                  disabled={opcion.disabled}
                >
                  {opcion.label}
                  {opcion.disabled ? " (sin horarios)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="bloque"
              className="mb-2 block text-sm font-medium text-granite-800 dark:text-white"
            >
              Horario disponible
            </label>
            <select
              id="bloque"
              value={bloqueSeleccionado}
              onChange={(event) => setBloqueSeleccionado(event.target.value)}
              disabled={cargando || submitting || !fecha}
              className="w-full rounded-md border border-granite-300 bg-white px-3 py-2.5 text-granite-900 outline-none focus:border-deep-space-blue-500 dark:border-deep-space-blue-700 dark:bg-deep-space-blue-900 dark:text-white"
            >
              <option value="">Selecciona un bloque</option>
              {bloquesDisponibles.map((bloque, indice) => (
                <option key={`${bloque.horaInicio}-${indice}`} value={indice}>
                  {bloque.horaInicio} – {bloque.horaFin}
                </option>
              ))}
            </select>
          </div>

          {cargando && (
            <p role="status" className="text-sm text-granite-500 dark:text-deep-space-blue-300">
              Cargando horarios...
            </p>
          )}
          {!cargando && disponibilidad.length === 0 && (
            <p className="text-sm text-granite-600 dark:text-deep-space-blue-300">
              Este tutor aún no tiene horarios disponibles para reservar.
            </p>
          )}
          {error && (
            <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          {mensajeExito && (
            <p role="status" className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
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
              Cerrar
            </button>
            <button
              type="submit"
              disabled={cargando || submitting || disponibilidad.length === 0}
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
