import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {
  historialPorCalificar,
  iniciarSesion,
  materias,
  rutasPerfilTutor,
  rutasTutorReservas,
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
      ['ayuda y soporte', '/ayuda', 'Ayuda y soporte'],
      ['acerca de', '/acerca', 'Acerca de TutoriasU'],
      ['aviso de privacidad', '/privacidad', 'Aviso de privacidad'],
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

    test('recuperar la contraseña en el acceso', async ({ page }) => {
      await page.addInitScript((t) => localStorage.setItem('tutoriasu_theme', t), tema);
      await page.goto('/');
      await page.getByRole('button', { name: '¿Olvidaste tu contraseña?' }).click();
      await expect(page.getByRole('heading', { name: 'Restablece tu contraseña' })).toBeVisible();
      await page.waitForTimeout(600);
      await revisar(page);
    });

    test('elegir una contraseña nueva', async ({ page }) => {
      await page.addInitScript((t) => localStorage.setItem('tutoriasu_theme', t), tema);
      await page.goto('/restablecer-contrasena?token=abc');
      await page.getByLabel(/Contraseña nueva/).fill('abc');
      await expect(page.getByText('Debe tener al menos 6 caracteres.')).toBeVisible();
      await page.waitForTimeout(600);
      await revisar(page);
    });

    test('pantalla con error', async ({ page }) => {
      await iniciarSesion(page, usuarios.estudiante, { tema });
      await simularApi(page, { ...rutas, '/api/tutores/11': { ...tutores[0], materias: 'Cálculo' } });
      await page.goto('/tutor/11');
      await expect(page.getByRole('heading', { name: 'Algo salió mal' })).toBeVisible();
      await page.waitForTimeout(600);
      await revisar(page);
    });

    test('aprobación de tutores', async ({ page }) => {
      await iniciarSesion(page, usuarios.admin, { tema });
      await simularApi(page, {
        '/api/admin/solicitudes': [
          {
            id: 40,
            nombre: 'Sofía Treviño',
            correo: 'sofia@universidad.edu',
            urlCredencial: 'https://archivos.example.com/kardex.pdf',
            fechaSolicitud: '2026-10-01T10:00:00',
            materias: ['Álgebra', 'Cálculo'],
          },
        ],
      });
      await page.goto('/admin/aprobaciones');
      await expect(page.getByText('Sofía Treviño')).toBeVisible();
      await page.waitForTimeout(600);
      await revisar(page);
    });

    test('sesión en curso en el inicio', async ({ page }) => {
      await page.clock.install({ time: new Date('2026-10-22T16:20:00-06:00') });
      await iniciarSesion(page, usuarios.estudiante, { tema });
      await simularApi(page, {
        ...rutas,
        '/api/citas/proximas': [
          {
            id: 61,
            rolOpuestoNombre: 'Mateo Herrera',
            materia: 'Cálculo',
            fechaHoraInicio: '2026-10-22T16:00:00',
            linkReunion: 'https://meet.example.com/calculo',
            estado: 'Aceptada',
          },
        ],
      });
      await page.goto('/');
      await expect(page.getByText('En curso')).toBeVisible();
      await page.waitForTimeout(600);
      await revisar(page);
    });

    test('calificar una tutoría', async ({ page }) => {
      await iniciarSesion(page, usuarios.estudiante, { tema });
      await simularApi(page, { ...rutas, '/api/citas/historial': historialPorCalificar });
      await page.goto('/mis-tutorias');
      await page.getByRole('tab', { name: 'Historial' }).click();
      await page.getByRole('listitem').filter({ hasText: 'Cálculo' }).getByRole('button', { name: 'Calificar' }).click();
      await page.getByRole('dialog', { name: 'Calificar tutoría' }).getByRole('radio', { name: '4 de 5 estrellas' }).check();
      await page.waitForTimeout(600);
      await revisar(page);
    });

    test('disponibilidad del tutor', async ({ page }) => {
      await iniciarSesion(page, usuarios.tutor, { tema });
      await simularApi(page, {
        ...rutasTutorReservas,
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

    test('página no encontrada', async ({ page }) => {
      await iniciarSesion(page, usuarios.estudiante, { tema });
      await simularApi(page, rutas);
      await page.goto('/esta-ruta-no-existe');
      await expect(page.getByRole('heading', { name: 'Esta página no existe' })).toBeVisible();
      await page.waitForTimeout(600);
      await revisar(page);
    });

    for (const pestana of ['Días sin tutorías', 'Reservas']) {
      test(`disponibilidad: ${pestana}`, async ({ page }) => {
        await iniciarSesion(page, usuarios.tutor, { tema });
        await simularApi(page, {
          ...rutasTutorReservas,
          '/api/tutores/bloqueos': { bloqueos: [{ fecha: '2099-01-15', motivo: 'Examen' }], citasAfectadas: 1 },
          '/api/tutores/11/disponibilidad': [],
        });
        await page.goto('/tutor/disponibilidad');
        await page.getByRole('tab', { name: new RegExp(pestana) }).click();
        await page.waitForTimeout(600);
        await revisar(page);
      });
    }
  });
}
