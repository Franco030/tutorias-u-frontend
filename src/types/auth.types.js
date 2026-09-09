/**
 * Definiciones de tipos y contratos para el módulo de Autenticación de TutoriasU.
 *
 * @typedef {Object} User
 * @property {number} id - Identificador único del usuario en el sistema
 * @property {string} email - Correo electrónico
 * @property {string} nombre - Nombre y apellidos del usuario
 * @property {string} rol - Rol asignado (ej: 'Estudiante', 'Tutor', 'Coordinador', 'Administrador')
 * @property {string|null} [fotoUrl] - Enlace al avatar o foto de perfil
 *
 * @typedef {Object} AuthResponse
 * @property {string} token - JWT emitido por el backend ASP.NET Core
 * @property {number} id - Identificador del usuario
 * @property {string} email - Correo electrónico
 * @property {string} nombre - Nombre completo
 * @property {string} rol - Rol del usuario
 * @property {string|null} [fotoUrl] - Enlace a la foto de perfil
 *
 * @typedef {Object} AuthPayload
 * @property {string} idToken - Token de identidad provisto por Google o Microsoft
 */

export const AUTH_STORAGE_KEYS = {
  TOKEN: 'tutoriasu_token',
  USER: 'tutoriasu_user',
  THEME: 'tutoriasu_theme',
};

export const AUTH_PROVIDERS = {
  GOOGLE: 'google',
  MICROSOFT: 'microsoft',
};

export const USER_ROLES = {
  ESTUDIANTE: 'Estudiante',
  TUTOR: 'Tutor',
  COORDINADOR: 'Coordinador',
  ADMINISTRADOR: 'Administrador',
};
