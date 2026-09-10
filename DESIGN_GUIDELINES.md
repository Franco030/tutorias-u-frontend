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
 * Títulos Principales (H1): `text-3xl font-bold tracking-tight`
 * Subtítulos (H2/H3): `text-xl font-semibold`
 * Cuerpo de texto (Body): `text-base` o `text-sm`
 * Metadatos / Etiquetas pequeñas: `text-xs font-medium`
* **Contraste de Texto:**
 * Modo claro: `text-granite-900` para títulos, `text-granite-500` para texto secundario.
 * Modo oscuro: `text-white` para títulos, `text-deep-space-blue-200` o `300` para texto secundario.

---

## 3. Animaciones y Transiciones (Timing & Motion)

Las animaciones dispares y los retrasos en los cambios de tema (como el texto tardando en cambiar de color) generan una mala experiencia de usuario.

* **Regla de Oro para el Cambio de Tema (Light/Dark Mode):** 
  * **NUNCA uses `transition-colors` o `transition-all` en textos y botones si cambian de color por el modo oscuro (ej. `dark:text-white`).**
  * ¿Por qué? El cambio de tema en la aplicación ocurre de manera **instantánea** al aplicarse la clase `dark`. Si le agregas una transición de color a textos específicos, estos se desfasarán del resto de la interfaz, creando un efecto de "lag" visual muy notorio y molesto. Los cambios de color por tema deben ser siempre instantáneos.
  * *Excepción:* Los contenedores principales o fondos muy grandes pueden llevar transiciones suaves, pero en componentes pequeños de la interfaz, textos e iconos, omite las transiciones de color.
* **Animaciones de Montaje (Framer Motion):**
  * Las entradas de componentes deben ser sutiles.
  * Valores estándar: `initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}`
  * Si necesitas animar el estado *hover* de un elemento (por ejemplo, que una flecha se mueva o un icono crezca), usa **siempre** transiciones específicas como `transition-transform duration-200` o `transition-opacity`.
  * **Evita `transition-all`**, ya que forzará la transición del color durante el cambio de tema, rompiendo la regla anterior.
* **Interpolación de Movimiento (Evitar "Teletransportación"):**
  * Al intentar animar desplazamientos espaciales (`transform`, `translate-x`) *simultáneamente* con otras tipográficas (`letter-spacing`), las clases utilitarias de Tailwind pueden fallar debido a cómo interpolan sus variables CSS internas (`--tw-translate-x`), provocando que el elemento salte instantáneamente.
  * Para asegurar movimientos espaciales fluidos y 100% compatibles, es preferible emplear posicionamiento nativo (ej. clases como `-left-8` y `left-0` asegurando un contenedor `relative`) e inyectar el timing explícitamente vía React: `style={{ transition: 'left 800ms ease-out, letter-spacing 800ms ease-out' }}`.
---

## 4. Iconografía Uniforme

Actualmente el proyecto mezcla dependencias de iconos. Para evitar "iconografía rara" o disonancia visual:

* **Librería Oficial:** **Lucide React** (`lucide-react`).
* **Librería Prohibida/A remover:** `Phosphor Icons` (o cualquier otra librería de iconos inyectada).
* **Tamaños Estándar:**
 * Iconos en texto / inline: `w-4 h-4` o `w-3.5 h-3.5`
 * Iconos destacados / botones principales: `w-5 h-5`
* **Grosor (Stroke Width):** Lucide usa `strokeWidth={2}` por defecto. Mantenerlo así para preservar el peso visual.

---

## 5. ️ Estructura de Componentes y UI

* **Estilo de Formularios y Auth (Minimalismo "Premium Art Gallery"):**
  * **Prohibido:** No usar cajas cerradas, fondos opacos para los inputs, ni alertas voluminosas tipo "caja roja".
  * **Inputs (Magic Replacement):** Los campos de texto deben ser transparentes (`bg-transparent`) con únicamente un borde inferior (`border-b`). Las etiquetas iniciales hacen de *placeholder* y, al empezar a escribir, deben desaparecer deslizándose hacia la izquierda, siendo reemplazadas mágicamente por un ícono que entra escalando y rotando (`peer-placeholder-shown` puramente CSS).
  * **Espaciado Dinámico de Inputs:** El texto del input debe ajustar su padding dinámicamente (`placeholder-shown:pl-1 pl-9`) para que el cursor siempre respete el espacio del texto y, luego, el del ícono.
  * **Botones Secundarios (Texto Flotante):** Los botones sociales (Google, Microsoft) no deben tener cajas ni colores de fondo, desplegando elegantemente una fina línea inferior al hacer hover.
  * **Selectores de Rol (Animación Continua + Deslizamiento Editorial):** Para opciones grandes, usar un contenedor `group/list` para atenuar opciones no seleccionadas (al 20%). Al hacer hover sobre uno, la caja se dibuja perimetralmente (4 líneas animadas en 800ms). El texto empieza visualmente alineado a la izquierda mediante un desplazamiento negativo (`-translate-x-8` para compensar el `px-8` del botón) y, al hacer hover, se desliza fluidamente hacia la derecha (`translate-x-0`) creando espacio exacto para que el marco naciente quede perfectamente alineado con el título superior.
  * **Retroalimentación de Error Minimalista:** Ante un error (ej. credenciales incorrectas), **no se deben mostrar textos de error ni tarjetas**. La única respuesta visual debe ser que el borde inferior del input afectado y su ícono se vuelvan de color rojo (`burgundy`). Al reescribir, el estado de error se limpia instantáneamente.
* **Bordes y Sombras (Cards & Contenedores Generales):**
 * Radio de borde (Border Radius): Preferir esquinas redondeadas amigables, ej. `rounded-xl` o `rounded-2xl`.
 * Bordes: Usar un borde sutil en lugar de sombras pesadas.
 * Modo Claro: `border border-granite-200`
 * Modo Oscuro: `border border-deep-space-blue-800`
 * Fondos de Tarjetas:
 * Modo Claro: `bg-white`
 * Modo Oscuro: `bg-deep-space-blue-900/40` (ligeramente transparente para profundidad).
* **Limpieza de Código:**
 * Remover código comentado, estilos en línea (`style={{...}}`) y logs en consola (`console.log`) antes de dar por terminada una tarea.

---

## Plan de Acción Inmediato (Checklist de Refactorización)

Al leer estas reglas por primera vez, el Agente debe encargarse de:
1. Buscar y eliminar estilos en línea de fuentes (como `Comfortaa`).
2. Remover usos de colores de Tailwind por defecto que no estén en la paleta (ej. cambiar `bg-slate-50` por `bg-granite-50`).
3. Estandarizar las transiciones (`duration-200` en lugar de `duration-300`).
4. Reemplazar cualquier uso de Phosphor Icons por Lucide React.
