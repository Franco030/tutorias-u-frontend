import {
  bundleIcon,
  BookLetter24Filled,
  BookLetter24Regular,
  BookStar24Filled,
  BookStar24Regular,
  CalendarClock24Filled,
  CalendarClock24Regular,
  CalendarLtr24Filled,
  CalendarLtr24Regular,
  DocumentQueue24Filled,
  DocumentQueue24Regular,
  HatGraduation24Filled,
  HatGraduation24Regular,
  Home24Filled,
  Home24Regular,
  PeopleCheckmark24Filled,
  PeopleCheckmark24Regular,
  PeopleSearch24Filled,
  PeopleSearch24Regular,
  TaskListSquareLtr24Filled,
  TaskListSquareLtr24Regular,
} from "@fluentui/react-icons";

const Inicio = bundleIcon(Home24Filled, Home24Regular);
const Buscar = bundleIcon(PeopleSearch24Filled, PeopleSearch24Regular);
const Calendario = bundleIcon(CalendarLtr24Filled, CalendarLtr24Regular);
const Intereses = bundleIcon(BookStar24Filled, BookStar24Regular);
const SerTutor = bundleIcon(HatGraduation24Filled, HatGraduation24Regular);
const Solicitud = bundleIcon(DocumentQueue24Filled, DocumentQueue24Regular);
const Pendientes = bundleIcon(TaskListSquareLtr24Filled, TaskListSquareLtr24Regular);
const Materias = bundleIcon(BookLetter24Filled, BookLetter24Regular);
const Disponibilidad = bundleIcon(CalendarClock24Filled, CalendarClock24Regular);
const Aprobaciones = bundleIcon(PeopleCheckmark24Filled, PeopleCheckmark24Regular);

const normalizar = (valor) => valor?.trim().toLowerCase() || "";

export const getRol = (user) => normalizar(user?.rol);

export const esTutorAprobado = (user) =>
  getRol(user) === "tutor" && normalizar(user?.estadoAprobacion) === "aprobado";

export const tieneSolicitudTutor = (user) => {
  const estado = normalizar(user?.estadoAprobacion);
  return Boolean(estado) && estado !== "ninguno";
};

/*
 * Secciones de la navegación lateral según el rol.
 * Cada destino corresponde a una ruta existente en App.jsx; ninguna se
 * muestra si su guard redirigiría al usuario.
 */
export function getNavSections(user) {
  const rol = getRol(user);

  if (rol === "administrador") {
    return [
      {
        items: [
          { to: "/admin/aprobaciones", label: "Aprobación de tutores", icon: Aprobaciones },
        ],
      },
    ];
  }

  if (rol === "tutor") {
    if (!esTutorAprobado(user)) {
      return [
        {
          items: [
            { to: "/", label: "Inicio", icon: Inicio },
            tieneSolicitudTutor(user)
              ? { to: "/estado-solicitud", label: "Estado de solicitud", icon: Solicitud }
              : { to: "/aplicar-tutor", label: "Postulación de tutor", icon: SerTutor },
            { to: "/mis-tutorias", label: "Mis tutorías", icon: Calendario },
          ],
        },
      ];
    }

    return [
      {
        items: [
          { to: "/", label: "Inicio", icon: Inicio },
          { to: "/tutor/mis-tutorias", label: "Solicitudes", icon: Pendientes },
          { to: "/mis-tutorias", label: "Mis tutorías", icon: Calendario },
        ],
      },
      {
        title: "Perfil de tutor",
        items: [
          { to: "/tutor/mis-materias", label: "Materias que imparto", icon: Materias },
          { to: "/tutor/disponibilidad", label: "Disponibilidad", icon: Disponibilidad },
        ],
      },
    ];
  }

  return [
    {
      items: [
        { to: "/", label: "Inicio", icon: Inicio },
        { to: "/tutores", label: "Buscar tutores", icon: Buscar },
        { to: "/mis-tutorias", label: "Mis tutorías", icon: Calendario },
        { to: "/intereses", label: "Mis intereses", icon: Intereses },
      ],
    },
    {
      title: "Enseñar",
      items: [
        tieneSolicitudTutor(user)
          ? { to: "/estado-solicitud", label: "Estado de solicitud", icon: Solicitud }
          : { to: "/aplicar-tutor", label: "Conviértete en tutor", icon: SerTutor },
      ],
    },
  ];
}

// Ruta de navegación activa para una URL (la coincidencia más específica gana).
export function getActiveNavValue(sections, pathname) {
  const destinos = sections.flatMap((section) => section.items.map((item) => item.to));
  if (pathname.startsWith("/tutor/") && !destinos.includes(pathname)) {
    return destinos.includes("/tutores") ? "/tutores" : undefined;
  }
  return destinos
    .filter((to) => (to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(`${to}/`)))
    .sort((a, b) => b.length - a.length)[0];
}
