import { test, expect } from '@playwright/test';
import { iniciarSesion, materias, simularApi, tutores, usuarios } from './helpers';

test.describe('Página no encontrada', () => {
  test('con sesión se ve dentro del shell y vuelve al inicio', async ({ page }) => {
    await iniciarSesion(page, usuarios.estudiante);
    await simularApi(page, {
      '/api/citas/proximas': [],
      '/api/tutores/recomendados': tutores,
      '/api/materias': materias,
    });

    await page.goto('/una/ruta/que/no/existe');
    await expect(page.getByRole('heading', { name: 'Esta página no existe' })).toBeVisible();
    await expect(page.getByRole('img', { name: /pato/ })).toBeVisible();
    // La navegación del shell sigue disponible.
    await expect(page.getByRole('navigation')).toBeVisible();

    await page.getByRole('button', { name: 'Volver al inicio' }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { name: 'Esta página no existe' })).toBeHidden();
  });

  test('sin sesión se ve sola y lleva al acceso', async ({ page }) => {
    await page.goto('/no-existe');
    await expect(page.getByRole('heading', { name: 'Esta página no existe' })).toBeVisible();
    await expect(page.getByRole('navigation')).toHaveCount(0);

    await page.getByRole('button', { name: 'Volver al inicio' }).click();
    await expect(page.getByRole('heading', { name: 'Inicia sesión' })).toBeVisible();
  });
});
