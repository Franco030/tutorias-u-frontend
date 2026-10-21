// Utilidades compartidas de las pruebas e2e: sesión simulada y API simulada.

const ahora = Date.now();
export const enDias = (dias, horas = 0) =>
  new Date(ahora + dias * 86400000 + horas * 3600000).toISOString();

export const usuarios = {
  estudiante: {
    token: 'fake-jwt-estudiante',
    id: 7,
    email: 'ana.ruiz@universidad.edu',
    nombre: 'Ana Ruiz',
    rol: 'Estudiante',
    onboardingCompleto: true,
    estadoAprobacion: 'Ninguno',
  },
  tutor: {
    token: 'fake-jwt-tutor',
    id: 11,
    email: 'mateo.herrera@universidad.edu',
    nombre: 'Mateo Herrera',
    rol: 'Tutor',
    onboardingCompleto: true,
    estadoAprobacion: 'Aprobado',
  },
  admin: {
    token: 'fake-jwt-admin',
    id: 1,
    email: 'admin@universidad.edu',
    nombre: 'Coordinación',
    rol: 'Administrador',
    onboardingCompleto: true,
    estadoAprobacion: 'Ninguno',
  },
};

export const materias = [
  { id: 1, nombre: 'Cálculo', categoria: 'Matemáticas' },
  { id: 2, nombre: 'Álgebra', categoria: 'Matemáticas' },
  { id: 3, nombre: 'Física', categoria: 'Ciencias Exactas' },
  { id: 4, nombre: 'Programación', categoria: 'Tecnología' },
];

export const tutores = [
  { id: 11, nombre: 'Mateo Herrera', calificacionPromedio: 4.7, materias: ['Cálculo', 'Álgebra'] },
  { id: 12, nombre: 'Lucía Campos', calificacionPromedio: 0, materias: ['Física'] },
  { id: 13, nombre: 'Diego Salinas', calificacionPromedio: 4.2, materias: ['Programación'] },
];

// Abre la app con una sesión ya guardada (sin pasar por el formulario).
export async function iniciarSesion(page, usuario, { tema = 'light' } = {}) {
  await page.addInitScript(
    ([u, t]) => {
      if (!sessionStorage.getItem('e2e-sesion-sembrada')) {
        const { token, ...user } = u;
        localStorage.setItem('tutoriasu_token', token);
        localStorage.setItem('tutoriasu_user', JSON.stringify(user));
        localStorage.setItem('tutoriasu_theme', t);
        sessionStorage.setItem('e2e-sesion-sembrada', '1');
      }
    },
    [usuario, tema]
  );
}

/*
 * Simula el backend. `rutas` mapea "MÉTODO /api/ruta" (o solo "/api/ruta"
 * para GET) a un objeto JSON o a una función (request) => JSON.
 * Devuelve la lista de peticiones recibidas para poder verificarlas.
 */
export async function simularApi(page, rutas) {
  const recibidas = [];
  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const metodo = request.method();
    let cuerpo = null;
    try {
      cuerpo = request.postDataJSON();
    } catch {
      cuerpo = null;
    }
    recibidas.push({ metodo, ruta: url.pathname, cuerpo });

    const clave = `${metodo} ${url.pathname}`;
    // `in` y no `??`: una ruta simulada puede responder `null` (204 sin cuerpo).
    const respuesta =
      clave in rutas ? rutas[clave] : metodo === 'GET' && url.pathname in rutas ? rutas[url.pathname] : undefined;
    if (respuesta === undefined) {
      return route.fulfill({ status: 404, json: { mensaje: `Sin simular: ${clave}` } });
    }
    if (respuesta?.status) {
      return route.fulfill({ status: respuesta.status, json: respuesta.json ?? {} });
    }
    const json = typeof respuesta === 'function' ? respuesta(request) : respuesta;
    return json === null ? route.fulfill({ status: 204 }) : route.fulfill({ json });
  });
  return recibidas;
}
