import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import authService from './authService';
import { Loader2, Mail, Lock, User } from 'lucide-react';

export function LocalAuthForm() {
  const { loginLocal, isLoading } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  
  const [localError, setLocalError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMsg(null);
    setIsProcessing(true);

    try {
      if (isRegister) {
        await authService.registerLocal(email, nombre, password);
        setSuccessMsg('Registro exitoso. Por favor revisa tu bandeja de entrada o la carpeta de SPAM para verificar tu cuenta.');
        setIsRegister(false); // Cambiamos a login
        setPassword('');
      } else {
        await loginLocal(email, password);
      }
    } catch (err) {
      setLocalError(err?.message || (isRegister ? 'Error al registrar.' : 'Credenciales incorrectas.'));
    } finally {
      setIsProcessing(false);
    }
  };

  const isBusy = isLoading || isProcessing;

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {successMsg && (
          <div className="p-3 mb-2 rounded-xl bg-sage-green-50 dark:bg-sage-green-900/40 border border-sage-green-200 dark:border-sage-green-800 text-sage-green-700 dark:text-sage-green-300 text-xs font-medium">
            {successMsg}
          </div>
        )}
        
        {localError && (
          <div className="p-3 mb-2 rounded-xl bg-burgundy-50 dark:bg-burgundy-950/40 border border-burgundy-200 dark:border-burgundy-900/50 text-burgundy-700 dark:text-burgundy-300 text-xs font-medium">
            {localError}
          </div>
        )}

        {isRegister && (
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-granite-400" />
              </div>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-granite-50 dark:bg-deep-space-blue-900/50 border border-granite-200 dark:border-deep-space-blue-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-deep-space-blue-500 text-granite-900 dark:text-white"
                placeholder="Nombre completo"
              />
            </div>
          </div>
        )}

        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-granite-400" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-granite-50 dark:bg-deep-space-blue-900/50 border border-granite-200 dark:border-deep-space-blue-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-deep-space-blue-500 text-granite-900 dark:text-white"
              placeholder="Correo electrónico"
            />
          </div>
        </div>

        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-granite-400" />
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-granite-50 dark:bg-deep-space-blue-900/50 border border-granite-200 dark:border-deep-space-blue-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-deep-space-blue-500 text-granite-900 dark:text-white"
              placeholder="Contraseña"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isBusy}
          className="w-full py-2.5 px-4 mt-2 rounded-xl bg-deep-space-blue-600 hover:bg-deep-space-blue-700 text-white font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-deep-space-blue-500 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isBusy && <Loader2 className="w-4 h-4 animate-spin" />}
          {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => {
            setIsRegister(!isRegister);
            setLocalError(null);
            setSuccessMsg(null);
          }}
          className="text-xs text-deep-space-blue-600 dark:text-deep-space-blue-400 hover:underline font-medium"
        >
          {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
        </button>
      </div>
    </div>
  );
}

export default LocalAuthForm;
