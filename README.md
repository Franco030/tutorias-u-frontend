# TutoriasU - Frontend 🎓

TutoriasU es una plataforma integral diseñada para facilitar el acompañamiento académico y la gestión de tutorías universitarias. Esta aplicación Frontend proporciona una interfaz moderna, rápida y altamente interactiva para estudiantes, tutores y coordinadores institucionales.

## ✨ Características Principales

* **Experiencia de Usuario (UX) Premium**: Interfaz minimalista y moderna con animaciones fluidas impulsadas por Framer Motion.
* **Autenticación Multi-Proveedor**: Inicio de sesión seguro mediante correo/contraseña, Google y Microsoft (Entra ID).
* **Zero-FOUC & Dark Mode**: Cambio de tema Claro/Oscuro instantáneo y persistente sin "flashazos" blancos (Flash of Unstyled Content) al recargar la página.
* **Actualizaciones Optimistas (Optimistic UI)**: Transiciones de estado (como la selección de roles) inmediatas en la interfaz, despachando las peticiones al servidor en segundo plano para eliminar la sensación de latencia.
* **Arquitectura MSAL Avanzada**: Flujo de inicio de sesión de Microsoft optimizado mediante `loginRedirect` interceptado silenciosamente para prevenir parpadeos y dobles recargas del DOM.

## 🛠️ Tecnologías Utilizadas

* **Core**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
* **Estilos**: [Tailwind CSS v4](https://tailwindcss.com/)
* **Animaciones**: [Framer Motion](https://www.framer.com/motion/)
* **Iconografía**: [Lucide React](https://lucide.dev/)
* **Autenticación**: 
  * `@react-oauth/google` (Google Auth)
  * `@azure/msal-react` & `@azure/msal-browser` (Microsoft Auth)
* **Enrutamiento**: `react-router-dom`

## 🚀 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:
* **Node.js** (v18.0.0 o superior)
* **npm** o **pnpm** (Gestor de paquetes)

## ⚙️ Instalación y Configuración Local

1. **Clona el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd tutorias-u-frontend
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno**
   Crea un archivo `.env` en la raíz del proyecto basándote en un posible `.env.example`:
   ```env
   VITE_FRONTEND_URL=http://localhost:5173
   VITE_API_URL=http://localhost:3000/api
   VITE_GOOGLE_CLIENT_ID=tu_google_client_id_aqui
   VITE_MICROSOFT_CLIENT_ID=tu_microsoft_client_id_aqui
   ```

4. **Inicia el servidor de desarrollo**
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en `http://localhost:5173`.

## 📂 Estructura del Proyecto

```text
src/
├── components/       # Componentes UI reutilizables (Botones, Inputs, Toggles)
├── context/          # Contextos globales de React (AuthContext, ThemeContext)
├── features/         # Módulos separados por funcionalidad (Auth, Dashboard)
├── lib/              # Utilidades genéricas (clases condicionadas, helpers)
├── types/            # Definiciones de constantes (Roles, Storage Keys)
├── App.jsx           # Componente raíz y enrutamiento principal
├── main.jsx          # Punto de entrada de la aplicación e instanciación de Providers
└── index.css         # Archivo global de estilos y configuración de Tailwind v4
```

## 📐 Diseño y Arquitectura

El proyecto sigue reglas estrictas de diseño visual y arquitectura para garantizar la mantenibilidad a largo plazo. 

Para conocer a detalle las decisiones sobre el manejo del estado, flujos de autenticación, diseño de componentes y convenciones de código, es **obligatorio** consultar el documento:
👉 [**DESIGN_GUIDELINES.md**](./DESIGN_GUIDELINES.md)

## 📜 Scripts Disponibles

* `npm run dev`: Inicia el servidor de desarrollo local con Hot Module Replacement (HMR).
* `npm run build`: Construye la aplicación optimizada para producción dentro de la carpeta `dist/`.
* `npm run lint`: Ejecuta ESLint para buscar y advertir sobre errores en el código o malas prácticas.
* `npm run preview`: Sirve localmente la versión de producción generada en la carpeta `dist/`.

---
*Desarrollado para TutoriasU.*
