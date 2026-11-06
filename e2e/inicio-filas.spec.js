import { test, expect } from './fixtures';
import { enDias, iniciarSesion, simularApi, tutores, usuarios } from './helpers';

const proximas = [
  { id: 61, rolOpuestoNombre: 'Mateo Herrera', materia: 'Cálculo', fechaHoraInicio: enDias(2), estado: 'Aceptada' },
  { id: 62, rolOpuestoNombre: 'Lucía Pérez', materia: 'Física', fechaHoraInicio: enDias(3), estado: 'Pendiente' },
];

const pendientes = [
  { id: 21, estudianteNombre: 'Ana Ruiz', materiaNombre: 'Cálculo', fechaHoraInicio: enDias(2), estado: 'Pendiente' },
  { id: 22, estudianteNombre: 'Carlos Méndez', materiaNombre: 'Álgebra', fechaHoraInicio: enDias(3), estado: 'Pendiente' },
];

test.describe('Filas del inicio', () => {
  test('una próxima sesión abre sus propios detalles en Mis tutorías', async ({ page }) => {
    await iniciarSesion(page, usuarios.estudiante);
    await simularApi(page, {
      '/api/auth/sesion': usuarios.estudiante,
      '/api/citas/proximas': proximas,
      '/api/citas/historial': [],
      '/api/tutores/recomendados': tutores,
    });

    await page.goto('/');
    const lista = page.getByRole('list', { name: 'Próximas sesiones' });
    await lista.getByRole('link').filter({ hasText: 'Física' }).click();

    await expect(page).toHaveURL('/mis-tutorias?cita=62');
    const dialogo = page.getByRole('dialog', { name: 'Física' });
    await expect(dialogo).toBeVisible();
    await expect(dialogo.getByText('Lucía Pérez')).toBeVisible();

    // Al cerrar, el enlace ya no la vuelve a abrir.
    await dialogo.getByRole('button', { name: 'Cerrar', exact: true }).click();
    await expect(page).toHaveURL('/mis-tutorias');
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Mis tutorías' })).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('"Ver todas" lleva a Mis tutorías sin abrir nada', async ({ page }) => {
    await iniciarSesion(page, usuarios.estudiante);
    await simularApi(page, {
      '/api/auth/sesion': usuarios.estudiante,
      '/api/citas/proximas': proximas,
      '/api/citas/historial': [],
      '/api/tutores/recomendados': tutores,
    });

    await page.goto('/');
    await page.getByRole('link', { name: 'Ver todas' }).click();

    await expect(page).toHaveURL('/mis-tutorias');
    await expect(page.getByRole('list', { name: 'Próximas sesiones' }).getByRole('listitem')).toHaveCount(2);
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('si la sesión ya no existe, Mis tutorías se muestra normal', async ({ page }) => {
    await iniciarSesion(page, usuarios.estudiante);
    await simularApi(page, {
      '/api/auth/sesion': usuarios.estudiante,
      '/api/citas/proximas': proximas,
      '/api/citas/historial': [],
    });

    await page.goto('/mis-tutorias?cita=999');

    await expect(page.getByRole('list', { name: 'Próximas sesiones' }).getByRole('listitem')).toHaveCount(2);
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('alert')).toHaveCount(0);
  });

  test('una solicitud abre Solicitudes con esa fila resaltada', async ({ page }) => {
    await iniciarSesion(page, usuarios.tutor);
    await simularApi(page, {
      '/api/auth/sesion': usuarios.tutor,
      '/api/citas/proximas': [],
      '/api/citas/historial': [],
      '/api/citas/pendientes': pendientes,
    });

    await page.goto('/');
    const lista = page.getByRole('list', { name: 'Solicitudes por responder' });
    await lista.getByRole('link').filter({ hasText: 'Carlos Méndez' }).click();

    await expect(page).toHaveURL('/tutor/mis-tutorias?cita=22');
    const fila = page.getByRole('listitem').filter({ hasText: 'Carlos Méndez' });
    await expect(fila).toHaveAttribute('aria-current', 'true');
    await expect(fila).toBeInViewport();
    await expect(page.getByRole('listitem').filter({ hasText: 'Ana Ruiz' })).not.toHaveAttribute('aria-current');
  });

  test('"Responder" lleva a Solicitudes sin resaltar ninguna', async ({ page }) => {
    await iniciarSesion(page, usuarios.tutor);
    await simularApi(page, {
      '/api/auth/sesion': usuarios.tutor,
      '/api/citas/proximas': [],
      '/api/citas/historial': [],
      '/api/citas/pendientes': pendientes,
    });

    await page.goto('/');
    await page.getByRole('link', { name: 'Responder' }).click();

    await expect(page).toHaveURL('/tutor/mis-tutorias');
    await expect(page.getByRole('listitem').filter({ hasText: 'Ana Ruiz' })).toBeVisible();
    await expect(page.locator('li[aria-current]')).toHaveCount(0);
  });
});
