# GuÃ­a de DiseÃ±o y Reglas del Proyecto (TutoriasU Frontend)

Este documento establece las normativas de diseÃ±o, desarrollo y estructura visual para asegurar que todo el proyecto se mantenga uniforme, profesional y libre de inconsistencias. **Cualquier nuevo componente, vista o modificaciÃ³n debe apegarse estrictamente a estas reglas.**

---

## 1. Paleta de Colores (Theme Variables)

El proyecto utiliza variables CSS personalizadas definidas en `index.css`. **EstÃ¡ estrictamente prohibido usar colores arbitrarios de Tailwind (como `slate`, `blue`, `red`, etc.) o colores hexadecimales en lÃ­nea.** Todo debe referenciar a la paleta del diseÃ±o:

* **Deep Space Blue** (`bg-deep-space-blue-*`, `text-deep-space-blue-*`):
 * Uso: Fondos en modo oscuro, elementos primarios, bordes fuertes.
* **Granite** (`bg-granite-*`, `text-granite-*`):
 * Uso: Texto neutro, fondos claros en modo claro, bordes sutiles.
* **Sage Green** (`bg-sage-green-*`, `text-sage-green-*`):
 * Uso: Estados de Ã©xito, botones primarios suaves, indicadores positivos.
* **Tea Green** (`bg-tea-green-*`, `text-tea-green-*`):
 * Uso: Acentos visuales, fondos destacados, badges.
* **Burgundy** (`bg-burgundy-*`, `text-burgundy-*`):
 * Uso: Alertas, errores, botones destructivos, estados crÃ­ticos.

> **Regla de Oro:** Siempre utilizar las clases de Tailwind configuradas para estos colores. Si necesitas un gris, usa `granite`. Si necesitas un azul oscuro, usa `deep-space-blue`.

---

## 2. TipografÃ­a (Typography)

La fuente principal y **Ãºnica** del proyecto es **`Outfit`**.

* **Prohibido el uso de estilos en lÃ­nea** para cambiar tipografÃ­as (ej. `style={{ fontFamily: 'Comfortaa' }}`).
* **JerarquÃ­a Textual:**
 * TÃ­tulos Principales (H1): `text-3xl font-bold tracking-tight`
 * SubtÃ­tulos (H2/H3): `text-xl font-semibold`
 * Cuerpo de texto (Body): `text-base` o `text-sm`
 * Metadatos / Etiquetas pequeÃ±as: `text-xs font-medium`
* **Contraste de Texto:**
 * Modo claro: `text-granite-900` para tÃ­tulos, `text-granite-500` para texto secundario.
 * Modo oscuro: `text-white` para tÃ­tulos, `text-deep-space-blue-200` o `300` para texto secundario.

---

## 3. Animaciones y Transiciones (Timing & Motion)

Las animaciones dispares y los retrasos en los cambios de tema (como el texto tardando en cambiar de color) generan una mala experiencia de usuario.

* **Regla de Oro para el Cambio de Tema (Light/Dark Mode):** 
  * **NUNCA uses `transition-colors` o `transition-all` en textos y botones si cambian de color por el modo oscuro (ej. `dark:text-white`).**
  * Â¿Por quÃ©? El cambio de tema en la aplicaciÃ³n ocurre de manera **instantÃ¡nea** al aplicarse la clase `dark`. Si le agregas una transiciÃ³n de color a textos especÃ­ficos, estos se desfasarÃ¡n del resto de la interfaz, creando un efecto de "lag" visual muy notorio y molesto. Los cambios de color por tema deben ser siempre instantÃ¡neos.
  * *ExcepciÃ³n:* Los contenedores principales o fondos muy grandes pueden llevar transiciones suaves, pero en componentes pequeÃ±os de la interfaz, textos e iconos, omite las transiciones de color.
* **Animaciones de Montaje (Framer Motion):**
  * Las entradas de componentes deben ser sutiles.
  * Valores estÃ¡ndar: `initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}`
  * Si necesitas animar el estado *hover* de un elemento (por ejemplo, que una flecha se mueva o un icono crezca), usa **siempre** transiciones especÃ­ficas como `transition-transform duration-200` o `transition-opacity`.
  * **Evita `transition-all`**, ya que forzarÃ¡ la transiciÃ³n del color durante el cambio de tema, rompiendo la regla anterior.
* **InterpolaciÃ³n de Movimiento (Evitar "TeletransportaciÃ³n"):**
  * Al intentar animar desplazamientos espaciales (`transform`, `translate-x`) *simultÃ¡neamente* con otras tipogrÃ¡ficas (`letter-spacing`), las clases utilitarias de Tailwind pueden fallar debido a cÃ³mo interpolan sus variables CSS internas (`--tw-translate-x`), provocando que el elemento salte instantÃ¡neamente.
  * Para asegurar movimientos espaciales fluidos y 100% compatibles, es preferible emplear posicionamiento nativo (ej. clases como `-left-8` y `left-0` asegurando un contenedor `relative`) e inyectar el timing explÃ­citamente vÃ­a React: `style={{ transition: 'left 800ms ease-out, letter-spacing 800ms ease-out' }}`.
---

## 4. IconografÃ­a Uniforme

Actualmente el proyecto mezcla dependencias de iconos. Para evitar "iconografÃ­a rara" o disonancia visual:

* **LibrerÃ­a Oficial:** **Lucide React** (`lucide-react`).
* **LibrerÃ­a Prohibida/A remover:** `Phosphor Icons` (o cualquier otra librerÃ­a de iconos inyectada).
* **TamaÃ±os EstÃ¡ndar:**
 * Iconos en texto / inline: `w-4 h-4` o `w-3.5 h-3.5`
 * Iconos destacados / botones principales: `w-5 h-5`
* **Grosor (Stroke Width):** Lucide usa `strokeWidth={2}` por defecto. Mantenerlo asÃ­ para preservar el peso visual.

---

## 5. ï¸ Estructura de Componentes y UI

* **Estilo de Formularios y Auth (Minimalismo "Premium Art Gallery"):**
  * **Prohibido:** No usar cajas cerradas, fondos opacos para los inputs, ni alertas voluminosas tipo "caja roja".
  * **Inputs (Magic Replacement):** Los campos de texto deben ser transparentes (`bg-transparent`) con Ãºnicamente un borde inferior (`border-b`). Las etiquetas iniciales hacen de *placeholder* y, al empezar a escribir, deben desaparecer deslizÃ¡ndose hacia la izquierda, siendo reemplazadas mÃ¡gicamente por un Ã­cono que entra escalando y rotando (`peer-placeholder-shown` puramente CSS).
  * **Espaciado DinÃ¡mico de Inputs:** El texto del input debe ajustar su padding dinÃ¡micamente (`placeholder-shown:pl-1 pl-9`) para que el cursor siempre respete el espacio del texto y, luego, el del Ã­cono.
  * **Botones Secundarios (Texto Flotante):** Los botones sociales (Google, Microsoft) no deben tener cajas ni colores de fondo, desplegando elegantemente una fina lÃ­nea inferior al hacer hover.
  * **Selectores de Rol (AnimaciÃ³n Continua + Deslizamiento Editorial):** Para opciones grandes, usar un contenedor `group/list` para atenuar opciones no seleccionadas (al 20%). Al hacer hover sobre uno, la caja se dibuja perimetralmente (4 lÃ­neas animadas en 800ms). El texto empieza visualmente alineado a la izquierda mediante un desplazamiento negativo (`-translate-x-8` para compensar el `px-8` del botÃ³n) y, al hacer hover, se desliza fluidamente hacia la derecha (`translate-x-0`) creando espacio exacto para que el marco naciente quede perfectamente alineado con el tÃ­tulo superior.
  * **RetroalimentaciÃ³n de Error Minimalista:** Ante un error (ej. credenciales incorrectas), **no se deben mostrar textos de error ni tarjetas**. La Ãºnica respuesta visual debe ser que el borde inferior del input afectado y su Ã­cono se vuelvan de color rojo (`burgundy`). Al reescribir, el estado de error se limpia instantÃ¡neamente.
* **Bordes y Sombras (Cards & Contenedores Generales):**
 * Radio de borde (Border Radius): Preferir esquinas redondeadas amigables, ej. `rounded-xl` o `rounded-2xl`.
 * Bordes: Usar un borde sutil en lugar de sombras pesadas.
 * Modo Claro: `border border-granite-200`
 * Modo Oscuro: `border border-deep-space-blue-800`
 * Fondos de Tarjetas:
 * Modo Claro: `bg-white`
 * Modo Oscuro: `bg-deep-space-blue-900/40` (ligeramente transparente para profundidad).
* **Limpieza de CÃ³digo:**
 * Remover cÃ³digo comentado, estilos en lÃ­nea (`style={{...}}`) y logs en consola (`console.log`) antes de dar por terminada una tarea.

---

## Plan de AcciÃ³n Inmediato (Checklist de RefactorizaciÃ³n)

Al leer estas reglas por primera vez, el Agente debe encargarse de:
1. Buscar y eliminar estilos en lÃ­nea de fuentes (como `Comfortaa`).
2. Remover usos de colores de Tailwind por defecto que no estÃ©n en la paleta (ej. cambiar `bg-slate-50` por `bg-granite-50`).
3. Estandarizar las transiciones (`duration-200` en lugar de `duration-300`).
4. Reemplazar cualquier uso de Phosphor Icons por Lucide React.
---


---

---

## 6. Arquitectura y Decisiones Técnicas Core

Para garantizar la máxima fiabilidad, rendimiento y UX, se han tomado decisiones arquitectónicas que todo developer debe respetar y entender al tocar el código base:

* **Autenticación MSAL (Microsoft):**
  * **Uso exclusivo de `loginRedirect`:** Se probó e intentó usar `loginPopup` para la autenticación con Microsoft, pero fallaba críticamente en navegadores con *Prevención de Seguimiento* estricta (ITP en Safari, Firefox ETP, Edge Strict). Estas capas de seguridad aíslan el popup (`window.opener = null`) haciendo imposible la comunicación cruzada para entregar el token. Por lo tanto, **la aplicación utiliza `loginRedirect` de manera obligatoria** como el estándar más robusto.
  * **Intercepción Silenciosa del Redirect (Zero-Flash):** Para que `loginRedirect` no se sienta torpe ni cause recargas dobles de la página (FOUC), la intercepción de la respuesta de MSAL ocurre **de forma asíncrona dentro del ciclo de vida de React** (en un `useEffect` en `AuthContext`), en lugar de bloquear el renderizado en `main.jsx`. De esta manera, React y los temas visuales se montan inmediatamente, y luego el cambio de estado (`isAuthenticated = true`) dispara las animaciones fluidamente.

* **Actualización Optimista (Optimistic UI):**
  * Toda la secuencia posterior al Login inicial (Onboarding, Selección de Rol, etc.) debe ser completamente **optimista**.
  * Una vez que sabemos que el usuario existe o es `"Nuevo"`, las transiciones en la UI (ej. darle clic a "Estudiante") deben ser instantáneas en el estado de React (`setRole`, etc.), sin usar `await` bloqueantes hacia el backend.
  * La petición API se despacha en **segundo plano** (`.catch(err => ...)`). Esto elimina cualquier sensación de "lageo" en las interfaces.

* **Sincronización del Tema Visual (FOUC & Toggles):**
  * **Script de Bloqueo de Renderizado (FOUC):** Para evitar los flashazos blancos molestos antes de que React despierte (Flash of Unstyled Content), `index.html` cuenta con un diminuto `<script>` en el `<head>`. Este lee `tutoriasu_theme` del `localStorage` e inyecta la clase `.dark` directamente en el HTML de forma síncrona antes de dibujar el body. **No se debe quitar ni mover.**
  * **Contexto Síncrono:** `ThemeContext` utiliza `useLayoutEffect` en lugar de `useEffect` para manipular el DOM (`documentElement.classList`). Esto evita desfases con el ciclo de vida de React.
  * **Componentes Toggler Controlados:** Nunca instancies `AnimatedThemeToggler` "suelto". Si lo haces, manejará su propio estado local (`"theme"`) y se desincronizará del `ThemeContext` (`"tutoriasu_theme"`), causando bugs visuales horribles al recargar con F5. Siempre usa el envoltorio `<DarkModeToggle />` que ya inyecta las props controladas (`theme={theme} onThemeChange={setTheme}`) hacia el contexto principal.
