import {
  bundleIcon,
  BookLetter20Filled,
  BookLetter20Regular,
  BookStar20Filled,
  BookStar20Regular,
  CalendarClock20Filled,
  CalendarClock20Regular,
  CalendarLtr20Filled,
  CalendarLtr20Regular,
  DocumentQueue20Filled,
  DocumentQueue20Regular,
  HatGraduation20Filled,
  HatGraduation20Regular,
  Home20Filled,
  Home20Regular,
  PeopleCheckmark20Filled,
  PeopleCheckmark20Regular,
  PeopleSearch20Filled,
  PeopleSearch20Regular,
  QuestionCircle20Filled,
  QuestionCircle20Regular,
  TaskListSquareLtr20Filled,
  TaskListSquareLtr20Regular,
} from "@fluentui/react-icons";

const Inicio = bundleIcon(Home20Filled, Home20Regular);
const Buscar = bundleIcon(PeopleSearch20Filled, PeopleSearch20Regular);
const Calendario = bundleIcon(CalendarLtr20Filled, CalendarLtr20Regular);
const Intereses = bundleIcon(BookStar20Filled, BookStar20Regular);
const SerTutor = bundleIcon(HatGraduation20Filled, HatGraduation20Regular);
const Solicitud = bundleIcon(DocumentQueue20Filled, DocumentQueue20Regular);
const Pendientes = bundleIcon(TaskListSquareLtr20Filled, TaskListSquareLtr20Regular);
const Materias = bundleIcon(BookLetter20Filled, BookLetter20Regular);
const Disponibilidad = bundleIcon(CalendarClock20Filled, CalendarClock20Regular);
const Aprobaciones = bundleIcon(PeopleCheckmark20Filled, PeopleCheckmark20Regular);
const Ayuda = bundleIcon(QuestionCircle20Filled, QuestionCircle20Regular);

// Sección fija al pie del menú para todos los roles, como Configuración en el
// NavigationView de Windows.
const SECCION_AYUDA = {
  fija: true,
  items: [{ to: "/ayuda", label: "Ayuda y soporte", icon: Ayuda }],
};

const normalizar = (valor) => valor?.trim().toLowerCase() || "";

export const getRol = (user) => normalizar(user?.rol);

export const esTutorAprobado = (user) =>
  getRol(user) === "tutor" && normalizar(user?.estadoAprobacion) === "aprobado";

export const tieneSolicitudTutor = (user) => {
  const estado = normalizar(user?.estadoAprobacion);
  return Boolean(estado) && estado !== "ninguno";
};

/*
 * Secciones de la navegación lateral según el rol, más la de ayuda al pie.
 * Cada destino corresponde a una ruta existente en App.jsx; ninguna se
 * muestra si su guard redirigiría al usuario.
 */
export function getNavSections(user) {
  return [...seccionesDelRol(user), SECCION_AYUDA];
}

function seccionesDelRol(user) {
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
