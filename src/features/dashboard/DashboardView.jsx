import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

export function DashboardView({ selectedRole }) {
  const { user } = useAuth();
  
  const activeRole = (selectedRole || user?.rol || "Estudiante").trim().toLowerCase();
  
  const getNavCards = () => {
    switch (activeRole) {
      case "administrador":
        return [
          {
            title: "Aprobación de Tutores",
            description: "Revisa y gestiona las solicitudes de estudiantes que desean ser tutores.",
            href: "/admin/aprobaciones",
          },
        ];
      case "tutor":
        return [
          {
            title: "Mis Intereses",
            description: "Actualiza las materias y temas en los que necesitas ayuda como estudiante.",
            href: "/intereses",
          },
          (user?.estadoAprobacion?.trim().toLowerCase() === "aprobado") ? {
            title: "Materias que Imparto",
            description: "Configura las especialidades que enseñas como tutor.",
            href: "/tutor/mis-materias",
          } : {
            title: "Materias que Imparto",
            description: "Tu solicitud debe ser aprobada antes de configurar tus materias.",
            href: "#",
            disabled: true
          },
          {
            title: "Mis Tutorías",
            description: "Gestiona tus sesiones y alumnos. (Próximamente)",
            href: "#",
            disabled: true
          }
        ];
      case "estudiante":
      default:
        return [
          {
            title: "Mis Intereses",
            description: "Selecciona las materias en las que te gustaría recibir tutorías.",
            href: "/intereses",
          },
          {
            title: "Buscar Tutores",
            description: "Explora el catálogo de tutores disponibles y agenda una clase.",
            href: "/tutores",
          },
          (user?.estadoAprobacion && user.estadoAprobacion.trim().toLowerCase() !== "ninguno") ? {
            title: "Estado de Solicitud",
            description: "Revisa cómo va el proceso de tu postulación para ser tutor.",
            href: "/estado-solicitud",
          } : {
            title: "Conviértete en Tutor",
            description: "Aplica para impartir tutorías y ayudar a otros estudiantes.",
            href: "/aplicar-tutor",
          }
        ];
    }
  };

  const navCards = getNavCards();

  return (
    <main className="w-full flex-1 flex flex-col items-center px-4 py-10">
      <div className="max-w-5xl w-full space-y-8">
        
        <div>
          <h1 className="text-2xl font-semibold text-granite-900 dark:text-white tracking-tight">
            Panel de Control
          </h1>
          <p className="text-sm text-granite-500 dark:text-deep-space-blue-300 mt-1 capitalize">
            Vista de {activeRole}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {navCards.map((card, idx) => (
            card.href !== "#" && !card.disabled ? (
              <Link
                key={idx}
                to={card.href}
                className="group flex flex-col p-6 rounded-lg bg-white dark:bg-deep-space-blue-900/40 border border-granite-200 dark:border-deep-space-blue-800 hover:border-deep-space-blue-500 dark:hover:border-emerald-500 hover:shadow-sm transition-all duration-200"
              >
                <h3 className="text-base font-medium text-granite-900 dark:text-white mb-2 group-hover:text-deep-space-blue-600 dark:group-hover:text-emerald-400 transition-colors">
                  {card.title}
                </h3>
                <p className="text-sm text-granite-600 dark:text-deep-space-blue-300 leading-relaxed">
                  {card.description}
                </p>
              </Link>
            ) : (
              <div
                key={idx}
                className="flex flex-col p-6 rounded-lg bg-granite-50 dark:bg-deep-space-blue-950/40 border border-granite-200 dark:border-deep-space-blue-800 opacity-75 cursor-not-allowed"
              >
                <h3 className="text-base font-medium text-granite-700 dark:text-granite-300 mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-granite-500 dark:text-deep-space-blue-400 leading-relaxed">
                  {card.description}
                </p>
              </div>
            )
          ))}
        </div>
      </div>
    </main>
  );
}
