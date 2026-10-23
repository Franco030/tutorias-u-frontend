import { test, expect } from './fixtures';
import { iniciarSesion, materias, simularApi, tutores, usuarios } from './helpers';

test.describe('Ayuda e información', () => {
  test('sin sesión: términos, privacidad y ayuda desde el acceso', async ({ page }) => {
    await page.goto('/');
    const legales = page.getByRole('navigation', { name: 'Información' });

    await legales.getByRole('link', { name: 'Términos' }).click();
    await expect(page.getByRole('heading', { name: 'Términos de uso', level: 1 })).toBeVisible();
    // Desde los términos se llega al aviso de privacidad sin recargar.
    await page.getByRole('link', { name: 'Aviso de privacidad' }).click();
    await expect(page.getByRole('heading', { name: 'Aviso de privacidad', level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Tus derechos' })).toBeVisible();

    await page.getByRole('button', { name: 'Volver' }).click();
    await expect(page.getByRole('heading', { name: 'Inicia sesión' })).toBeVisible();

    await legales.getByRole('link', { name: 'Ayuda' }).click();
    await page.getByRole('button', { name: 'Olvidé mi contraseña' }).click();
    await expect(page.getByText('En la pantalla de acceso elige «¿Olvidaste tu contraseña?»', { exact: false })).toBeVisible();
  });

  test('el registro avisa que se aceptan los términos', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Al crear tu cuenta aceptas', { exact: false })).toHaveCount(0);
    await page.getByRole('button', { name: '¿No tienes cuenta? Regístrate' }).click();
    await expect(page.getByText('Al crear tu cuenta aceptas', { exact: false })).toBeVisible();
  });

  test('con sesión: ayuda al pie del menú y acerca de en el menú de usuario', async ({ page }) => {
    await iniciarSesion(page, usuarios.tutor);
    await simularApi(page, { '/api/citas/proximas': [], '/api/citas/pendientes': [], '/api/materias': materias });

    await page.goto('/');
    const ayuda = page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('link', { name: 'Ayuda y soporte' });
    await ayuda.click();
    await expect(page.getByRole('heading', { name: 'Ayuda y soporte', level: 1 })).toBeVisible();
    await expect(ayuda).toHaveAttribute('aria-current', 'page');
    // Para un tutor, sus preguntas van primero.
    await expect(page.getByRole('heading', { level: 2 }).first()).toHaveText('Para tutores');
    // El enlace queda anclado al pie del menú.
    const caja = await ayuda.boundingBox();
    expect(caja.y).toBeGreaterThan((page.viewportSize()?.height ?? 720) - 120);

    await page.getByTitle('Menú de usuario').click();
    await page.getByRole('menuitem', { name: 'Acerca de TutoriasU' }).click();
    await expect(page.getByRole('heading', { name: 'Acerca de TutoriasU', level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Quiénes somos' })).toBeVisible();
  });

  test('en celular las preguntas largas conservan su flecha', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await iniciarSesion(page, usuarios.estudiante);
    await simularApi(page, { '/api/citas/proximas': [], '/api/tutores/recomendados': tutores, '/api/materias': materias });
    await page.goto('/ayuda');
    const larga = page.getByRole('button', { name: '¿Por qué no puedo elegir ciertos días u horarios?' });
    await expect(larga).toBeVisible();
    // Ocupa dos líneas y aun así la flecha mide lo mismo que en las cortas.
    expect((await larga.boundingBox()).height).toBeGreaterThan(50);
    const anchos = await page
      .locator('.fui-AccordionHeader__expandIcon')
      .evaluateAll((iconos) => iconos.map((icono) => icono.getBoundingClientRect().width));
    expect(anchos.length).toBeGreaterThan(10);
    expect(Math.min(...anchos)).toBeGreaterThan(16);
  });

  test('para un estudiante, sus preguntas van primero', async ({ page }) => {
    await iniciarSesion(page, usuarios.estudiante);
    await simularApi(page, { '/api/citas/proximas': [], '/api/tutores/recomendados': tutores, '/api/materias': materias });
    await page.goto('/ayuda');
    await expect(page.getByRole('heading', { level: 2 }).first()).toHaveText('Para estudiantes');
  });

});
