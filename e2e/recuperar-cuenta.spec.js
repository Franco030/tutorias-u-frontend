import { test, expect } from '@playwright/test';
import { simularApi } from './helpers';

const avisoEnvio = /Si hay una cuenta con ese correo, te enviamos un enlace/;

test.describe('Recuperar la cuenta', () => {
  test('pide el enlace para restablecer la contraseña desde el acceso', async ({ page }) => {
    const recibidas = await simularApi(page, {
      'POST /api/auth/recuperar-contrasena': { message: 'ok' },
    });
    await page.goto('/');

    await page.getByRole('button', { name: '¿Olvidaste tu contraseña?' }).click();
    await expect(page.getByRole('heading', { name: 'Restablece tu contraseña', level: 1 })).toBeVisible();
    // Solo el correo: sin contraseña ni proveedores externos.
    await expect(page.getByLabel('Contraseña')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Continuar con Google' })).toHaveCount(0);

    const enviar = page.getByRole('button', { name: 'Enviar enlace' });
    await expect(enviar).toBeDisabled();
    await page.getByLabel(/Correo electrónico/).fill(' ana@example.com ');
    await enviar.click();
    await expect(page.getByText(avisoEnvio)).toBeVisible();
    expect(recibidas.find((r) => r.ruta === '/api/auth/recuperar-contrasena').cuerpo).toEqual({ email: 'ana@example.com' });

    await page.getByRole('button', { name: 'Volver a iniciar sesión' }).click();
    await expect(page.getByRole('heading', { name: 'Inicia sesión', level: 1 })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continuar con Google' })).toBeVisible();
  });

  test('elige una contraseña nueva con el enlace del correo', async ({ page }) => {
    const recibidas = await simularApi(page, {
      'POST /api/auth/restablecer-contrasena': { message: 'ok' },
    });
    await page.goto('/restablecer-contrasena?token=abc.def.ghi');
    await expect(page.getByRole('heading', { name: 'Elige una contraseña nueva', level: 1 })).toBeVisible();

    const cambiar = page.getByRole('button', { name: 'Cambiar contraseña' });
    await page.getByLabel(/Contraseña nueva/).fill('abc');
    await expect(page.getByText('Debe tener al menos 6 caracteres.')).toBeVisible();
    await page.getByLabel(/Contraseña nueva/).fill('nueva456');
    await page.getByLabel(/Confirma la contraseña/).fill('nueva45');
    await expect(page.getByText('Las contraseñas no coinciden.')).toBeVisible();
    await expect(cambiar).toBeDisabled();

    await page.getByLabel(/Confirma la contraseña/).fill('nueva456');
    await cambiar.click();
    await expect(page.getByRole('heading', { name: 'Tu contraseña cambió', level: 1 })).toBeVisible();
    expect(recibidas.find((r) => r.ruta === '/api/auth/restablecer-contrasena').cuerpo).toEqual({
      token: 'abc.def.ghi',
      password: 'nueva456',
    });

    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page.getByRole('heading', { name: 'Inicia sesión', level: 1 })).toBeVisible();
  });

  test('si el enlace venció, lo dice con el mensaje del servidor', async ({ page }) => {
    await simularApi(page, {
      'POST /api/auth/restablecer-contrasena': {
        status: 400,
        json: { title: 'El enlace no es válido o ya venció. Pide uno nuevo desde «¿Olvidaste tu contraseña?».', status: 400 },
      },
    });
    await page.goto('/restablecer-contrasena?token=vencido');
    await page.getByLabel(/Contraseña nueva/).fill('nueva456');
    await page.getByLabel(/Confirma la contraseña/).fill('nueva456');
    await page.getByRole('button', { name: 'Cambiar contraseña' }).click();

    await expect(page.getByText(/El enlace no es válido o ya venció/)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Elige una contraseña nueva' })).toBeVisible();
  });

  test('con el correo sin verificar, el acceso lo dice y ofrece reenviarlo', async ({ page }) => {
    const recibidas = await simularApi(page, {
      'POST /api/auth/login': {
        status: 403,
        json: {
          title: 'Verifica tu correo antes de iniciar sesión. Si no te llegó el correo, puedes pedir otro.',
          status: 403,
          codigo: 'correo-sin-verificar',
        },
      },
      'POST /api/auth/reenviar-verificacion': { message: 'ok' },
    });
    await page.goto('/');
    await page.getByLabel(/Correo electrónico/).fill('ana@example.com');
    await page.getByLabel('Contraseña', { exact: false }).first().fill('clave123');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    await expect(page.getByText(/Verifica tu correo antes de iniciar sesión/)).toBeVisible();
    await expect(page.getByText('El correo o la contraseña no coinciden', { exact: false })).toHaveCount(0);
    await page.getByRole('button', { name: 'Reenviar el correo de verificación' }).click();
    await expect(page.getByText(/te enviamos un correo nuevo/)).toBeVisible();
    expect(recibidas.find((r) => r.ruta === '/api/auth/reenviar-verificacion').cuerpo).toEqual({ email: 'ana@example.com' });
  });

  test('un enlace de verificación vencido deja pedir otro ahí mismo', async ({ page }) => {
    const recibidas = await simularApi(page, {
      '/api/auth/verify-email': {
        status: 400,
        json: { title: 'El enlace de verificación no es válido o ha expirado.', status: 400 },
      },
      'POST /api/auth/reenviar-verificacion': { message: 'ok' },
    });
    await page.goto('/verificar-correo?token=viejo');

    await expect(page.getByRole('heading', { name: 'No pudimos verificar tu correo', level: 1 })).toBeVisible();
    await page.getByLabel(/Correo electrónico/).fill('ana@example.com');
    await page.getByRole('button', { name: 'Reenviar el correo de verificación' }).click();
    await expect(page.getByText(/te enviamos un correo nuevo/)).toBeVisible();
    expect(recibidas.find((r) => r.ruta === '/api/auth/reenviar-verificacion').cuerpo).toEqual({ email: 'ana@example.com' });
  });
});
