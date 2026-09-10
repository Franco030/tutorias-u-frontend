import { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import authService from './authService';

export function VerifyEmailPage() {
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('Verificando tu correo electrónico...');

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('No se encontró el token de verificación en la URL.');
      return;
    }

    const verifyToken = async () => {
      try {
        await authService.verifyEmail(token);
        setStatus('success');
        setMessage('Correo verificado exitosamente. Ya puedes iniciar sesión.');
      } catch (err) {
        setStatus('error');
        setMessage(err?.message || 'Ocurrió un error al verificar el correo.');
      }
    };

    verifyToken();
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-granite-50 dark:bg-granite-950">
      <div className="w-full max-w-md bg-white dark:bg-granite-900 rounded-2xl border border-granite-200 dark:border-granite-800 p-8 text-center shadow-sm">
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-deep-space-blue-500 animate-spin mb-4" />
            <h2 className="text-xl font-semibold text-granite-900 dark:text-white">Verificando...</h2>
            <p className="text-sm text-granite-500 mt-2">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-500 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-semibold text-granite-900 dark:text-white">¡Verificación Exitosa!</h2>
            <p className="text-sm text-granite-500 mt-2">{message}</p>
            <a
              href="/"
              className="mt-6 inline-flex items-center justify-center w-full px-4 py-2 bg-deep-space-blue-600 hover:bg-deep-space-blue-700 text-white font-medium rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Ir al inicio de sesión
            </a>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-burgundy-50 dark:bg-burgundy-900/40 text-burgundy-500 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-semibold text-granite-900 dark:text-white">Error de Verificación</h2>
            <p className="text-sm text-granite-500 mt-2">{message}</p>
            <a
              href="/"
              className="mt-6 inline-flex items-center justify-center w-full px-4 py-2 bg-granite-100 hover:bg-granite-200 dark:bg-granite-800 dark:hover:bg-granite-700 text-granite-700 dark:text-granite-200 font-medium rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyEmailPage;
