# Guía de Diseño y Reglas del Proyecto (TutoriasU Frontend)

Este documento establece las normativas de diseño, desarrollo y estructura visual para asegurar que todo el proyecto se mantenga uniforme, profesional y libre de inconsistencias. **Cualquier nuevo componente, vista o modificación debe apegarse estrictamente a estas reglas.**

---

## 1. Paleta de Colores (Theme Variables)

El proyecto utiliza variables CSS personalizadas definidas en `index.css`. **Está estrictamente prohibido usar colores arbitrarios de Tailwind (como `slate`, `blue`, `red`, etc.) o colores hexadecimales en línea.** Todo debe referenciar a la paleta del diseño:

* **Deep Space Blue** (`bg-deep-space-blue-*`, `text-deep-space-blue-*`):
 * Uso: Fondos en modo oscuro, elementos primarios, bordes fuertes.
* **Granite** (`bg-granite-*`, `text-granite-*`):
 * Uso: Texto neutro, fondos claros en modo claro, bordes sutiles.
* **Sage Green** (`bg-sage-green-*`, `text-sage-green-*`):
 * Uso: Estados de éxito, botones primarios suaves, indicadores positivos.
* **Tea Green** (`bg-tea-green-*`, `text-tea-green-*`):
 * Uso: Acentos visuales, fondos destacados, badges.
* **Burgundy** (`bg-burgundy-*`, `text-burgundy-*`):
 * Uso: Alertas, errores, botones destructivos, estados críticos.

> **Regla de Oro:** Siempre utilizar las clases de Tailwind configuradas para estos colores. Si necesitas un gris, usa `granite`. Si necesitas un azul oscuro, usa `deep-space-blue`.

---

## 2. Tipografía (Typography)

La fuente principal y **única** del proyecto es **`Outfit`**.

* **Prohibido el uso de estilos en línea** para cambiar tipografías (ej. `style={{ fontFamily: 'Comfortaa' }}`).
* **Jerarquía Textual:**
 * Títulos Principales (H1): `text-3xl` o `text-2xl font-semibold tracking-tight`
 * Subtítulos (H2/H3): `text-xl` o `text-lg font-medium`
 * Cuerpo de texto (Body): `text-base` o `text-sm`
 * Metadatos / Etiquetas pequeñas: `text-xs font-medium`
* **Contraste de Texto:**
 * Modo claro: `text-granite-900` para títulos, `text-granite-500` o `text-granite-600` para texto secundario.
 * Modo oscuro: `text-white` para títulos, `text-deep-space-blue-300` o `400` para texto secundario.

---

## 3. Estilo Visual Ejecutivo (Modern & Professional)

El proyecto debe mantener un aspecto **gerencial, sobrio y ejecutivo**. No debe parecer una red social lúdica ni una aplicación de mercado con diseños abultados.

* **Bordes Rectilíneos (Border Radius):**
  * Se deben utilizar bordes suaves pero estructurados: `rounded-md` o `rounded-lg` para contenedores, tarjetas, inputs, botones y "chips" de categorías/materias.
  * **Estrictamente Prohibido:** El uso de `rounded-2xl`, `rounded-3xl` o `rounded-full` en componentes de la interfaz. Los diseños "juguetones" o "burbuja" no son parte de este producto.
  * *Excepción única:* Las fotos de perfil de usuario o avatares de tutores DEBEN ser siempre `rounded-full` para respetar el estándar universal de UI.
* **Minimalismo de Íconos:**
  * No uses íconos simplemente porque hay espacio vacío o para decorar títulos (ej. prohibido poner un ícono flotante junto a títulos principales de página o en tarjetas de acceso rápido si no aporta funcionalidad).
  * Menos es más. Los íconos solo deben usarse para indicar acciones claras (ej. flecha de regresar, lupa en un buscador, o ícono pequeño en un botón de "Guardar").
* **Limpieza de Encabezados (Headers):**
  * La información del usuario (nombre, rol, avatar) ya está centralizada en el `Navbar` global.
  * **Prohibido** repetir saludos como "Hola, {usuario}" o duplicar fotos de perfil en el cuerpo de paneles de control o dashboards.

---

## 4. Animaciones y Transiciones (Timing & Motion)

Las animaciones dispares y los retrasos en los cambios de tema generan una mala experiencia de usuario.

* **Regla de Oro para el Cambio de Tema (Light/Dark Mode):** 
  * **NUNCA uses `transition-colors` o `transition-all` en textos si cambian de color por el modo oscuro (ej. `dark:text-white`).**
  * ¿Por qué? El cambio de tema en la aplicación ocurre de manera **instantánea** al aplicarse la clase `dark`. Si le agregas una transición, se crearán efectos de "lag" visual.
  * *Excepción:* Los botones, inputs y contenedores pueden tener transiciones suaves para el hover (`hover:border-emerald-500 transition-colors`), pero no transiciones lentas ligadas al cambio de tema.

---

## 5. Iconografía Uniforme

Para evitar "iconografía rara" o disonancia visual:

* **Librería Oficial:** **Lucide React** (`lucide-react`).
* **Librería Prohibida/A remover:** `Phosphor Icons` (o cualquier otra librería de íconos inyectada).
* **Tamaños Estándar:**
 * Íconos en texto / inline: `w-4 h-4`
 * Íconos destacados / botones principales: `w-5 h-5`
* **Grosor (Stroke Width):** Lucide usa `strokeWidth={2}` por defecto. Mantenerlo así.

---

## 6. Arquitectura y Decisiones Técnicas Core

Para garantizar la máxima fiabilidad, rendimiento y UX, se han tomado decisiones arquitectónicas que todo developer debe respetar y entender al tocar el código base:

* **Autenticación MSAL (Microsoft):**
  * **Uso exclusivo de `loginRedirect`:** Se probó e intentó usar `loginPopup` pero fallaba críticamente en navegadores con *Prevención de Seguimiento* estricta. **La aplicación utiliza `loginRedirect` de manera obligatoria** como el estándar más robusto.
  * **Intercepción Silenciosa del Redirect (Zero-Flash):** Para que `loginRedirect` no se sienta torpe, la intercepción de la respuesta de MSAL ocurre **de forma asíncrona dentro del ciclo de vida de React** (en un `useEffect` en `AuthContext`), en lugar de bloquear el renderizado en `main.jsx`.

* **Actualización Optimista (Optimistic UI):**
  * Toda la secuencia posterior al Login inicial (Onboarding, Selección de Rol, etc.) debe ser completamente **optimista**.
  * Una vez que sabemos que el usuario existe, las transiciones en la UI deben ser instantáneas en el estado de React sin usar `await` bloqueantes hacia el backend.

* **Sincronización del Tema Visual (FOUC & Toggles):**
  * **Script de Bloqueo de Renderizado (FOUC):** Para evitar los flashazos blancos molestos antes de que React despierte (Flash of Unstyled Content), `index.html` cuenta con un diminuto `<script>` en el `<head>`. Este lee `tutoriasu_theme` del `localStorage` e inyecta la clase `.dark` directamente en el HTML de forma síncrona.
  * **Contexto Síncrono:** `ThemeContext` utiliza `useLayoutEffect` en lugar de `useEffect` para manipular el DOM.
  * **Componentes Toggler Controlados:** Nunca instancies `AnimatedThemeToggler` "suelto". Siempre usa el envoltorio `<DarkModeToggle />`.
