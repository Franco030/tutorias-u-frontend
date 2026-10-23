import { test, expect } from './fixtures';
import { enDias, iniciarSesion, simularApi, usuarios } from './helpers';

const proxima = {
  id: 81,
  rolOpuestoNombre: 'Mateo Herrera',
  materia: 'Cálculo',
  fechaHoraInicio: enDias(2),
  estado: 'Aceptada',
  linkReunion: 'https://meet.example.com/calculo',
  tema: 'Límites laterales',
  notas: 'Llevar ejercicios del capítulo 3.',
};

async function abrirDetalles(page, extra = {}) {
  await iniciarSesion(page, usuarios.estudiante);
  const recibidas = await simularApi(page, {
    '/api/auth/sesion': usuarios.estudiante,
    '/api/citas/proximas': [proxima],
    '/api/citas/historial': [],
    ...extra,
  });
  await page.goto('/mis-tutorias');
  await page.getByRole('listitem').filter({ hasText: 'Cálculo' }).getByRole('button').first().click();
  const dialogo = page.getByRole('dialog', { name: 'Cálculo' });
  await expect(dialogo).toBeVisible();
  return { recibidas, dialogo };
}

test.describe('Cancelar una tutoría', () => {
  test('los detalles muestran todo y la cancelación pide confirmar con motivo', async ({ page }) => {
    const { recibidas, dialogo } = await abrirDetalles(page, { 'PUT /api/citas/81/cancelar': null });

    await expect(dialogo.getByRole('link', { name: 'Unirse a la videollamada' })).toHaveAttribute(
      'href',
      'https://meet.example.com/calculo'
    );
    await expect(dialogo.getByText('Límites laterales')).toBeVisible();
    await expect(dialogo.getByText('Llevar ejercicios del capítulo 3.')).toBeVisible();
    // Fluent 2: sin tacha cuando el pie ya tiene con qué cerrar.
    await expect(dialogo.getByRole('button', { name: /^Cerrar/ })).toHaveCount(1);

    // "Volver" deshace la intención sin cancelar nada.
    // El foco pasa al motivo y, con "Volver", regresa al botón: no se pierde.
    await dialogo.getByRole('button', { name: 'Cancelar tutoría' }).click();
    await expect(dialogo.getByLabel('Motivo (opcional)')).toBeFocused();
    await dialogo.getByRole('button', { name: 'Volver' }).click();
    await expect(dialogo.getByText('¿Cancelar esta tutoría?')).toHaveCount(0);
    await expect(dialogo.getByRole('button', { name: 'Cancelar tutoría' })).toBeFocused();

    await dialogo.getByRole('button', { name: 'Cancelar tutoría' }).click();
    await dialogo.getByLabel('Motivo (opcional)').fill('  Me surgió un examen.  ');
    await dialogo.getByRole('button', { name: 'Confirmar cancelación' }).click();

    await expect(dialogo).toBeHidden();
    await expect(page.getByText('Tutoría cancelada').first()).toBeVisible();
    const cancelacion = recibidas.find((r) => r.ruta === '/api/citas/81/cancelar');
    expect(cancelacion.cuerpo).toEqual({ motivo: 'Me surgió un examen.' });

    // Pasa al historial como cancelada.
    await page.getByRole('tab', { name: 'Historial' }).click();
    await expect(page.getByRole('listitem').filter({ hasText: 'Cálculo' }).getByText('Cancelada', { exact: true })).toBeVisible();
  });

  test('si no se puede cancelar, lo dice y el diálogo sigue abierto', async ({ page }) => {
    const { dialogo } = await abrirDetalles(page, {
      'PUT /api/citas/81/cancelar': { status: 409, json: { title: 'La sesión ya empezó.', status: 409 } },
    });

    await dialogo.getByRole('button', { name: 'Cancelar tutoría' }).click();
    await dialogo.getByRole('button', { name: 'Confirmar cancelación' }).click();

    await expect(dialogo.getByText('La sesión ya empezó.')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialogo).toBeHidden();
  });

  test('sin enlace todavía, lo dice; una cancelada no se puede cancelar', async ({ page }) => {
    await iniciarSesion(page, usuarios.estudiante);
    await simularApi(page, {
      '/api/auth/sesion': usuarios.estudiante,
      '/api/citas/proximas': [{ ...proxima, linkReunion: null, tema: null, notas: null }],
      '/api/citas/historial': [{ ...proxima, id: 80, materia: 'Física', estado: 'Cancelada', fechaHoraInicio: enDias(-3) }],
    });
    await page.goto('/mis-tutorias');

    await page.getByRole('listitem').filter({ hasText: 'Cálculo' }).getByRole('button').first().click();
    const dialogo = page.getByRole('dialog', { name: 'Cálculo' });
    await expect(dialogo.getByText('Aún no disponible')).toBeVisible();
    await expect(dialogo.getByText('Quiere repasar')).toHaveCount(0);
    await dialogo.getByRole('button', { name: 'Cerrar', exact: true }).click();

    await page.getByRole('tab', { name: 'Historial' }).click();
    await page.getByRole('listitem').filter({ hasText: 'Física' }).getByRole('button').first().click();
    const cancelada = page.getByRole('dialog', { name: 'Física' });
    await expect(cancelada).toBeVisible();
    await expect(cancelada.getByRole('button', { name: 'Cancelar tutoría' })).toHaveCount(0);
  });
});
