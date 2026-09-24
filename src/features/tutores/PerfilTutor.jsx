import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserX, Star, ArrowLeft, Calendar } from "lucide-react";
import { getTutorById } from "../../services/tutorService";

export default function PerfilTutor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTutor = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getTutorById(id);
        setTutor(data);
      } catch (err) {
        if (err.status === 404) {
          setError("El perfil del tutor no fue encontrado o no está disponible.");
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
    console.log(`Agendando con el tutor ${id}`);
    alert(`Agendando con el tutor ${tutor?.nombre}`);
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-granite-50 dark:bg-deep-space-blue-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-deep-space-blue-200 border-t-deep-space-blue-600 dark:border-deep-space-blue-800 dark:border-t-emerald-400 animate-spin"></div>
          <p className="text-deep-space-blue-600 dark:text-emerald-400 font-medium">Cargando...</p>
        </div>
      </main>
    );
  }

  if (error || !tutor) {
    return (
      <main className="min-h-screen bg-granite-50 dark:bg-deep-space-blue-950 py-12 px-6 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-deep-space-blue-900/20 p-8 rounded-3xl border border-granite-200 dark:border-deep-space-blue-800 text-center flex flex-col items-center space-y-4">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 mb-2">
            <UserX className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-semibold text-granite-900 dark:text-white">Perfil no encontrado</h2>
          <p className="text-granite-600 dark:text-deep-space-blue-300">
            {error || "El perfil del tutor no fue encontrado o no está disponible."}
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 flex items-center gap-2 bg-granite-100 dark:bg-deep-space-blue-800 text-granite-700 dark:text-white px-6 py-2.5 rounded-full hover:bg-granite-200 dark:hover:bg-deep-space-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </button>
        </div>
      </main>
    );
  }

  const renderStars = (rating) => {
    if (!rating || rating === 0) {
      return (
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-5 h-5 text-granite-300 dark:text-deep-space-blue-700" />
          ))}
          <span className="ml-2 text-sm text-granite-500 dark:text-deep-space-blue-400">Sin calificación aún</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => {
          const isFilled = i < Math.round(rating);
          return (
            <Star
              key={i}
              className={`w-5 h-5 ${isFilled ? "text-yellow-400 fill-yellow-400" : "text-granite-300 dark:text-deep-space-blue-700"}`}
            />
          );
        })}
        <span className="ml-2 text-sm font-medium text-granite-700 dark:text-white">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  return (
    <main className="min-h-screen bg-granite-50 dark:bg-deep-space-blue-950 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-granite-600 dark:text-deep-space-blue-300 hover:text-deep-space-blue-600 dark:hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>

        <div className="bg-white dark:bg-deep-space-blue-900/20 border border-granite-200 dark:border-deep-space-blue-800 rounded-3xl overflow-hidden">
          <div className="p-8 sm:p-12">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
              {tutor.fotoUrl ? (
                <img
                  src={tutor.fotoUrl}
                  alt={`Foto de ${tutor.nombre}`}
                  className="w-32 h-32 rounded-full object-cover border-4 border-granite-50 dark:border-deep-space-blue-800 shadow-md"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-granite-50 dark:border-deep-space-blue-800 shadow-md bg-deep-space-blue-100 dark:bg-deep-space-blue-800 flex items-center justify-center text-4xl font-semibold text-deep-space-blue-600 dark:text-emerald-400">
                  {getInitial(tutor.nombre)}
                </div>
              )}

              <div className="flex-1 text-center sm:text-left space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-granite-900 dark:text-white mb-2">
                    {tutor.nombre}
                  </h1>
                  {renderStars(tutor.calificacionPromedio)}
                </div>

                <div>
                  <h3 className="text-sm font-medium text-granite-500 dark:text-deep-space-blue-400 uppercase tracking-wider mb-3">
                    Materias que enseña
                  </h3>
                  {tutor.materias && tutor.materias.length > 0 ? (
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                      {tutor.materias.map((materia, index) => (
                        <span
                          key={index}
                          className="px-4 py-1.5 bg-granite-100 dark:bg-deep-space-blue-800 text-granite-800 dark:text-deep-space-blue-200 text-sm font-medium rounded-full"
                        >
                          {materia}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-granite-600 dark:text-deep-space-blue-300">
                      No hay materias registradas.
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-10 pt-8 border-t border-granite-100 dark:border-deep-space-blue-800/50 flex justify-center sm:justify-end">
              <button
                onClick={handleAgendar}
                className="flex items-center gap-2 bg-deep-space-blue-600 hover:bg-deep-space-blue-700 text-white px-8 py-3.5 rounded-full font-medium transition-colors w-full sm:w-auto justify-center shadow-lg shadow-deep-space-blue-600/20 dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:text-deep-space-blue-950 dark:shadow-emerald-500/10"
              >
                <Calendar className="w-5 h-5" />
                Agendar Cita
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
