import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  LogOut
} from "lucide-react";
import Home from "../home/Home";

export function DashboardView({ selectedRole }) {
  const { user, logout } = useAuth();
  
  const activeRole = (selectedRole || user?.rol || "Estudiante").trim().toLowerCase();
  
  // Definir las tarjetas de navegación según el rol
  const getNavCards = () => {
    switch (activeRole) {
      case "administrador":
        return [
          {
            title: "Aprobación de Tutores",
            description: "Revisa y gestiona las solicitudes de estudiantes que desean ser tutores.",
            icon: <Users className="w-6 h-6 text-emerald-500" />,
            href: "/admin/aprobaciones",
            color: "border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/50 hover:bg-emerald-500/10"
          },
        ];
      case "tutor":
        return [
          {
            title: "Mis Intereses",
            description: "Actualiza las materias y temas en los que necesitas ayuda como estudiante.",
            icon: <BookOpen className="w-6 h-6 text-deep-space-blue-500 dark:text-blue-400" />,
            href: "/intereses",
            color: "border-deep-space-blue-500/20 bg-deep-space-blue-500/5 hover:border-deep-space-blue-500/50 hover:bg-deep-space-blue-500/10"
          },
          {
            title: "Materias que Imparto",
            description: "Configura las especialidades que enseñas como tutor.",
            icon: <BookOpen className="w-6 h-6 text-emerald-500" />,
            href: "/tutor/mis-materias",
            color: "border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/50 hover:bg-emerald-500/10"
          },
          {
            title: "Mis Tutorías",
            description: "Gestiona tus sesiones y alumnos. (Próximamente)",
            icon: <GraduationCap className="w-6 h-6 text-burgundy-500" />,
            href: "#",
            color: "border-burgundy-500/20 bg-burgundy-500/5 opacity-70 cursor-not-allowed"
          }
        ];
      case "estudiante":
      default:
        return [
          {
            title: "Mis Intereses",
            description: "Selecciona las materias en las que te gustaría recibir tutorías.",
            icon: <BookOpen className="w-6 h-6 text-deep-space-blue-500 dark:text-blue-400" />,
            href: "/intereses",
            color: "border-deep-space-blue-500/20 bg-deep-space-blue-500/5 hover:border-deep-space-blue-500/50 hover:bg-deep-space-blue-500/10"
          },
          {
            title: "Buscar Tutores",
            description: "Explora el catálogo de tutores disponibles y agenda una clase.",
            icon: <Users className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />,
            href: "/tutores",
            color: "border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/50 hover:bg-emerald-500/10"
          },
          (user?.estadoAprobacion && user.estadoAprobacion.trim().toLowerCase() !== "ninguno") ? {
            title: "Estado de Solicitud",
            description: "Revisa cómo va el proceso de tu postulación para ser tutor.",
            icon: <GraduationCap className="w-6 h-6 text-amber-500" />,
            href: "/estado-solicitud",
            color: "border-amber-500/20 bg-amber-500/5 hover:border-amber-500/50 hover:bg-amber-500/10"
          } : {
            title: "Conviértete en Tutor",
            description: "Aplica para impartir tutorías y ayudar a otros estudiantes.",
            icon: <GraduationCap className="w-6 h-6 text-amber-500 dark:text-amber-400" />,
            href: "/aplicar-tutor",
            color: "border-amber-500/20 bg-amber-500/5 hover:border-amber-500/50 hover:bg-amber-500/10"
          }
        ];
    }
  };

  const navCards = getNavCards();

  return (
    <main className="w-full flex-1 flex flex-col items-center px-4 py-12 sm:py-20">
      <div className="max-w-4xl w-full space-y-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-granite-200 dark:border-deep-space-blue-800">
          <div className="flex items-center gap-5 text-center md:text-left">
            {user?.fotoUrl ? (
              <img
                src={user.fotoUrl}
                alt={user.nombre}
                className="w-16 h-16 rounded-full object-cover bg-white dark:bg-deep-space-blue-950 p-1 ring-1 ring-granite-200 dark:ring-deep-space-blue-800"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-deep-space-blue-50 dark:bg-deep-space-blue-900/50 text-deep-space-blue-600 dark:text-emerald-400 text-2xl font-light flex items-center justify-center ring-1 ring-granite-200 dark:ring-deep-space-blue-800">
                {user?.nombre?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-light tracking-tight text-granite-900 dark:text-white">
                Hola, <span className="font-medium">{user?.nombre?.split(' ')[0]}</span>
              </h1>
              <p className="text-sm text-granite-500 dark:text-deep-space-blue-300 capitalize mt-1">
                Panel de {activeRole}
              </p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-granite-600 hover:text-burgundy-600 hover:bg-burgundy-50 dark:text-deep-space-blue-300 dark:hover:text-burgundy-400 dark:hover:bg-burgundy-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>

        {/* Quick Access Grid */}
        <div className="space-y-6">
          <h2 className="text-xl font-medium text-granite-900 dark:text-white">
            Accesos Rápidos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {navCards.map((card, idx) => (
              card.href !== "#" ? (
                <Link
                  key={idx}
                  to={card.href}
                  className={`flex flex-col gap-4 p-6 rounded-2xl border transition-all duration-300 ${card.color}`}
                >
                  <div className="p-3 bg-white dark:bg-deep-space-blue-950 rounded-xl w-fit shadow-sm">
                    {card.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-granite-900 dark:text-white mb-1">
                      {card.title}
                    </h3>
                    <p className="text-sm text-granite-600 dark:text-deep-space-blue-300 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </Link>
              ) : (
                <div
                  key={idx}
                  className={`flex flex-col gap-4 p-6 rounded-2xl border transition-all duration-300 ${card.color}`}
                >
                  <div className="p-3 bg-white dark:bg-deep-space-blue-950 rounded-xl w-fit shadow-sm">
                    {card.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-granite-900 dark:text-white mb-1">
                      {card.title}
                    </h3>
                    <p className="text-sm text-granite-600 dark:text-deep-space-blue-300 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>

        {activeRole === "estudiante" && <Home />}
      </div>
    </main>
  );
}
