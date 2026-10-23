import { test, expect } from './fixtures';
import { iniciarSesion, materias, simularApi, tutores, usuarios } from './helpers';

const rutas = {
  '/api/citas/proximas': [],
  '/api/tutores/recomendados': tutores,
  '/api/materias': materias,
  // Datos inesperados: "materias" como texto rompe el perfil al dibujarse.
  '/api/tutores/11': { ...tutores[0], materias: 'Cálculo' },
  '/api/tutores/11/disponibilidad': [],
  '/api/tutores/11/resenas': { items: [], total: 0, promedio: null },
  '/api/citas/historial': [],
};

test.describe('Errores de pantalla', () => {
  test('si una pantalla falla, se ve "Algo salió mal" dentro del shell y se puede salir', async ({ page }) => {
    const errores = [];
    page.on('pageerror', (error) => errores.push(error.message));
    await iniciarSesion(page, usuarios.estudiante);
    await simularApi(page, rutas);

    await page.goto('/tutor/11');
    await expect(page.getByRole('heading', { name: 'Algo salió mal', level: 1 })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Recargar la página' })).toBeVisible();
    // La navegación sigue disponible: al cambiar de ruta, la pantalla nueva se dibuja.
    await page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('link', { name: 'Mis tutorías' }).click();
    await expect(page.getByRole('heading', { name: 'Mis tutorías', level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Algo salió mal' })).toHaveCount(0);

    await page.goto('/tutor/11');
    await page.getByRole('link', { name: 'Ir al inicio' }).click();
    await expect(page.getByRole('heading', { name: 'Panel de control', level: 1 })).toBeVisible();
    expect(errores, 'el error no debe escapar sin capturar').toEqual([]);
  });

  test('si una pantalla no se puede descargar tras una versión nueva, pide recargar', async ({ page }) => {
    await iniciarSesion(page, usuarios.estudiante);
    await simularApi(page, { ...rutas, '/api/tutores/11': tutores[0] });
    // El código de la pantalla de Ayuda ya no existe en el servidor.
    await page.route('**/src/features/info/Ayuda.jsx*', (route) => route.fulfill({ status: 404, body: '' }));

    await page.goto('/ayuda');
    await expect(page.getByRole('heading', { name: 'Hay una versión nueva', level: 1 })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Recargar la página' })).toBeVisible();
  });
});
