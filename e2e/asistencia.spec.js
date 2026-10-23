import { test, expect } from './fixtures';
import { enDias, iniciarSesion, simularApi, usuarios } from './helpers';

const terminada = {
  id: 71,
  rolOpuestoNombre: 'Ana Ruiz',
  materia: 'Cálculo',
  fechaHoraInicio: enDias(-1),
  estado: 'Aceptada',
  puntuacion: null,
};

test.describe('Cierre de la sesión en Mis tutorías', () => {
  test('el tutor confirma desde el historial y la fila cambia de estado', async ({ page }) => {
    await iniciarSesion(page, usuarios.tutor);
    const recibidas = await simularApi(page, {
      '/api/citas/proximas': [],
      '/api/citas/historial': [terminada, { ...terminada, id: 72, rolOpuestoNombre: 'Luis Mora', materia: 'Física' }],
      'PUT /api/citas/71/completar': { mensaje: 'ok' },
      'PUT /api/citas/72/no-asistio': { mensaje: 'ok' },
    });
    await page.goto('/mis-tutorias');
    await page.getByRole('tab', { name: 'Historial' }).click();

    const calculo = page.getByRole('listitem').filter({ hasText: 'Cálculo' });
    const seImpartio = calculo.getByRole('button', { name: 'Se impartió' });
    await expect(seImpartio).toHaveAccessibleDescription(/Cálculo.*Ana Ruiz/);
    await seImpartio.click();
    await expect(calculo.getByText('Completada')).toBeVisible();
    await expect(calculo.getByRole('button', { name: 'Se impartió' })).toHaveCount(0);

    const fisica = page.getByRole('listitem').filter({ hasText: 'Física' });
    await fisica.getByRole('button', { name: 'No asistió' }).click();
    await expect(fisica.getByText('No asistió', { exact: true })).toBeVisible();
    await expect(fisica.getByRole('button')).toHaveCount(1); // solo la fila, que abre los detalles

    expect(recibidas.filter((r) => r.metodo === 'PUT').map((r) => r.ruta)).toEqual([
      '/api/citas/71/completar',
      '/api/citas/72/no-asistio',
    ]);
  });

  test('el estudiante ve la sesión por confirmar y todavía no la califica', async ({ page }) => {
    await iniciarSesion(page, usuarios.estudiante);
    await simularApi(page, {
      '/api/citas/proximas': [],
      '/api/citas/historial': [{ ...terminada, rolOpuestoNombre: 'Mateo Herrera' }],
    });
    await page.goto('/mis-tutorias');
    await page.getByRole('tab', { name: 'Historial' }).click();

    const fila = page.getByRole('listitem').filter({ hasText: 'Cálculo' });
    await expect(fila.getByText('Por confirmar')).toBeVisible();
    await expect(fila.getByRole('button', { name: 'Calificar' })).toHaveCount(0);
    await expect(fila.getByRole('button', { name: 'Se impartió' })).toHaveCount(0);
  });
});
