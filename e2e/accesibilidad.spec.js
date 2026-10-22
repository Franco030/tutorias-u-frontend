import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {
  historialPorCalificar,
  iniciarSesion,
  materias,
  rutasPerfilTutor,
  simularApi,
  tutores,
  usuarios,
} from './helpers';

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
  ...rutasPerfilTutor,
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
      ['perfil de tutor con reseñas', '/tutor/11', 'Mateo Herrera'],
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

    test('calificar una tutoría', async ({ page }) => {
      await iniciarSesion(page, usuarios.estudiante, { tema });
      await simularApi(page, { ...rutas, '/api/citas/historial': historialPorCalificar });
      await page.goto('/mis-tutorias');
      await page.getByRole('tab', { name: 'Historial' }).click();
      await page.getByRole('button', { name: 'Calificar Cálculo con Mateo Herrera' }).click();
      await page.getByRole('dialog', { name: 'Calificar tutoría' }).getByRole('radio', { name: '4 de 5 estrellas' }).check();
      await page.waitForTimeout(600);
      await revisar(page);
    });

    test('disponibilidad del tutor', async ({ page }) => {
      await iniciarSesion(page, usuarios.tutor, { tema });
      await simularApi(page, {
        '/api/tutores/11/disponibilidad': [
          { diaSemana: 1, horaInicio: '09:00:00', horaFin: '10:00:00' },
          { diaSemana: 2, horaInicio: '14:00:00', horaFin: '15:00:00' },
        ],
      });
      await page.goto('/tutor/disponibilidad');
      await expect(page.getByRole('grid', { name: 'Disponibilidad semanal' })).toBeVisible();
      await page.waitForTimeout(600);
      await revisar(page);
    });
  });
}
