import { test, expect } from '@playwright/test';

test.describe('Flujo de Autenticación Local y Roles', () => {
  test('debe iniciar sesión, seleccionar rol, pasar por intereses y llegar al Dashboard', async ({ page }) => {
    // Interceptar la llamada de Login para simular una respuesta exitosa del Backend
    await page.route('**/api/auth/login', async route => {
      const json = {
        token: 'fake-jwt-token-123',
        id: 1,
        email: 'test@tutoriasu.com',
        nombre: 'Usuario de Prueba',
        rol: 'Nuevo' // Empezamos como "Nuevo" para forzar la pantalla de selección de roles
      };
      await route.fulfill({ json });
    });

    // Interceptar la llamada de Asignar Rol
    await page.route('**/api/auth/asignar-rol', async route => {
      const json = {
        token: 'fake-jwt-token-456',
        id: 1,
        email: 'test@tutoriasu.com',
        nombre: 'Usuario de Prueba',
        rol: 'Estudiante'
      };
      // Pequeño retraso simulado seguro
      await new Promise(r => setTimeout(r, 200));
      await route.fulfill({ json });
    });

    // Interceptar GET de materias
    await page.route('**/api/materias', async route => {
      const json = [
        {id: 1, nombre: 'Matemáticas', categoriaId: 1, categoria: 'Ciencias Exactas'},
        {id: 2, nombre: 'Física', categoriaId: 1, categoria: 'Ciencias Exactas'}
      ];
      await route.fulfill({ json });
    });

    // 1. Ir a la página principal
    await page.goto('/');

    // 2. Llenar el formulario de inicio de sesión
    await page.getByPlaceholder('Correo electrónico').fill('test@tutoriasu.com');
    await page.getByPlaceholder('Contraseña').fill('password123');
    
    // 3. Hacer clic en "Iniciar sesión"
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    // 4. Verificar que aparece la pantalla de selección de roles
    const roleHeading = page.getByRole('heading', { name: 'Selecciona tu perfil' });
    await expect(roleHeading).toBeVisible();

    // 5. Seleccionar "Estudiante"
    await page.getByRole('button', { name: 'Estudiante' }).click();

    // 6. Verificar que ahora se muestra el selector de intereses
    await expect(page).toHaveURL(/\/intereses/);
    const interesesHeading = page.getByRole('heading', {name: '¿Qué materias te interesan?'});
    await expect(interesesHeading).toBeVisible();

    // 7. Omitir intereses para continuar al Dashboard
    await page.getByRole('button', { name: 'Omitir por ahora' }).click();

    // 8. Verificar que ya estamos en el Dashboard
    await expect(page).toHaveURL('/');

    const userMenuButton = page.locator('button[title="Menú de usuario"]');
    await expect(userMenuButton).toBeVisible();

    // 9. Abrir el menú (para probar que funciona)
    await userMenuButton.click();
    
    // 10. Verificar la nueva UI del Dashboard
    await expect(page.getByText('Hola, Usuario').first()).toBeVisible();
    await expect(page.getByText('Panel de estudiante').first()).toBeVisible();
    
    // Verificar que aparece la tarjeta de "Mis Intereses"
    await expect(page.getByRole('link', { name: /Mis Intereses/i })).toBeVisible();
  });
});