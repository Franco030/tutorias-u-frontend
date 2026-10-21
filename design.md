# Design — TutoriasU

Sistema de diseño de la app. Reemplaza al antiguo `DESIGN_GUIDELINES.md`.
Toda pantalla nueva o modificada sigue este archivo; si algo no encaja, se
enmienda aquí, no con un estilo suelto en el componente.

## Sistema
- Lenguaje · Fluent 2 (apps de Windows) con `@fluentui/react-components` v9.
- Género · modern-minimal (herramienta de trabajo: sobria, densa, sin adornos).
- Tema · `src/theme/fluentTheme.js` — tema claro y oscuro generados desde la marca.
- Estilos · Griffel (`makeStyles` + `tokens`). No hay Tailwind ni CSS por
  componente; `src/index.css` solo tiene un reset mínimo.
- Griffel no acepta `borderColor`/`inset` abreviados: usar `shorthands.*`.
- Griffel no ordena las media queries por ancho: nunca dos `min-width` sobre
  la misma propiedad de un elemento. Usar rangos que no se solapen o
  `repeat(auto-fill, minmax(...))` en cuadrículas.
  Para combinar clases, `mergeClasses`, nunca concatenar strings.
- Las clases de `FluentProvider` se copian a los portales: nada de layout en
  el provider (va en el contenedor de `FluentThemeBridge`).
- Los componentes de texto de Fluent son `inline`: dentro de un bloque,
  envolverlos en un contenedor `flex` en columna.

## Marca y color
- Logotipo · `shell/BrandMark` (`LogoMark`): mosaico con degradado de marca,
  libro abierto y lector. Favicon equivalente en `public/tutoriasu-mark.svg`.
- Color de marca · `#456ad1` (tono 80 de la rampa `brandTutoriasU`).
- Nunca un color literal en un componente: siempre `tokens.color*`.
- Capas (de abajo arriba) · base tipo Mica (`colorNeutralBackground3` con 5 %
  de la marca, barra y navegación) → lienzo `colorNeutralBackground2` con
  borde y `shadow4` → tarjetas `colorNeutralBackground1` → menús y diálogos.
- Estados · éxito `colorPaletteGreen*`, aviso `colorPaletteMarigold*`,
  error `colorPaletteRed*` (o `MessageBar intent`). Nunca solo color: icono + texto.
- Modo oscuro · lo decide `ThemeContext` (clase `.dark` en `<html>` +
  `localStorage.tutoriasu_theme`); `FluentThemeBridge` elige el tema.

## Tipografía
- Familia · Segoe UI Variable / Segoe UI (fuente del sistema en Mac, Android, iOS).
- Rampa Fluent · `Caption1` 12 · `Body1` 14 · `Subtitle2` 16 · `Subtitle1` 20 ·
  `Title3` 24 · `Title2` 28 · `Title1` 32 · `LargeTitle` 40.
- Título de página · `Title2` (móvil `Title3`). Un solo título por pantalla.
- Títulos siempre rectos (nunca cursiva). Sin eyebrows en mayúsculas.
- Números en columnas · `font-variant-numeric: tabular-nums`.

## Forma, espacio y profundidad
- Radio · `borderRadiusMedium` (4 px) en controles, `borderRadiusXLarge`
  (12 px) en tarjetas, superficies y listas, `borderRadiusCircular` solo en
  avatares, indicadores circulares y píldoras de estado.

### Reglas de esquinas (dónde sí y dónde no)
1. **Solo se redondea una esquina libre.** Si un lado toca el borde de la
   ventana u otra superficie (paneles acoplados, barra de título, cajón móvil,
   panel del menú sobre el lienzo), esas esquinas van rectas.
2. **La única esquina "interior" redondeada es la del lienzo** donde se unen
   la barra de título y el riel (patrón de Windows 11), y solo desde 1024 px;
   en móvil el lienzo toca los bordes y va recto.
3. **Nada se monta encima de una esquina redondeada con otra esquina
   redondeada** distinta: el panel del menú cubre la esquina del lienzo, por
   eso es recto.
4. **Hijos a sangre:** si un hijo toca el borde de un contenedor redondeado
   (filas de lista, banda del perfil), el contenedor usa `overflow: hidden`
   (`Surface flush`) y las filas extremas heredan el radio en sus esquinas
   exteriores para que el hover y el anillo de foco no se corten.
5. **Anidados concéntricos:** el radio interior ≤ radio exterior − relleno
   (12 px con 16–24 px de relleno → hijos de 4–8 px). Nunca un hijo más
   redondeado que su contenedor.
6. **Mismo nivel, mismo radio:** todas las tarjetas 12 px; no mezclar 8 y 12.

- Espaciado · `tokens.spacing*` (escala de 4 px).
- Sombra · `shadow4` tarjetas en reposo, `shadow16` al pasar el cursor por
  algo clicable (con elevación de 2 px), `shadow16` menús, `shadow64`
  diálogos. En oscuro la altura se marca también con el fondo más claro.
- Radio de tarjetas y superficies · `borderRadiusXLarge` (12 px).
- Sin glassmorphism, gradientes de texto ni tarjetas dentro de tarjetas.

## Estructura de la app
- Shell · barra superior de 48 px (marca, tema, menú de usuario) + riel de
  íconos fijo de 56 px desde 1024 px. El menú (hamburguesa, alineada con la
  columna de íconos) abre un panel acrílico de 280 px **sobre** el contenido
  (modo LeftCompact de Windows): el contenido nunca cambia de ancho ni se
  mueve. Se cierra con clic fuera, Escape o al elegir una opción. En móvil es
  un `OverlayDrawer`. El shell se monta una sola vez (`ShellLayout` en `App.jsx`).
- Contenido · alineado a la izquierda junto a la navegación (no centrado),
  ocupa todo el lienzo; margen lateral 16 / 32 / 48 px según el ancho. Los textos
  largos se limitan a ~65 caracteres por línea. `Page narrow` (960 px) solo
  para pantallas de un mensaje, como el estado de solicitud.
- Flujos de primera vez (acceso, rol, intereses iniciales) y la verificación
  de correo van sin shell.

## Componentes compartidos (`src/components`)
- `shell/AppShell` · ventana con barra, navegación por rol (`shell/navigation.js`).
- `ui/Page` · `Page`, `PageHeader` (título, descripción, acciones, volver),
  `PageSection`, `Surface` (tarjeta), `PageLoading`, `FormActions`.
- `ui/SessionList` · listas de sesiones con bloque de fecha (inicio, tutorías,
  solicitudes); `ui/EstadoBadge` para el estado de una cita.
- `ui/MateriaSelector` · búsqueda, pestañas por categoría y mosaicos de
  tamaño fijo; `ui/SelectionPanel` · resumen "Tu selección" con guardar.
- `ui/Stepper` · pasos de un formulario largo (vertical y fijo en escritorio).
- `ui/EmptyState`, `ui/DangerButton` (acciones destructivas), `TutorCard`.

## Imágenes: fotografía e ilustración
Fluent (Microsoft Design) usa ilustraciones con volúmenes que salen de la
superficie, personas como símbolos (no retratos), fondos limpios, degradados
y formas que se superponen, con **una sola metáfora por imagen**.

- **Ilustraciones** (`components/illustrations/Ilustraciones.jsx`, SVG
  propio): `IlustracionComunidad` (persona rodeada de otras unidas por un
  anillo multicolor), `IlustracionAprender` (libro abierto del que se elevan
  volúmenes) e `IlustracionRevision` (documento con distintivo de estado).
  Colores solo de tokens (`colorCompoundBrandBackground` y la paleta
  Teal/Marigold/Berry/Lavender); el volumen sale de dos capas (brillo arriba
  a la izquierda y sombra abajo). El papel es blanco y el suelo un velo del
  color de texto, para que funcionen en claro y oscuro.
  `ajuste="cubrir"` en bandas anchas, `ajuste="contener"` en paneles altos.
  Composición dentro de y = 70–230 del lienzo de 480×300.
- **Fotografía** (`assets/fotos.js`, `ui/Photo`): solo fotos con relación
  directa con tutorías (hoy, el pizarrón). Generadas por IA se permiten si
  son de buena calidad y tienen sentido; nada decorativo sin relación
  (flores, esferas de plasma).
- **Dónde:** foto del pizarrón en el inicio de sesión y en "Conviértete en
  tutor"; Comunidad en "¿Dominas alguna materia?"; Aprender en el panel del
  onboarding; Revisión en el estado de solicitud. Las pantallas de trabajo
  (listas, formularios, catálogo) no llevan imágenes.
- Siempre dentro de un contenedor (tarjeta a sangre que recorta las
  esquinas). Texto sobre imagen solo con `scrim` o sobre tarjeta sólida.
  Fotos con `width`/`height`, `loading="lazy"` salvo la visible al cargar.

## Inicio de sesión
- Patrón de cuenta Microsoft: foto a pantalla completa con velo de marca y
  una tarjeta centrada de 440 px (logo, título, formulario). Orden: correo,
  contraseña, "Iniciar sesión", registro; después "o continúa con" y los
  proveedores (Microsoft, Google).

## Controles
- Botón primario · `appearance="primary"`, uno por vista. Secundario por
  defecto, `subtle` para acciones terciarias. Verbo concreto en la etiqueta.
- Formularios · `Field` con etiqueta visible arriba; error del campo en
  `validationMessage`. Nunca placeholder como etiqueta.
- Selección de materias · `ToggleButton` o `Checkbox`, nunca chips hechos a mano.
- Diálogos · `Dialog` de Fluent (foco, Escape y backdrop resueltos).
- Mensajes · `MessageBar` para errores y avisos de la página. Tras una acción
  cuyo resultado no se ve en la misma vista (aceptar, rechazar, guardar,
  cancelar) se lanza un aviso con `useNotificar` (`hooks/useNotificar.jsx`,
  abajo a la derecha, 4 s). Éxito silencioso cuando el resultado ya se ve.
- Fechas · `Calendar` de `@fluentui/react-calendar-compat` con
  `lib/calendarioEs.js` (español, semana desde el lunes); los días sin
  disponibilidad van en `restrictedDates`.
- Estados vacíos · `EmptyState` con `ilustracion` (Comunidad, Calendario,
  Revisión) en las pantallas principales; ícono simple en lugares secundarios.
- Estados de cada control · reposo, hover, foco, presionado, deshabilitado,
  cargando (`Spinner` dentro del botón), error y éxito.
- Íconos · solo `@fluentui/react-icons` (variante Regular, Filled en seleccionado).

## Movimiento (`src/theme/motion.js`)
- Duraciones y curvas de Fluent (`durationNormal`, `curveDecelerateMid`…).
- Cambio de página · navegación de nivel superior en Fluent 2: **un solo
  fundido rápido** (`pageFade`, 200 ms, solo opacidad) del contenido de
  `Page`. Nada se desplaza, escala ni entra escalonado; las fotos y el
  acceso usan ese mismo fundido, sin animación propia.
- Cargas · `PageLoading` aparece con 300 ms de retraso (`delayedFade`): si
  los datos llegan antes, no hay destello de spinner. Las pantallas se
  precargan en segundo plano cuando la app está en reposo (`App.jsx`), así
  al navegar no se espera código (React mantiene cualquier fallback de
  Suspense al menos 300 ms).
- Selección · los indicadores de lo recién elegido aparecen con `scaleIn`;
  lo que ya estaba seleccionado al entrar no se anima
  (`useSeleccionInicial`).
- Navegación · cuatro escuadras de marca (10 px por brazo, 2 px, esquinas
  rectas) enmarcan el elemento activo y se deslizan a la nueva opción
  (`curveDecelerateMax`); el activo lleva texto e ícono Filled en
  `colorBrandForeground2`. Riel y panel tienen exactamente la misma
  geometría vertical (encabezados de sección de 32 px en ambos; en el riel,
  una línea centrada), así al abrir el menú nada cambia de posición. El
  panel se revela con `clip-path` desde el ancho del riel.
- Tarjetas clicables · `liftOnHover`. Filas · chevron que avanza 3 px.
- Sin animaciones de entrada por scroll ni carruseles automáticos.
- `prefers-reduced-motion` desactiva todo movimiento (ver `index.css`), y el
  cambio de tema suspende transiciones para ser instantáneo.

## Responsive
- Verificar a 320, 375, 414, 768 y 1280 px. Sin scroll horizontal.
- Ninguna etiqueta de botón o enlace de navegación en dos líneas.
- Área táctil mínima 44 px en móvil (`pointer: coarse`).

## Accesibilidad
- `e2e/accesibilidad.spec.js` pasa axe (WCAG 2.1 A/AA) en claro y oscuro;
  no se aceptan fallas graves ni críticas.
- Si un elemento tiene texto visible, su nombre accesible sale de ese texto:
  nada de `aria-label` distinto a lo que se ve (falla
  `label-content-name-mismatch`). `aria-label` solo en botones de ícono.

## Texto
- Español, voz activa, específico. Errores: qué pasó y qué hacer.
- Nada de métricas, testimonios o logos inventados.
