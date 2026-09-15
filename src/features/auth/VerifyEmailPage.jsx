import { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import authService from './authService';

export function VerifyEmailPage() {
  const queryParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const token = queryParams.get('token');

  const [status, setStatus] = useState(token ? 'loading' : 'error');
  const [message, setMessage] = useState(
    token ? 'Verificando tu correo electrónico...' : 'No se encontró el token de verificación en la URL.'
  );

  useEffect(() => {
    if (!token) return;

    const verifyToken = async () => {
      try {
        await authService.verifyEmail(token);
        setStatus('success');
        setMessage('Correo verificado exitosamente.');
      } catch (err) {
        setStatus('error');
        setMessage(err?.message || 'Ocurrió un error al verificar el correo.');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-granite-50 dark:bg-deep-space-blue-950 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-deep-space-blue-900/40 rounded-2xl border border-granite-200 dark:border-deep-space-blue-800 p-8 text-center shadow-sm backdrop-blur-sm">
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-deep-space-blue-500 animate-spin mb-4" />
            <h2 className="text-xl font-semibold text-granite-900 dark:text-white">Verificando...</h2>
            <p className="text-sm text-granite-500 dark:text-deep-space-blue-200 mt-2">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-500 flex items-center justify-center mb-4 border border-emerald-100 dark:border-emerald-800">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-semibold text-granite-900 dark:text-white">¡Verificación Exitosa!</h2>
            <p className="text-sm text-granite-500 dark:text-deep-space-blue-200 mt-2 mb-6">{message}</p>
            
            <div className="w-full p-4 bg-granite-50 dark:bg-deep-space-blue-950/50 rounded-xl border border-granite-100 dark:border-deep-space-blue-800/50">
              <p className="text-sm font-medium text-granite-700 dark:text-deep-space-blue-100">
                Ya puedes cerrar esta pestaña de forma segura y volver a la ventana original de TutoriasU.
              </p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-burgundy-50 dark:bg-burgundy-900/40 text-burgundy-500 flex items-center justify-center mb-4 border border-burgundy-100 dark:border-burgundy-800">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-semibold text-granite-900 dark:text-white">Error de Verificación</h2>
            <p className="text-sm text-granite-500 dark:text-deep-space-blue-200 mt-2 mb-6">{message}</p>
            
            <div className="w-full p-4 bg-granite-50 dark:bg-deep-space-blue-950/50 rounded-xl border border-granite-100 dark:border-deep-space-blue-800/50">
              <p className="text-sm font-medium text-granite-700 dark:text-deep-space-blue-100">
                Por favor, cierra esta pestaña y vuelve a intentar el proceso desde la aplicación.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyEmailPage;
