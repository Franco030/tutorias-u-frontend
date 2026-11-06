import { test, expect } from './fixtures';
import { iniciarSesion, materias, simularApi, tutores, usuarios } from './helpers';

test.describe('Título de la pestaña', () => {
  test('el acceso conserva "TutoriasU"', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeVisible();
    await expect(page).toHaveTitle('TutoriasU');
  });

  test('cada pantalla pone su título y el inicio vuelve a "TutoriasU"', async ({ page }) => {
    await iniciarSesion(page, usuarios.estudiante);
    await simularApi(page, {
      '/api/auth/sesion': usuarios.estudiante,
      '/api/citas/proximas': [],
      '/api/citas/historial': [],
      '/api/tutores/recomendados': tutores,
      '/api/tutores': tutores,
      '/api/materias': materias,
    });

    await page.goto('/mis-tutorias');
    await expect(page.getByRole('heading', { name: 'Mis tutorías' })).toBeVisible();
    await expect(page).toHaveTitle('Mis tutorías · TutoriasU');

    await page.goto('/tutores');
    await expect(page.getByRole('heading', { name: 'Buscar tutores' })).toBeVisible();
    await expect(page).toHaveTitle('Buscar tutores · TutoriasU');

    // Navegación dentro de la app (sin recargar): el inicio restaura el título.
    await page.getByRole('link', { name: 'Inicio' }).first().click();
    await expect(page.getByRole('heading', { name: 'Panel de control' })).toBeVisible();
    await expect(page).toHaveTitle('TutoriasU');
  });

  test('la página no encontrada lo dice en la pestaña', async ({ page }) => {
    await page.goto('/no-existe');
    await expect(page.getByRole('heading', { name: 'Esta página no existe' })).toBeVisible();
    await expect(page).toHaveTitle('Página no encontrada · TutoriasU');
  });
});
