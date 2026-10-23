// Ids del título y los metadatos de una fila de `SessionRow` (con `id`): los
// botones de la fila los usan en `aria-describedby` para anunciar de qué
// sesión se trata sin cambiar su nombre visible ("Aceptar", "Unirse"…).
export const descripcionDeFila = (id) => `${id}-titulo ${id}-meta`;
