import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { iniciarSesion, materias, simularApi, tutores, usuarios } from './helpers';

// Revisión automática (axe, WCAG 2.1 A/AA): no se aceptan fallas graves ni críticas.
async function revisar(page) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    // Centinelas de foco de Fluent (tabster): <i aria-hidden tabindex=0> que
    // solo redirigen el foco; axe los marca como falso positivo.
    .exclude('[data-tabster-dummy]')
    .analyze();
  const graves = violations.filter((v) => ['serious', 'critical'].includes(v.impact));
  expect(
    graves.map((v) => `${v.id}: ${v.help} → ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`),
    'violaciones de accesibilidad graves'
  ).toEqual([]);
}

const rutas = {
  '/api/citas/proximas': [],
  '/api/citas/historial': [],
  '/api/tutores/recomendados': tutores,
  '/api/tutores': tutores,
  '/api/materias': materias,
  '/api/estudiantes/intereses': [1],
};

for (const tema of ['light', 'dark']) {
  test.describe(`Accesibilidad (${tema === 'light' ? 'claro' : 'oscuro'})`, () => {
    test('inicio de sesión', async ({ page }) => {
      await page.addInitScript((t) => localStorage.setItem('tutoriasu_theme', t), tema);
      await page.goto('/');
      await expect(page.getByRole('heading', { name: 'Inicia sesión' })).toBeVisible();
      await revisar(page);
    });

    for (const [nombre, ruta, titulo] of [
      ['panel de inicio', '/', 'Panel de control'],
      ['catálogo', '/tutores', 'Buscar tutores'],
      ['mis intereses', '/intereses', 'Mis intereses'],
    ]) {
      test(nombre, async ({ page }) => {
        await iniciarSesion(page, usuarios.estudiante, { tema });
        await simularApi(page, rutas);
        await page.goto(ruta);
        await expect(page.getByRole('heading', { name: titulo })).toBeVisible();
        // Espera a que terminen las animaciones de entrada.
        await page.waitForTimeout(600);
        await revisar(page);
      });
    }
  });
}
