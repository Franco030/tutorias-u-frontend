import { test, expect } from './fixtures';
import { iniciarSesion, simularApi, usuarios } from './helpers';

// Con el menú abierto, elegir una página lo cierra con su transición y las
// escuadras se deslizan al nuevo elemento. Antes, el límite de errores con
// `key` por ruta volvía a montar el shell entero: el menú aparecía ya cerrado
// y las escuadras saltaban sin movimiento.
test('elegir una página con el menú abierto lo cierra con transición, sin rehacer el shell', async ({ page }) => {
  await iniciarSesion(page, usuarios.tutor);
  await simularApi(page, {
    '/api/auth/sesion': usuarios.tutor,
    '/api/citas/proximas': [],
    '/api/citas/pendientes': [],
    '/api/citas/historial': [],
  });
  await page.goto('/');

  const nav = page.getByRole('navigation', { name: 'Navegación principal' });
  await page.getByRole('button', { name: 'Abrir navegación' }).click();
  await expect(nav.getByText('Mis tutorías')).toBeVisible();
  await page.waitForTimeout(400); // termina la apertura

  // Marca el panel para saber si es el mismo elemento después de navegar.
  await page.evaluate(() => {
    const panel = document.querySelector('nav[aria-label="Navegación principal"]').parentElement;
    panel.dataset.prueba = 'mismo';
  });

  const muestras = page.evaluate(
    () =>
      new Promise((resolver) => {
        const nav = document.querySelector('nav[aria-label="Navegación principal"]');
        const panel = nav.parentElement;
        const escuadras = nav.querySelector(':scope > span[aria-hidden="true"]');
        const datos = [];
        const t0 = performance.now();
        const medir = () => {
          const caja = escuadras.getBoundingClientRect();
          datos.push({ ancho: Math.round(caja.width), arriba: Math.round(caja.top), conectado: panel.isConnected });
          if (performance.now() - t0 < 450) requestAnimationFrame(medir);
          else resolver(datos);
        };
        requestAnimationFrame(medir);
      })
  );
  await nav.getByRole('link', { name: 'Mis tutorías' }).click();
  const datos = await muestras;

  await expect(page).toHaveURL('/mis-tutorias');
  expect(datos.every((d) => d.conectado)).toBe(true);
  expect(await page.evaluate(() => document.querySelector('[data-prueba="mismo"]') !== null)).toBe(true);

  const inicio = datos[0];
  const fin = datos[datos.length - 1];
  expect(fin.ancho).toBe(40); // cuadrado del riel
  expect(fin.arriba).toBeGreaterThan(inicio.arriba); // bajó al nuevo elemento
  // Hay pasos intermedios: se encoge y se desliza, no salta.
  expect(datos.some((d) => d.ancho > 40 && d.ancho < inicio.ancho)).toBe(true);
  expect(datos.some((d) => d.arriba > inicio.arriba && d.arriba < fin.arriba)).toBe(true);
});
