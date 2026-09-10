import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import authService from "./authService";
import { Loader2, Mail, Lock, User } from "lucide-react";

export function LocalAuthForm() {
  const { loginLocal, isLoading } = useAuth();
  const [isRegister, setIsRegister] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");

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
        setSuccessMsg(
          "Registro exitoso. Por favor revisa tu bandeja de entrada o la carpeta de SPAM para verificar tu cuenta.",
        );
        setIsRegister(false); // Cambiamos a login
        setPassword("");
      } else {
        await loginLocal(email, password);
      }
    } catch (err) {
      console.error(err);
      setLocalError(
        isRegister ? "No se pudo crear la cuenta" : "Credenciales incorrectas",
      );
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

        {isRegister && (
          <div className="pt-2">
            <div className="relative flex items-center">
              <input
                type="text"
                id="nombre"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="peer w-full pr-4 py-3 bg-transparent border-b border-granite-300 dark:border-deep-space-blue-800 text-sm focus:outline-none focus:border-deep-space-blue-600 dark:focus:border-emerald-400 text-granite-900 dark:text-white rounded-none placeholder-transparent placeholder-shown:pl-1 pl-9 transition-[padding] duration-300"
                placeholder="Nombre completo"
              />
              <label
                htmlFor="nombre"
                className="absolute left-1 text-sm text-granite-400 transition-all duration-300 pointer-events-none opacity-0 -translate-x-4 peer-placeholder-shown:opacity-100 peer-placeholder-shown:translate-x-0"
              >
                Nombre completo
              </label>
              <div className="absolute left-1 flex items-center justify-center transition-all duration-300 pointer-events-none opacity-100 scale-100 rotate-0 peer-placeholder-shown:opacity-0 peer-placeholder-shown:scale-50 peer-placeholder-shown:-rotate-90">
                <User
                  className="h-5 w-5 text-deep-space-blue-600 dark:text-emerald-400"
                  strokeWidth={1.5}
                />
              </div>
            </div>
          </div>
        )}

        <div className="pt-2">
          <div className="relative flex items-center">
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setLocalError(null);
              }}
              className={`peer w-full pr-4 py-3 bg-transparent border-b ${localError ? "border-burgundy-500 focus:border-burgundy-600 dark:border-burgundy-400 dark:focus:border-burgundy-300" : "border-granite-300 dark:border-deep-space-blue-800 focus:border-deep-space-blue-600 dark:focus:border-emerald-400"} text-sm focus:outline-none text-granite-900 dark:text-white rounded-none placeholder-transparent placeholder-shown:pl-1 pl-9 transition-[padding,border-color] duration-300`}
              placeholder="Correo electrónico"
            />
            <label
              htmlFor="email"
              className="absolute left-1 text-sm text-granite-400 transition-all duration-300 pointer-events-none opacity-0 -translate-x-4 peer-placeholder-shown:opacity-100 peer-placeholder-shown:translate-x-0"
            >
              Correo electrónico
            </label>
            <div className="absolute left-1 flex items-center justify-center transition-all duration-300 pointer-events-none opacity-100 scale-100 rotate-0 peer-placeholder-shown:opacity-0 peer-placeholder-shown:scale-50 peer-placeholder-shown:-rotate-90">
              <Mail
                className={`h-5 w-5 ${localError ? "text-burgundy-500 dark:text-burgundy-400" : "text-deep-space-blue-600 dark:text-emerald-400"}`}
                strokeWidth={1.5}
              />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <div className="relative flex items-center">
            <input
              type="password"
              id="password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setLocalError(null);
              }}
              className={`peer w-full pr-4 py-3 bg-transparent border-b ${localError ? "border-burgundy-500 focus:border-burgundy-600 dark:border-burgundy-400 dark:focus:border-burgundy-300" : "border-granite-300 dark:border-deep-space-blue-800 focus:border-deep-space-blue-600 dark:focus:border-emerald-400"} text-sm focus:outline-none text-granite-900 dark:text-white rounded-none placeholder-transparent placeholder-shown:pl-1 pl-9 transition-[padding,border-color] duration-300`}
              placeholder="Contraseña"
            />
            <label
              htmlFor="password"
              className="absolute left-1 text-sm text-granite-400 transition-all duration-300 pointer-events-none opacity-0 -translate-x-4 peer-placeholder-shown:opacity-100 peer-placeholder-shown:translate-x-0"
            >
              Contraseña
            </label>
            <div className="absolute left-1 flex items-center justify-center transition-all duration-300 pointer-events-none opacity-100 scale-100 rotate-0 peer-placeholder-shown:opacity-0 peer-placeholder-shown:scale-50 peer-placeholder-shown:-rotate-90">
              <Lock
                className={`h-5 w-5 ${localError ? "text-burgundy-500 dark:text-burgundy-400" : "text-deep-space-blue-600 dark:text-emerald-400"}`}
                strokeWidth={1.5}
              />
            </div>
          </div>
        </div>

        {localError && (
          <p className="text-xs text-burgundy-600 dark:text-burgundy-400 font-medium mt-1">
            {localError}
          </p>
        )}

        <button
          type="submit"
          disabled={isBusy}
          className="w-full py-4 px-4 mt-8 bg-deep-space-blue-600 hover:bg-deep-space-blue-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-deep-space-blue-950 font-medium text-sm transition-[background-color] duration-300 focus:outline-none disabled:opacity-60 flex items-center justify-center gap-2 rounded-sm"
        >
          {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
          {isRegister ? "Crear cuenta" : "Iniciar sesión"}
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
          {isRegister
            ? "¿Ya tienes cuenta? Inicia sesión"
            : "¿No tienes cuenta? Regístrate"}
        </button>
      </div>
    </div>
  );
}

export default LocalAuthForm;
