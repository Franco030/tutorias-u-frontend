import { useEffect, useState } from 'react';
import { Check, LoaderCircle, RefreshCw, UserRound } from 'lucide-react';
import { motion } from 'framer-motion';
import { Navbar } from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import {
  aprobarTutor,
  getSolicitudesPendientes,
} from '../../services/adminService';

function getErrorMessage(error) {
  if (error?.status === 403) {
    return 'No tienes permisos para consultar las solicitudes de tutores.';
  }

  return error?.message || 'No fue posible cargar las solicitudes.';
}

export default function AprobacionTutores() {
  const { user } = useAuth();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const cargarSolicitudes = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getSolicitudesPendientes();
      setSolicitudes(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const cargarSolicitudesIniciales = async () => {
      try {
        const data = await getSolicitudesPendientes();
        if (isMounted) {
          setSolicitudes(Array.isArray(data) ? data : []);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(getErrorMessage(requestError));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void cargarSolicitudesIniciales();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAprobar = async (id) => {
    setApprovingId(id);
    setError(null);
    setFeedback(null);

    try {
      await aprobarTutor(id);
      setSolicitudes((current) => current.filter((solicitud) => solicitud.id !== id));
      setFeedback('Tutor aprobado correctamente.');
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-granite-50 text-granite-900 dark:bg-deep-space-blue-950 dark:text-white">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <motion.header
          className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-burgundy-600 dark:text-emerald-400">
              Administración
            </p>
            <h1 className="text-3xl font-light tracking-tight sm:text-4xl">
              Aprobación de tutores
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-granite-500 dark:text-deep-space-blue-300">
              Revisa las solicitudes pendientes antes de habilitar a un tutor para enseñar.
            </p>
          </div>
          <p className="text-sm text-granite-500 dark:text-deep-space-blue-300">
            Sesión: <span className="font-medium text-granite-800 dark:text-white">{user?.nombre}</span>
          </p>
        </motion.header>

        {feedback && (
          <div
            role="status"
            className="mb-6 flex items-center gap-3 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
          >
            <Check size={18} aria-hidden="true" />
            {feedback}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-6 flex flex-col gap-3 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300 sm:flex-row sm:items-center sm:justify-between"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={cargarSolicitudes}
              className="inline-flex w-fit items-center gap-2 border border-current px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-opacity hover:opacity-75"
            >
              <RefreshCw size={14} aria-hidden="true" />
              Reintentar
            </button>
          </div>
        )}

        <section className="overflow-hidden border border-granite-200 bg-white shadow-sm dark:border-deep-space-blue-800 dark:bg-deep-space-blue-900/40">
          <div className="border-b border-granite-200 px-5 py-4 dark:border-deep-space-blue-800 sm:px-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-granite-700 dark:text-deep-space-blue-100">
              Solicitudes pendientes
            </h2>
          </div>

          {loading ? (
            <div className="flex min-h-56 flex-col items-center justify-center gap-3 px-6 py-12 text-sm text-granite-500 dark:text-deep-space-blue-300">
              <LoaderCircle className="animate-spin" size={24} aria-hidden="true" />
              Cargando solicitudes...
            </div>
          ) : solicitudes.length === 0 ? (
            <div className="flex min-h-56 flex-col items-center justify-center gap-3 px-6 py-12 text-center text-sm text-granite-500 dark:text-deep-space-blue-300">
              <UserRound size={28} aria-hidden="true" />
              <p>No hay solicitudes pendientes por revisar.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[38rem] text-left text-sm">
                <thead className="bg-granite-50 text-xs uppercase tracking-wider text-granite-500 dark:bg-deep-space-blue-950/60 dark:text-deep-space-blue-300">
                  <tr>
                    <th className="px-5 py-4 font-semibold sm:px-6">Tutor</th>
                    <th className="px-5 py-4 font-semibold sm:px-6">Correo</th>
                    <th className="px-5 py-4 text-right font-semibold sm:px-6">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-granite-100 dark:divide-deep-space-blue-800">
                  {solicitudes.map((solicitud) => (
                    <tr key={solicitud.id} className="transition-colors hover:bg-granite-50/70 dark:hover:bg-deep-space-blue-900/70">
                      <td className="px-5 py-5 font-medium sm:px-6">{solicitud.nombre}</td>
                      <td className="px-5 py-5 text-granite-600 dark:text-deep-space-blue-300 sm:px-6">{solicitud.correo}</td>
                      <td className="px-5 py-5 text-right sm:px-6">
                        <button
                          type="button"
                          onClick={() => handleAprobar(solicitud.id)}
                          disabled={approvingId !== null}
                          className="inline-flex items-center gap-2 bg-burgundy-700 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-burgundy-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-emerald-600 dark:text-deep-space-blue-950 dark:hover:bg-emerald-500"
                        >
                          {approvingId === solicitud.id ? (
                            <LoaderCircle className="animate-spin" size={15} aria-hidden="true" />
                          ) : (
                            <Check size={15} aria-hidden="true" />
                          )}
                          {approvingId === solicitud.id ? 'Aprobando...' : 'Aprobar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
