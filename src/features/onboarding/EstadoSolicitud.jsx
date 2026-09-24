import { ArrowLeft, Clock, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function EstadoSolicitud() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Normalizar el estado
  const estado = user?.estadoAprobacion?.trim().toLowerCase() || "pendiente";

  let Icon;
  let colorClass;
  let titulo;
  let mensaje;

  switch (estado) {
    case "aprobado":
      Icon = CheckCircle;
      colorClass = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      titulo = "¡Felicidades, fuiste aprobado!";
      mensaje = "Tu solicitud ha sido revisada y aceptada. Ya eres parte oficial del equipo de tutores. Vuelve al panel para configurar tus sesiones.";
      break;
    case "rechazado":
      Icon = XCircle;
      colorClass = "text-red-500 bg-red-500/10 border-red-500/20";
      titulo = "Solicitud Rechazada";
      mensaje = "Lamentablemente tu solicitud no cumple con los requisitos en este momento. Puedes volver a intentarlo en el futuro o contactar a administración.";
      break;
    case "pendiente":
    default:
      Icon = Clock;
      colorClass = "text-amber-500 bg-amber-500/10 border-amber-500/20";
      titulo = "Solicitud en Revisión";
      mensaje = "Hemos recibido correctamente tus credenciales y materias. El equipo de administración está revisando tu perfil. Te notificaremos cuando haya una respuesta.";
      break;
  }

  return (
    <main className="min-h-screen bg-granite-50 dark:bg-deep-space-blue-950 py-10 px-6 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 text-center">
        
        <div className="flex justify-start">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-md hover:bg-granite-200 dark:hover:bg-deep-space-blue-800 transition-colors text-granite-600 dark:text-deep-space-blue-300"
            aria-label="Volver al panel"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        <div className={`mx-auto w-24 h-24 rounded-full border-4 flex items-center justify-center ${colorClass}`}>
          <Icon className="w-12 h-12" />
        </div>

        <div>
          <h1 className="text-2xl font-semibold text-granite-900 dark:text-white">
            {titulo}
          </h1>
          <p className="mt-4 text-granite-600 dark:text-deep-space-blue-300 leading-relaxed">
            {mensaje}
          </p>
        </div>

        <div className="pt-8 border-t border-granite-200 dark:border-deep-space-blue-800">
          <button
            onClick={() => navigate("/")}
            className="w-full bg-white dark:bg-deep-space-blue-900 border border-granite-200 dark:border-deep-space-blue-800 text-granite-700 dark:text-white px-6 py-3 rounded-md font-medium hover:bg-granite-50 dark:hover:bg-deep-space-blue-800 transition-colors shadow-sm"
          >
            Volver al Inicio
          </button>
        </div>
        
      </div>
    </main>
  );
}
