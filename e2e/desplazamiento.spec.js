import { test, expect } from './fixtures';
import { iniciarSesion, materias, simularApi, tutores, usuarios } from './helpers';

// Chromium sin interfaz oculta las barras de desplazamiento; aquí se necesitan
// reales para ver si el contenido se recorre cuando aparecen.
test.use({ launchOptions: { ignoreDefaultArgs: ['--hide-scrollbars'] } });

test.describe('Barra de desplazamiento', () => {
  test('abrir preguntas no recorre el contenido cuando aparece el scroll', async ({ page }) => {
    const lienzo = () =>
      page.evaluate(() => {
        const main = document.querySelector('main');
        let el = main;
        while (el && getComputedStyle(el).overflowY !== 'auto') el = el.parentElement;
        // Alto real del contenido (scrollHeight nunca baja del alto visible).
        const contenido = main.getBoundingClientRect().bottom - el.getBoundingClientRect().top + el.scrollTop;
        return { contenido: Math.ceil(contenido), visible: el.clientHeight };
      });

    await page.setViewportSize({ width: 1440, height: 1600 });
    await iniciarSesion(page, usuarios.estudiante);
    await simularApi(page, { '/api/citas/proximas': [], '/api/tutores/recomendados': tutores, '/api/materias': materias });
    await page.goto('/ayuda');
    const contacto = page.getByRole('complementary', { name: '¿No encontraste tu respuesta?' });
    await expect(contacto).toBeVisible();
    await page.waitForTimeout(500);
    // Ventana justo más alta que la página cerrada: sin scroll hasta abrir preguntas.
    const { contenido, visible } = await lienzo();
    await page.setViewportSize({ width: 1440, height: 1600 - visible + contenido + 8 });
    await page.waitForTimeout(200);
    const antes = await contacto.boundingBox();

    for (const pregunta of ['¿Cómo reservo una tutoría?', '¿Cómo me vuelvo tutor?', '¿Cómo marco mi horario?', 'Olvidé mi contraseña']) {
      await page.getByRole('button', { name: pregunta }).click();
    }
    await page.waitForTimeout(500);
    const despues = await lienzo();
    expect(despues.contenido, 'la página ya debe tener scroll').toBeGreaterThan(despues.visible);
    expect((await contacto.boundingBox()).x).toBe(antes.x);
  });
});
