import { test, expect } from '@playwright/test';
import { iniciarSesion, simularApi, tutores, usuarios } from './helpers';

// Reloj controlado: jueves 22 de octubre de 2026 en la hora de la plataforma.
const hora = (hhmm) => new Date(`2026-10-22T${hhmm}:00-06:00`);

const sesion = {
  id: 61,
  rolOpuestoNombre: 'Mateo Herrera',
  materia: 'Cálculo',
  fechaHoraInicio: '2026-10-22T17:15:00',
  linkReunion: 'https://meet.example.com/calculo',
  tema: 'Límites laterales',
  estado: 'Aceptada',
};

async function abrirInicio(page, usuario, proximas, extra = {}) {
  await page.clock.install({ time: hora('15:00') });
  await iniciarSesion(page, usuario);
  const recibidas = await simularApi(page, {
    '/api/citas/proximas': proximas,
    '/api/citas/pendientes': [],
    '/api/tutores/recomendados': tutores,
    ...extra,
  });
  await page.goto('/');
  return recibidas;
}

const filas = (page) => page.getByRole('list', { name: 'Próximas sesiones' }).getByRole('listitem');

test.describe('Sesión en vivo en el inicio', () => {
  test('cuenta regresiva, unirse, en curso y calificar al terminar en la misma fila', async ({ page }) => {
    const recibidas = await abrirInicio(page, usuarios.estudiante, [sesion], {
      '/api/citas/historial': [{ ...sesion, estado: 'Completada', puntuacion: null }],
      'POST /api/resenas': { resena: { id: 1 }, calificacionPromedio: 4.5 },
    });
    const fila = filas(page).first();
    const unirse = fila.getByRole('link', { name: 'Unirse' });

    // 15:00: faltan 2 h 15 min; la fila abre los detalles y todavía no ofrece unirse.
    await expect(fila.getByText('Empieza en 2 h 15 min · con Mateo Herrera')).toBeVisible();
    await expect(unirse).toHaveCount(0);

    // 17:05: diez minutos antes aparece "Unirse" con el enlace de la cita.
    await page.clock.fastForward('02:05:00');
    await expect(fila.getByText('Empieza en 10 min · con Mateo Herrera')).toBeVisible();
    await expect(unirse).toHaveAttribute('href', sesion.linkReunion);
    await expect(unirse).toHaveAttribute('target', '_blank');

    // 17:20: en curso (solo texto) y el botón sigue.
    await page.clock.fastForward('15:00');
    await expect(fila.getByText('En curso', { exact: true })).toBeVisible();
    await expect(fila.getByText('Termina en 55 min · con Mateo Herrera')).toBeVisible();
    await expect(unirse).toBeVisible();

    // 18:15: terminó; se califica ahí mismo.
    await page.clock.fastForward('55:00');
    await expect(fila.getByText('Terminó · con Mateo Herrera')).toBeVisible();
    await expect(unirse).toHaveCount(0);
    await fila.getByRole('button', { name: 'Calificar' }).click();

    const dialogo = page.getByRole('dialog', { name: 'Calificar tutoría' });
    await dialogo.getByRole('radio', { name: '4 de 5 estrellas' }).check();
    await dialogo.getByRole('button', { name: /Enviar/ }).click();
    await expect(page.getByText('Gracias por tu reseña', { exact: true })).toBeVisible();
    await expect(page.getByText('No tienes sesiones programadas')).toBeVisible();

    // Antes de calificar se pidió el historial (completa la sesión en el backend).
    const rutas = recibidas.map((r) => `${r.metodo} ${r.ruta}`);
    expect(rutas.indexOf('GET /api/citas/historial')).toBeLessThan(rutas.indexOf('POST /api/resenas'));
    expect(recibidas.find((r) => r.ruta === '/api/resenas').cuerpo).toMatchObject({ citaId: 61, puntuacion: 4 });
  });

  test('sin enlace no hay botón para unirse: la fila abre los detalles', async ({ page }) => {
    await abrirInicio(page, usuarios.tutor, [
      { ...sesion, rolOpuestoNombre: 'Ana Ruiz', linkReunion: null, fechaHoraInicio: '2026-10-22T14:30:00' },
    ]);
    const fila = filas(page).first();

    await expect(fila.getByText('Termina en 30 min · con Ana Ruiz')).toBeVisible();
    await expect(fila.getByText('En curso', { exact: true })).toBeVisible();
    await expect(fila.getByRole('link', { name: /Unirse/ })).toHaveCount(0);
    await expect(fila.getByRole('link')).toHaveAttribute('href', '/mis-tutorias');
  });

  test('las pendientes y las de más de un día muestran su fecha, sin cuenta regresiva', async ({ page }) => {
    await abrirInicio(page, usuarios.estudiante, [
      { ...sesion, id: 62, estado: 'Pendiente', fechaHoraInicio: '2026-10-22T16:00:00' },
      { ...sesion, id: 63, fechaHoraInicio: '2026-10-24T10:00:00' },
    ]);

    await expect(filas(page)).toHaveCount(2);
    await expect(page.getByText(/Empieza en/)).toHaveCount(0);
  });
});
