import { test, expect } from '@playwright/test';

test.describe('Theme Persistence & Toggling', () => {
  test('debe cambiar de tema al hacer clic en el botón y persistir tras recargar (F5)', async ({ page }) => {
    // Ir a la página principal
    await page.goto('/');

    // Asegurarse de que el botón de tema existe y es visible
    const themeToggle = page.getByRole('button', { name: 'Toggle theme' });
    await expect(themeToggle).toBeVisible();

    // Obtener la clase inicial del HTML (para saber en qué modo estamos por el SO)
    const html = page.locator('html');
    const isInitiallyDark = await html.evaluate(node => node.classList.contains('dark'));

    // Hacer clic en el botón para alternar el tema
    await themeToggle.click();

    // Esperar a que la clase cambie en el HTML
    if (isInitiallyDark) {
      await expect(html).not.toHaveClass(/dark/);
    } else {
      await expect(html).toHaveClass(/dark/);
    }

    // Recargar la página simulando F5
    await page.reload();

    // Verificar que el tema persistió y se aplicó correctamente tras recargar
    if (isInitiallyDark) {
      await expect(html).not.toHaveClass(/dark/);
    } else {
      await expect(html).toHaveClass(/dark/);
    }

    // Verificar que el valor en localStorage es correcto
    const storedTheme = await page.evaluate(() => localStorage.getItem('tutoriasu_theme'));
    expect(storedTheme).toBe(isInitiallyDark ? 'light' : 'dark');
  });
});
