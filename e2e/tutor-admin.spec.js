import { test, expect } from '@playwright/test';
import { enDias, iniciarSesion, simularApi, usuarios } from './helpers';

test.describe('Tutor', () => {
  test('acepta y rechaza solicitudes con aviso', async ({ page }) => {
    await iniciarSesion(page, usuarios.tutor);
    const recibidas = await simularApi(page, {
      '/api/citas/proximas': [],
      '/api/citas/historial': [],
      '/api/citas/pendientes': [
        { id: 21, estudianteNombre: 'Ana Ruiz', materiaNombre: 'Cálculo', fechaHoraInicio: enDias(2), estado: 'Pendiente' },
        { id: 22, estudianteNombre: 'Carlos Méndez', materiaNombre: 'Álgebra', fechaHoraInicio: enDias(3), estado: 'Pendiente' },
      ],
      'PUT /api/citas/21/aceptar': null,
      'PUT /api/citas/22/rechazar': null,
    });

    await page.goto('/tutor/mis-tutorias');

    await page.getByRole('button', { name: 'Aceptar solicitud de Ana Ruiz' }).click();
    await page.getByRole('textbox', { name: 'Enlace de reunión' }).fill('https://meet.example.com/xyz');
    await page.getByRole('button', { name: 'Confirmar tutoría' }).click();
    await expect(page.getByText('Tutoría aceptada', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Rechazar solicitud de Carlos Méndez' }).click();
    await page.getByLabel('Motivo (opcional)').fill('Ese día tengo examen.');
    await page.getByRole('button', { name: 'Rechazar solicitud', exact: true }).click();
    await expect(page.getByText('Solicitud rechazada', { exact: true })).toBeVisible();
    const rechazo = recibidas.find((r) => r.metodo === 'PUT' && r.ruta === '/api/citas/22/rechazar');
    expect(rechazo?.cuerpo).toEqual({ motivo: 'Ese día tengo examen.' });

    await expect(page.getByText('No tienes solicitudes pendientes')).toBeVisible();
    expect(recibidas.find((r) => r.ruta === '/api/citas/21/aceptar')?.cuerpo).toMatchObject({
      linkReunion: 'https://meet.example.com/xyz',
    });
  });
});

test.describe('Disponibilidad', () => {
  test('añade el mismo rango a varios días y omite los que se cruzan', async ({ page }) => {
    await iniciarSesion(page, usuarios.tutor);
    const recibidas = await simularApi(page, {
      '/api/tutores/11/disponibilidad': [{ diaSemana: 3, horaInicio: '09:30:00', horaFin: '10:30:00' }],
      'POST /api/tutores/disponibilidad': (request) => request.postDataJSON(),
    });

    await page.goto('/tutor/disponibilidad');
    await page.getByRole('button', { name: 'Lun a vie' }).click();
    await page.getByRole('button', { name: 'Añadir a 5 días' }).click();

    await expect(page.getByText('El miércoles se omitió porque se cruza con otro horario.', { exact: false })).toBeVisible();
    const semana = page.getByRole('region', { name: 'Tu semana' });
    await expect(semana.getByRole('button', { name: /^Retirar bloque/ })).toHaveCount(5);

    await page.getByRole('button', { name: 'Guardar disponibilidad' }).click();
    const guardado = recibidas.find((r) => r.metodo === 'POST' && r.ruta === '/api/tutores/disponibilidad');
    expect(guardado?.cuerpo.map((b) => b.diaSemana).sort()).toEqual([1, 2, 3, 4, 5]);
  });
});

test.describe('Administración', () => {
  test('revisa el comprobante y rechaza una solicitud', async ({ page }) => {
    await iniciarSesion(page, usuarios.admin);
    const recibidas = await simularApi(page, {
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
      'PUT /api/admin/tutores/40/rechazar': null,
    });

    await page.goto('/admin/aprobaciones');
    await expect(page.getByRole('link', { name: 'Ver comprobante' })).toHaveAttribute(
      'href',
      'https://archivos.example.com/kardex.pdf'
    );
    await expect(page.getByText('Álgebra')).toBeVisible();

    await page.getByRole('button', { name: 'Rechazar a Sofía Treviño' }).click();
    await page.getByRole('button', { name: 'Rechazar solicitud' }).click();
    await expect(page.getByText('No hay solicitudes por revisar')).toBeVisible();
    expect(recibidas.some((r) => r.metodo === 'PUT' && r.ruta === '/api/admin/tutores/40/rechazar')).toBe(true);
  });

  test('el aspirante ve su aprobación sin volver a iniciar sesión', async ({ page }) => {
    const aspirante = { ...usuarios.estudiante, estadoAprobacion: 'Pendiente' };
    await iniciarSesion(page, aspirante);
    await simularApi(page, {
      '/api/auth/sesion': { ...usuarios.tutor, ...aspirante, token: 'fake-jwt-nuevo', rol: 'Tutor', estadoAprobacion: 'Aprobado' },
    });

    await page.goto('/estado-solicitud');
    await expect(page.getByText('Fuiste aprobado como tutor', { exact: true })).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('tutoriasu_token'))).toBe('fake-jwt-nuevo');
  });
});
