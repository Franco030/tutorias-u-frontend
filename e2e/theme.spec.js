import { test, expect } from '@playwright/test';
import { iniciarSesion, simularApi, usuarios } from './helpers';

test.describe('Tema claro y oscuro', () => {
  test('el acceso lo cambia desde el interruptor y persiste tras recargar (F5)', async ({ page }) => {
    await page.addInitScript(() => {
      if (!sessionStorage.getItem('tema-sembrado')) {
        localStorage.setItem('tutoriasu_theme', 'light');
        sessionStorage.setItem('tema-sembrado', '1');
      }
    });
    await page.goto('/');

    const html = page.locator('html');
    const interruptor = page.getByRole('switch', { name: 'Tema oscuro' });
    await expect(interruptor).not.toBeChecked();

    await interruptor.click();
    await expect(html).toHaveClass(/dark/);
    await expect(interruptor).toBeChecked();

    await page.reload();
    await expect(html).toHaveClass(/dark/);
    await expect(page.getByRole('switch', { name: 'Tema oscuro' })).toBeChecked();
    expect(await page.evaluate(() => localStorage.getItem('tutoriasu_theme'))).toBe('dark');
  });

  test('dentro de la app se cambia desde el menú de usuario', async ({ page }) => {
    await iniciarSesion(page, usuarios.estudiante);
    await simularApi(page, { '/api/citas/proximas': [], '/api/tutores/recomendados': [] });
    await page.goto('/');

    // Ya no hay un botón suelto de tema en la barra.
    await expect(page.getByRole('button', { name: /tema/i })).toHaveCount(0);

    await page.getByTitle('Menú de usuario').click();
    const opcion = page.getByRole('menuitemcheckbox', { name: 'Tema oscuro' });
    await expect(opcion).not.toBeChecked();
    await opcion.click();

    await expect(page.locator('html')).toHaveClass(/dark/);
    expect(await page.evaluate(() => localStorage.getItem('tutoriasu_theme'))).toBe('dark');
  });
});
