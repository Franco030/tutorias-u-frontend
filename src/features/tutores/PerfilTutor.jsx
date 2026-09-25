import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getTutorById } from "../../services/tutorService";
import BookingModal from "./BookingModal";

export default function PerfilTutor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    const fetchTutor = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getTutorById(id);
        setTutor(data);
      } catch (err) {
        if (err.status === 404) {
          setError(
            "El perfil del tutor no fue encontrado o no está disponible."
          );
        } else {
          setError("Ocurrió un error al cargar el perfil del tutor.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTutor();
  }, [id]);

  const handleAgendar = () => {
    setBookingOpen(true);
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-granite-50 dark:bg-deep-space-blue-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-deep-space-blue-200 border-t-deep-space-blue-600 dark:border-deep-space-blue-800 dark:border-t-emerald-400 animate-spin"></div>

          <p className="text-deep-space-blue-600 dark:text-emerald-400 font-medium">
            Cargando...
          </p>
        </div>
      </main>
    );
  }

  if (error || !tutor) {
    return (
      <main className="min-h-screen bg-granite-50 dark:bg-deep-space-blue-950 py-10 px-6 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-deep-space-blue-900/40 p-8 rounded-lg border border-granite-200 dark:border-deep-space-blue-800 text-center flex flex-col items-center space-y-4">
          <h2 className="text-xl font-semibold text-granite-900 dark:text-white">
            Perfil no encontrado
          </h2>

          <p className="text-granite-600 dark:text-deep-space-blue-300">
            {error ||
              "El perfil del tutor no fue encontrado o no está disponible."}
          </p>

          <button
            onClick={() => navigate("/")}
            className="mt-6 flex items-center gap-2 bg-granite-100 dark:bg-deep-space-blue-800 text-granite-700 dark:text-white px-6 py-2.5 rounded-md hover:bg-granite-200 dark:hover:bg-deep-space-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </button>
        </div>
      </main>
    );
  }

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  return (
    <>
      <main className="min-h-screen bg-granite-50 dark:bg-deep-space-blue-950 py-10 px-6">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-granite-600 dark:text-deep-space-blue-300 hover:text-deep-space-blue-600 dark:hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>

          <div className="bg-white dark:bg-deep-space-blue-900/40 border border-granite-200 dark:border-deep-space-blue-800 rounded-lg overflow-hidden">
            <div className="p-8 sm:p-12">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
                {tutor.fotoUrl ? (
                  <img
                    src={tutor.fotoUrl}
                    alt={`Foto de ${tutor.nombre}`}
                    className="w-32 h-32 rounded-full object-cover border-4 border-granite-50 dark:border-deep-space-blue-800"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-granite-50 dark:border-deep-space-blue-800 bg-deep-space-blue-100 dark:bg-deep-space-blue-800 flex items-center justify-center text-4xl font-semibold text-deep-space-blue-600 dark:text-emerald-400">
                    {getInitial(tutor.nombre)}
                  </div>
                )}

                <div className="flex-1 text-center sm:text-left space-y-4 w-full">
                  <div>
                    <h1 className="text-3xl font-semibold text-granite-900 dark:text-white mb-4">
                      {tutor.nombre}
                    </h1>
                  </div>

                  <div>
                    <h3 className="text-xs font-medium text-granite-500 dark:text-deep-space-blue-400 uppercase tracking-wider mb-3 border-b border-granite-100 dark:border-deep-space-blue-800/50 pb-2">
                      Materias que enseña
                    </h3>

                    {tutor.materias && tutor.materias.length > 0 ? (
                      <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                        {tutor.materias.map((materia, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-granite-50 dark:bg-deep-space-blue-900/50 text-granite-700 dark:text-deep-space-blue-200 text-xs rounded-md border border-granite-200 dark:border-deep-space-blue-800"
                          >
                            {materia}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-granite-600 dark:text-deep-space-blue-300 text-sm">
                        No hay materias registradas.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-granite-100 dark:border-deep-space-blue-800/50 flex justify-center sm:justify-end">
                <button
                  type="button"
                  onClick={handleAgendar}
                  className="bg-deep-space-blue-600 hover:bg-deep-space-blue-700 text-white px-8 py-3 rounded-md font-medium transition-colors w-full sm:w-auto text-center dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:text-deep-space-blue-950"
                >
                  Agendar Cita
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        tutorId={id}
        materiasDisponibles={tutor.materias || []}
      />
    </>
  );
}