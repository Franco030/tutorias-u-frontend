import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTutoresRecomendados } from "../../services/tutorService";
import TutorCard from "../../components/TutorCard";

export default function Home() {
  const navigate = useNavigate();
  const [tutores, setTutores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchTutoresRecomendados = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getTutoresRecomendados();

        if (isMounted) {
          setTutores(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Error al cargar tutores recomendados:", err);
        if (isMounted) {
          setError("No se pudieron cargar tus recomendaciones. Intenta nuevamente.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTutoresRecomendados();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="space-y-6" aria-labelledby="tutores-recomendados-title">
      <div>
        <h2
          id="tutores-recomendados-title"
          className="text-xl font-medium text-granite-900 dark:text-white"
        >
          Tutores Recomendados para Ti
        </h2>
        <p className="mt-1 text-sm text-granite-500 dark:text-deep-space-blue-300">
          Opciones seleccionadas según tus materias de interés.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-granite-200 bg-white py-12 dark:border-deep-space-blue-800 dark:bg-deep-space-blue-900/20">
          <div
            className="h-10 w-10 animate-spin rounded-full border-4 border-deep-space-blue-200 border-t-deep-space-blue-600 dark:border-deep-space-blue-800 dark:border-t-emerald-400"
            role="status"
            aria-label="Cargando tutores recomendados"
          />
          <p className="text-sm text-granite-500 dark:text-deep-space-blue-300">
            Buscando tutores para ti...
          </p>
        </div>
      ) : error ? (
        <div
          role="alert"
          className="rounded-3xl border border-red-500/40 bg-red-500/10 p-6 text-center text-red-600 dark:text-red-400"
        >
          {error}
        </div>
      ) : tutores.length === 0 ? (
        <div className="rounded-3xl border border-granite-200 bg-white p-10 text-center dark:border-deep-space-blue-800 dark:bg-deep-space-blue-900/20">
          <p className="text-granite-500 dark:text-deep-space-blue-300">
            Aún no tenemos recomendaciones para ti. Registra tus intereses para encontrar tutores afines.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tutores.map((tutor) => (
            <TutorCard
              key={tutor.id}
              tutor={tutor}
              onClick={() => navigate(`/tutor/${tutor.id}`)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
