import { test, expect } from '@playwright/test';
import { enDias, iniciarSesion, materias, rutasTutorReservas, simularApi, tutores, usuarios } from './helpers';

// Fecha local "AAAA-MM-DD" a n días de hoy (el navegador corre en la zona de la plataforma).
const claveEnDias = (dias) => {
  const fecha = new Date(enDias(dias));
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
};

// Botón del día en un calendario de Fluent; avanza de mes si hace falta.
async function diaDelCalendario(contenedor, dias) {
  const fecha = new Date(enDias(dias));
  if (fecha.getMonth() !== new Date().getMonth()) {
    await contenedor.getByRole('button', { name: 'Mes siguiente' }).click();
  }
  return contenedor
    .getByRole('gridcell')
    .getByRole('button', { name: new RegExp(`^${fecha.getDate()},`) })
    .first();
}

test.describe('Flujo de reservas', () => {
  test('el tutor bloquea un día con motivo y ajusta cómo lo reservan', async ({ page }) => {
    await iniciarSesion(page, usuarios.tutor);
    const recibidas = await simularApi(page, {
      ...rutasTutorReservas,
      '/api/tutores/11/disponibilidad': [],
      'PUT /api/tutores/bloqueos': (request) => ({ bloqueos: request.postDataJSON(), citasAfectadas: 1 }),
      'PUT /api/tutores/preferencias': (request) => request.postDataJSON(),
    });

    await page.goto('/tutor/disponibilidad');
    const guardar = page.getByRole('button', { name: 'Guardar cambios' });
    await expect(guardar).toBeDisabled();

    await page.getByRole('tab', { name: /Días sin tutorías/ }).click();
    await (await diaDelCalendario(page, 2)).click();
    await page.getByRole('textbox', { name: /^Motivo del/ }).fill('Examen final');
    await expect(page.getByRole('tab', { name: 'Días sin tutorías (1)' })).toBeVisible();

    await page.getByRole('tab', { name: 'Reservas' }).click();
    await page.getByRole('combobox', { name: 'Anticipación mínima para reservar' }).click();
    await page.getByRole('option', { name: '1 día' }).click();
    await page.getByRole('textbox', { name: 'Enlace fijo de videollamada' }).fill('https://meet.example.com/mateo');

    await guardar.click();
    await expect(page.getByText('Cambios guardados', { exact: true })).toBeVisible();

    const bloqueos = recibidas.find((r) => r.metodo === 'PUT' && r.ruta === '/api/tutores/bloqueos');
    expect(bloqueos.cuerpo).toEqual([{ fecha: claveEnDias(2), motivo: 'Examen final' }]);
    const preferencias = recibidas.find((r) => r.metodo === 'PUT' && r.ruta === '/api/tutores/preferencias');
    expect(preferencias.cuerpo).toEqual({ antelacionMinimaHoras: 24, linkReunion: 'https://meet.example.com/mateo' });
    // El horario semanal no cambió: no se vuelve a guardar.
    expect(recibidas.some((r) => r.metodo === 'POST' && r.ruta === '/api/tutores/disponibilidad')).toBe(false);

    await page.getByRole('tab', { name: /Días sin tutorías/ }).click();
    await expect(page.getByText(/Tienes 1 cita pendiente o aceptada en un día bloqueado/)).toBeVisible();
  });

  test('el tutor bloquea un rango con Shift + clic y lo edita como uno', async ({ page }) => {
    await iniciarSesion(page, usuarios.tutor);
    const recibidas = await simularApi(page, {
      ...rutasTutorReservas,
      '/api/tutores/11/disponibilidad': [],
      'PUT /api/tutores/bloqueos': (request) => ({ bloqueos: request.postDataJSON(), citasAfectadas: 0 }),
    });
    // Días 2 a 5 del mes siguiente: siempre en el mismo mes y dentro del límite.
    const hoy = new Date();
    const mes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1);
    const nombreMes = mes.toLocaleDateString('es-MX', { month: 'long' });
    const clave = (dia) => `${mes.getFullYear()}-${String(mes.getMonth() + 1).padStart(2, '0')}-0${dia}`;
    const dia = (n) => page.getByRole('grid').getByRole('button', { name: `${n}, ${nombreMes}, ${mes.getFullYear()}`, exact: true });

    await page.goto('/tutor/disponibilidad');
    await page.getByRole('tab', { name: /Días sin tutorías/ }).click();
    await page.getByRole('button', { name: 'Mes siguiente' }).click();
    await dia(2).click();
    await dia(5).click({ modifiers: ['Shift'] });

    const rango = `2–5 de ${nombreMes} de ${mes.getFullYear()}`;
    await expect(page.getByRole('tab', { name: 'Días sin tutorías (4)' })).toBeVisible();
    await expect(page.getByText(rango)).toBeVisible();
    await expect(page.getByText('4 días')).toBeVisible();
    await page.getByRole('textbox', { name: `Motivo del ${rango}` }).fill('Congreso');

    // Desbloquear el 4 y, con Shift, hasta el 5: quedan el 2 y el 3.
    await dia(4).click();
    await dia(5).click({ modifiers: ['Shift'] });
    await expect(page.getByRole('tab', { name: 'Días sin tutorías (2)' })).toBeVisible();

    await page.getByRole('button', { name: 'Guardar cambios' }).click();
    await expect(page.getByText('Cambios guardados', { exact: true })).toBeVisible();
    const bloqueos = recibidas.find((r) => r.metodo === 'PUT' && r.ruta === '/api/tutores/bloqueos');
    expect(bloqueos.cuerpo).toEqual([
      { fecha: clave(2), motivo: 'Congreso' },
      { fecha: clave(3), motivo: 'Congreso' },
    ]);
  });

  test('el estudiante no puede reservar un día bloqueado y envía el tema', async ({ page }) => {
    const disponibilidad = [0, 1, 2, 3, 4, 5, 6].map((dia) => ({
      diaSemana: dia,
      horaInicio: '23:00:00',
      horaFin: '23:59:00',
    }));
    await iniciarSesion(page, usuarios.estudiante);
    const recibidas = await simularApi(page, {
      '/api/citas/proximas': [],
      '/api/tutores/recomendados': tutores,
      '/api/materias': materias,
      '/api/tutores/11': { ...tutores[0], antelacionMinimaHoras: 0 },
      '/api/tutores/11/disponibilidad': disponibilidad,
      '/api/tutores/11/bloqueos': [claveEnDias(1)],
      '/api/citas/ocupadas': [],
      'POST /api/citas/agendar': { id: 99, estado: 'Pendiente' },
    });

    await page.goto('/tutor/11');
    await page.getByRole('button', { name: 'Agendar cita' }).click();
    const dialogo = page.getByRole('dialog');
    await dialogo.getByRole('combobox', { name: /Materia/ }).click();
    await page.getByRole('option', { name: 'Cálculo' }).click();

    await expect(await diaDelCalendario(dialogo, 1)).toBeDisabled();
    await (await diaDelCalendario(dialogo, 2)).click();
    await dialogo.getByRole('radio', { name: /23:00/ }).check();
    await dialogo.getByRole('textbox', { name: /Qué necesitas repasar/ }).fill('Límites laterales');
    await dialogo.getByRole('button', { name: 'Confirmar cita' }).click();

    await expect(dialogo.getByText('Solicitud enviada')).toBeVisible();
    const peticion = recibidas.find((r) => r.metodo === 'POST' && r.ruta === '/api/citas/agendar');
    expect(peticion.cuerpo).toMatchObject({ tutorId: 11, materiaId: 1, tema: 'Límites laterales' });
  });

  test('la antelación del tutor deja fuera los horarios demasiado próximos', async ({ page }) => {
    const disponibilidad = [0, 1, 2, 3, 4, 5, 6].map((dia) => ({
      diaSemana: dia,
      horaInicio: '23:00:00',
      horaFin: '23:59:00',
    }));
    await iniciarSesion(page, usuarios.estudiante);
    await simularApi(page, {
      '/api/citas/proximas': [],
      '/api/materias': materias,
      '/api/tutores/11': { ...tutores[0], antelacionMinimaHoras: 72 },
      '/api/tutores/11/disponibilidad': disponibilidad,
      '/api/tutores/11/bloqueos': [],
      '/api/citas/ocupadas': [],
    });

    await page.goto('/tutor/11');
    await page.getByRole('button', { name: 'Agendar cita' }).click();
    const dialogo = page.getByRole('dialog');

    await expect(dialogo.getByText('Este tutor recibe reservas con al menos 72 h de anticipación.', { exact: false })).toBeVisible();
    // Con 72 h, mañana y pasado mañana quedan fuera; en 4 días ya se puede.
    await expect(await diaDelCalendario(dialogo, 1)).toBeDisabled();
    await expect(await diaDelCalendario(dialogo, 4)).toBeEnabled();
  });

  test('el tutor ve el tema y el enlace fijo ya escrito al aceptar', async ({ page }) => {
    await iniciarSesion(page, usuarios.tutor);
    const recibidas = await simularApi(page, {
      '/api/citas/proximas': [],
      '/api/citas/pendientes': [
        {
          id: 31,
          estudianteNombre: 'Ana Ruiz',
          materiaNombre: 'Cálculo',
          fechaHoraInicio: enDias(2),
          estado: 'Pendiente',
          tema: 'Límites laterales',
        },
      ],
      '/api/tutores/preferencias': { antelacionMinimaHoras: 12, linkReunion: 'https://meet.example.com/mateo' },
      'PUT /api/citas/31/aceptar': null,
    });

    await page.goto('/tutor/mis-tutorias');
    await expect(page.getByText(/“Límites laterales”/)).toBeVisible();

    await page.getByRole('button', { name: 'Aceptar solicitud de Ana Ruiz' }).click();
    const dialogo = page.getByRole('dialog');
    await expect(dialogo.getByText('Límites laterales')).toBeVisible();
    await expect(dialogo.getByRole('textbox', { name: 'Enlace de reunión' })).toHaveValue('https://meet.example.com/mateo');
    await dialogo.getByRole('button', { name: 'Confirmar tutoría' }).click();

    await expect(page.getByText('Tutoría aceptada', { exact: true })).toBeVisible();
    expect(recibidas.find((r) => r.ruta === '/api/citas/31/aceptar')?.cuerpo).toMatchObject({
      linkReunion: 'https://meet.example.com/mateo',
    });
  });
});
