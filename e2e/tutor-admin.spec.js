import { test, expect } from '@playwright/test';
import { enDias, iniciarSesion, rutasTutorReservas, simularApi, usuarios } from './helpers';

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
  // Celda de la rejilla: columna 0 = lunes, celda 0 = 6:00 (cada celda es media hora).
  const celda = (page, col, hora) => page.locator(`[data-celda="${col}-${Math.round((hora - 6) * 2)}"]`);

  async function arrastrar(page, desde, hasta, { shift = false, button = 'left' } = {}) {
    const a = await desde.boundingBox();
    const b = await hasta.boundingBox();
    if (shift) await page.keyboard.down('Shift');
    await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
    await page.mouse.down({ button });
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 6 });
    await page.mouse.up({ button });
    if (shift) await page.keyboard.up('Shift');
  }

  test('pinta franjas arrastrando y las guarda como sesiones de 1 h', async ({ page }) => {
    await iniciarSesion(page, usuarios.tutor);
    const recibidas = await simularApi(page, {
      ...rutasTutorReservas,
      '/api/tutores/11/disponibilidad': [],
      'POST /api/tutores/disponibilidad': (request) => request.postDataJSON(),
    });

    await page.goto('/tutor/disponibilidad');
    // De lunes 9:00 a jueves 12:30 (la celda de 12:30 a 13:00 incluida).
    await arrastrar(page, celda(page, 0, 9), celda(page, 3, 12.5));

    await expect(page.getByText('Lun a jue, de 9:00 a 13:00.')).toBeVisible();
    await expect(page.getByText('16 sesiones de 1 h', { exact: false })).toBeVisible();

    await page.getByRole('button', { name: 'Guardar cambios' }).click();
    await expect(page.getByText('Cambios guardados', { exact: true })).toBeVisible();
    const guardado = recibidas.find((r) => r.metodo === 'POST' && r.ruta === '/api/tutores/disponibilidad');
    expect(guardado.cuerpo).toHaveLength(16);
    expect(guardado.cuerpo[0]).toEqual({ diaSemana: 1, horaInicio: '09:00', horaFin: '10:00' });
  });

  test('avisa al salir con cambios sin guardar', async ({ page }) => {
    await iniciarSesion(page, usuarios.tutor);
    const recibidas = await simularApi(page, {
      ...rutasTutorReservas,
      '/api/citas/proximas': [],
      '/api/tutores/11/disponibilidad': [],
      'POST /api/tutores/disponibilidad': (request) => request.postDataJSON(),
    });
    const irAInicio = () => page.getByRole('navigation').getByRole('link').first().click();
    const dialogo = page.getByRole('dialog', { name: '¿Guardar los cambios?' });

    await page.goto('/tutor/disponibilidad');
    await arrastrar(page, celda(page, 0, 9), celda(page, 0, 10.5));

    // Cancelar: se queda con lo pintado.
    await irAInicio();
    await expect(dialogo).toBeVisible();
    await dialogo.getByRole('button', { name: 'Cancelar' }).click();
    await expect(dialogo).toBeHidden();
    await expect(page).toHaveURL(/\/tutor\/disponibilidad$/);
    await expect(page.getByText('Lun, de 9:00 a 11:00.')).toBeVisible();

    // Guardar: guarda y entonces navega.
    await irAInicio();
    await dialogo.getByRole('button', { name: 'Guardar', exact: true }).click();
    await expect(page).not.toHaveURL(/\/tutor\/disponibilidad$/);
    expect(recibidas.filter((r) => r.metodo === 'POST' && r.ruta === '/api/tutores/disponibilidad')).toHaveLength(1);

    // No guardar: navega sin guardar.
    await page.goto('/tutor/disponibilidad');
    await arrastrar(page, celda(page, 1, 9), celda(page, 1, 9.5));
    await irAInicio();
    await dialogo.getByRole('button', { name: 'No guardar' }).click();
    await expect(page).not.toHaveURL(/\/tutor\/disponibilidad$/);
    expect(recibidas.filter((r) => r.metodo === 'POST' && r.ruta === '/api/tutores/disponibilidad')).toHaveLength(1);

    // Sin cambios no hay aviso.
    await page.goto('/tutor/disponibilidad');
    await expect(page.getByRole('button', { name: 'Guardar cambios' })).toBeDisabled();
    await irAInicio();
    await expect(page).not.toHaveURL(/\/tutor\/disponibilidad$/);
    await expect(dialogo).toBeHidden();
  });

  test('cerrar sesión con cambios sin guardar no se queda atorado', async ({ page }) => {
    await iniciarSesion(page, usuarios.tutor);
    await simularApi(page, { ...rutasTutorReservas, '/api/tutores/11/disponibilidad': [] });

    await page.goto('/tutor/disponibilidad');
    await arrastrar(page, celda(page, 0, 9), celda(page, 0, 10.5));
    await page.getByTitle('Menú de usuario').click();
    await page.getByRole('menuitem', { name: 'Cerrar sesión' }).click();
    await expect(page).not.toHaveURL(/\/tutor\/disponibilidad$/);
    await expect(page.getByRole('dialog')).toBeHidden();
  });

  test('estira el borde de una franja', async ({ page }) => {
    await iniciarSesion(page, usuarios.tutor);
    await simularApi(page, {
      ...rutasTutorReservas,
      '/api/tutores/11/disponibilidad': [{ diaSemana: 2, horaInicio: '09:00:00', horaFin: '10:00:00' }],
    });

    await page.goto('/tutor/disponibilidad');
    const borde = page.locator('[data-grip="fin"][data-dia="2"]');
    const b = await borde.boundingBox();
    const destino = await celda(page, 1, 11.5).boundingBox();
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
    await page.mouse.down();
    await page.mouse.move(b.x + b.width / 2, destino.y + destino.height / 2, { steps: 6 });
    await page.mouse.up();

    await expect(page.getByText('Mar, de 9:00 a 12:00.')).toBeVisible();
  });

  test('avisa la media hora que no completa una sesión', async ({ page }) => {
    await iniciarSesion(page, usuarios.tutor);
    await simularApi(page, { ...rutasTutorReservas, '/api/tutores/11/disponibilidad': [] });

    await page.goto('/tutor/disponibilidad');
    await arrastrar(page, celda(page, 4, 9), celda(page, 4, 10));

    await expect(page.getByText('Vie, de 9:00 a 10:30.')).toBeVisible();
    await expect(page.getByText(/la media hora rayada \(viernes de 10:00 a 10:30\) no se podrá reservar/)).toBeVisible();
  });

  test('borra con Mayús, pinta con el teclado, copia días y deshace', async ({ page }) => {
    await iniciarSesion(page, usuarios.tutor);
    await simularApi(page, {
      ...rutasTutorReservas,
      '/api/tutores/11/disponibilidad': [
        { diaSemana: 1, horaInicio: '09:00:00', horaFin: '10:00:00' },
        { diaSemana: 1, horaInicio: '10:00:00', horaFin: '11:00:00' },
      ],
    });

    await page.goto('/tutor/disponibilidad');
    await expect(page.getByText('Lun, de 9:00 a 11:00.')).toBeVisible();

    // Mayús + arrastrar borra la segunda hora.
    await arrastrar(page, celda(page, 0, 10), celda(page, 0, 10.5), { shift: true });
    await expect(page.getByText('Lun, de 9:00 a 10:00.')).toBeVisible();

    // Teclado: desde lunes 10:00, Espacio pinta media hora y otra más abajo.
    await celda(page, 0, 10).focus();
    await page.keyboard.press('Space');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Space');
    await expect(page.getByText('Lun, de 9:00 a 11:00.')).toBeVisible();

    await page.getByRole('button', { name: 'Copiar el lunes a…' }).click();
    await page.getByRole('menuitem', { name: 'Días hábiles (lun a vie)' }).click();
    await expect(page.getByText('Lun a vie, de 9:00 a 11:00.')).toBeVisible();

    await page.getByRole('button', { name: 'Deshacer' }).click();
    await expect(page.getByText('Lun, de 9:00 a 11:00.')).toBeVisible();

    // El clic derecho borra aunque la herramienta sea Pintar.
    await arrastrar(page, celda(page, 0, 9), celda(page, 0, 9.5), { button: 'right' });
    await expect(page.getByText('Lun, de 10:00 a 11:00.')).toBeVisible();
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
    const rechazar = page.getByRole('button', { name: 'Rechazar solicitud' });
    // El motivo es obligatorio: sin él no se puede rechazar.
    await expect(rechazar).toBeDisabled();
    await page.getByLabel(/Motivo del rechazo/).fill('El comprobante no es legible.');
    await rechazar.click();
    await expect(page.getByText('No hay solicitudes por revisar')).toBeVisible();
    const rechazo = recibidas.find((r) => r.metodo === 'PUT' && r.ruta === '/api/admin/tutores/40/rechazar');
    expect(rechazo?.cuerpo).toEqual({ motivo: 'El comprobante no es legible.' });
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
