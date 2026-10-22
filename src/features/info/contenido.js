/*
 * Datos institucionales que usan Ayuda, Acerca de, Términos y Privacidad.
 */
export const institucional = {
  // Quien responde por la plataforma y por los datos personales.
  responsable: "Edwin Jaziel Franco Arellano",
  // El aviso de privacidad debe incluir un domicilio para oír notificaciones.
  domicilio: "Saltillo, Coahuila",
  correoSoporte: "edwinfranco@uadec.edu.mx",
  // Fecha de la última revisión de Términos y Privacidad.
  actualizacionLegal: "22 de octubre de 2026",
};

// Vercel expone el commit de la compilación; en local no existe.
export const compilacion = import.meta.env.VITE_VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local";
