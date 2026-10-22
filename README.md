# TutoriasU · Frontend

Cliente web de TutoriasU, la plataforma de tutorías entre estudiantes universitarios. Es una aplicación de una sola página con el lenguaje visual de Fluent 2 (como las aplicaciones de Windows), modo claro y oscuro, y vistas específicas para estudiantes, tutores y administradores.

La API está en el repositorio `backend`.

## Funcionalidades

| Rol | Funcionalidades |
| --- | --- |
| Estudiante | Acceso con correo, Google o Microsoft; elección de intereses; panel con próximas sesiones y tutores recomendados; catálogo con búsqueda y filtros; perfil del tutor con horario y reseñas; reserva en calendario con tema opcional; historial, cancelación y calificación de sesiones. |
| Tutor | Postulación con comprobante y seguimiento del estado; horario semanal "a pinceladas" sobre una rejilla; días sin tutorías; antelación mínima y enlace fijo de videollamada; solicitudes pendientes con el tema que pide el estudiante; materias que imparte. |
| Administrador | Revisión de postulaciones con acceso al comprobante; aprobación y rechazo con motivo. |

## Tecnologías

| Área | Tecnología |
| --- | --- |
| Interfaz | React 19, React Router 7 |
| Sistema de diseño | Fluent UI React v9 (`@fluentui/react-components`, `@fluentui/react-calendar-compat`, `@fluentui/react-icons`) |
| Compilación | Vite |
| Autenticación | `@azure/msal-react` (Microsoft Entra ID) y `@react-oauth/google` |
| Pruebas | Vitest (unitarias), Playwright (extremo a extremo) y axe-core (accesibilidad) |
| Calidad | ESLint con las reglas de React Hooks |
| Hosting | Vercel |

## Diseño

El sistema de diseño está documentado en [`design.md`](./design.md), que es la fuente de verdad para el color de marca (`#456ad1`), la tipografía, los materiales, el movimiento, la accesibilidad y los patrones de cada pantalla. Cualquier cambio visual debe respetarlo y, si introduce una regla nueva, documentarla ahí.

## Requisitos

- Node.js 20 o posterior
- npm
- La API de TutoriasU en ejecución, local o desplegada

## Configuración

Las variables se leen de `.env.development` (con `npm run dev`) y de `.env.production` (con `npm run build`).

| Variable | Descripción |
| --- | --- |
| `VITE_API_URL` | URL base de la API, sin `/api` ni barra final. |
| `VITE_FRONTEND_URL` | URL pública del cliente; se usa en los redireccionamientos de inicio de sesión. |
| `VITE_GOOGLE_CLIENT_ID` | ID de cliente OAuth de Google. |
| `VITE_MICROSOFT_CLIENT_ID` | ID de la aplicación registrada en Microsoft Entra ID. |
| `VITE_ZONA_HORARIA` | Opcional. Zona horaria de la universidad (IANA), por defecto `America/Mexico_City`. Debe coincidir con la del backend. |

## Instalación y ejecución

```bash
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`.

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con recarga en caliente. |
| `npm run build` | Compilación de producción en `dist/`. |
| `npm run preview` | Sirve localmente la compilación de producción. |
| `npm run lint` | Análisis estático con ESLint. |
| `npm test` | Pruebas unitarias con Vitest. |
| `npm run coverage` | Pruebas unitarias con reporte de cobertura. |
| `npm run e2e` | Pruebas de extremo a extremo con Playwright. |

## Estructura del proyecto

```text
src/
├── assets/            Fotografías
├── components/
│   ├── illustrations/ Ilustraciones SVG con los colores del tema
│   ├── shell/         Barra superior, menú lateral y menú de usuario
│   └── ui/            Componentes compartidos (Page, TarjetaIlustrada, SessionList…)
├── context/           Sesión (AuthContext) y tema (ThemeContext)
├── features/          Pantallas por área: admin, auth, dashboard, onboarding, tutores
├── hooks/             Hooks compartidos (notificaciones, cargas de página…)
├── lib/               Utilidades: hora de la plataforma, formatos, enlaces
├── services/          Cliente de la API y servicios por recurso
├── theme/             Tema de Fluent, movimiento y superficies
├── types/             Constantes compartidas
├── App.jsx            Rutas y guardas por rol
└── main.jsx           Punto de entrada y proveedores
e2e/                   Pruebas de Playwright y API simulada
design.md              Sistema de diseño
```

## Pruebas

- **Unitarias (Vitest):** lógica pura, como el cálculo de franjas de disponibilidad, la hora de la plataforma y los servicios de la API.
- **Extremo a extremo (Playwright):** recorren los flujos reales de cada rol contra una API simulada (`e2e/helpers.js`), así que no necesitan el backend. Corren en la zona horaria de la plataforma para no depender del equipo.
- **Accesibilidad:** `e2e/accesibilidad.spec.js` revisa las pantallas principales con axe (WCAG 2.1 A y AA) en tema claro y oscuro. No se aceptan fallas graves ni críticas.

La primera vez, instala el navegador de Playwright:

```bash
npx playwright install chromium
```

## Integración con la API

- `src/services/apiClient.js` agrega el token de sesión e interpreta los errores en formato ProblemDetails. Un `401` cierra la sesión.
- La sesión se refresca al abrir la aplicación (`GET /api/auth/sesion`), así que los cambios de rol, como una aprobación de tutor, se reflejan sin volver a iniciar sesión.
- Las fechas de las citas viajan en la hora local de la plataforma, sin zona. Las comparaciones con la hora actual pasan por `src/lib/horaPlataforma.js`.

## Despliegue

- Cada pull request hacia `main` ejecuta el flujo **Frontend Tests**: lint, compilación, pruebas unitarias y pruebas de extremo a extremo.
- La rama `main` se publica en Vercel. `vercel.json` redirige todas las rutas a `index.html` para que funcione el enrutamiento del lado del cliente.
