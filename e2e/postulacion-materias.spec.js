import { test, expect } from './fixtures';
import { iniciarSesion, materias, simularApi, tutores, usuarios } from './helpers';

// Mosaico del catálogo de materias (botón con aria-pressed).
const materia = (page, nombre) => page.locator('button[aria-pressed]', { hasText: nombre });

const responderCuestionario = async (page) => {
  await page.getByRole('radio', { name: 'Explicarlo de una manera diferente' }).check();
  await page.getByRole('radio', { name: 'Que el estudiante comprenda el tema' }).check();
  await page.getByRole('radio', { name: 'Ayudarle a identificar el error y explicarle cómo corregirlo' }).check();
};

const archivo = (name, mimeType, tamano = 1024) => ({ name, mimeType, buffer: Buffer.alloc(tamano, 1) });

test.describe('Postulación como tutor', () => {
  test('completa las tres partes, envía y pasa al estado de la solicitud', async ({ page }) => {
    await iniciarSesion(page, usuarios.estudiante);
    let estadoAprobacion = 'Ninguno';
    const recibidas = await simularApi(page, {
      '/api/materias': materias,
      '/api/auth/sesion': () => ({ ...usuarios.estudiante, estadoAprobacion }),
      'POST /api/files/upload': { url: '/archivos/kardex.pdf' },
      'POST /api/tutores/aplicar': () => {
        estadoAprobacion = 'Pendiente';
        return null;
      },
    });

    await page.goto('/aplicar-tutor');
    await expect(page.getByRole('heading', { name: 'Conviértete en tutor' })).toBeVisible();
    const enviar = page.getByRole('button', { name: 'Enviar postulación' });
    await expect(enviar).toBeDisabled();
    await expect(page.getByText('Falta completar: materias, comprobante, cuestionario.')).toBeVisible();

    await materia(page, 'Cálculo').click();
    await materia(page, 'Física').click();

    // Las mismas reglas que el servidor: tipo y tamaño.
    const input = page.locator('#file-upload');
    await input.setInputFiles(archivo('notas.docx', 'application/msword'));
    await expect(page.getByText('Solo se aceptan archivos PDF, PNG, JPG o WEBP.')).toBeVisible();
    await input.setInputFiles(archivo('enorme.pdf', 'application/pdf', 6 * 1024 * 1024));
    await expect(page.getByText('El archivo supera los 5 MB. Elige uno más ligero.')).toBeVisible();
    await input.setInputFiles(archivo('kardex.pdf', 'application/pdf'));
    await expect(page.getByText('kardex.pdf')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cambiar archivo' })).toBeVisible();

    await responderCuestionario(page);
    await expect(page.getByText('Todo listo para enviar.')).toBeVisible();

    // El indicador de progreso lleva a cada parte.
    const progreso = page.getByRole('list', { name: 'Progreso de la postulación' });
    await progreso.getByRole('button', { name: /Comprobante.*\(completo\)/ }).click();
    await expect(page.locator('#comprobante')).toBeFocused();
    await enviar.click();

    await expect(page).toHaveURL('/estado-solicitud');
    await expect(page.getByText('Solicitud en revisión', { exact: true })).toBeVisible();

    // Una URL relativa del servidor se completa con el origen de la app.
    const aplicar = recibidas.find((r) => r.ruta === '/api/tutores/aplicar');
    expect(aplicar.cuerpo.urlCredencial).toBe('http://localhost:5173/archivos/kardex.pdf');
    expect(aplicar.cuerpo.materiaIds.sort()).toEqual([1, 3]);
  });

  test('si el envío falla, lo dice y deja reintentar', async ({ page }) => {
    await iniciarSesion(page, usuarios.estudiante);
    await simularApi(page, {
      '/api/materias': materias,
      '/api/auth/sesion': usuarios.estudiante,
      'POST /api/files/upload': 'https://archivos.example.com/kardex.pdf',
      'POST /api/tutores/aplicar': { status: 409, json: { title: 'Ya tienes una solicitud pendiente.', status: 409 } },
    });

    await page.goto('/aplicar-tutor');
    await materia(page, 'Álgebra').click();
    await page.locator('#file-upload').setInputFiles(archivo('kardex.png', 'image/png'));
    await responderCuestionario(page);
    await page.getByRole('button', { name: 'Enviar postulación' }).click();

    await expect(page.getByText('Ya tienes una solicitud pendiente.')).toBeVisible();
    await expect(page).toHaveURL('/aplicar-tutor');
    await expect(page.getByRole('button', { name: 'Enviar postulación' })).toBeEnabled();
  });

  test('con una solicitud ya enviada lleva al estado; rechazada lo dice', async ({ page }) => {
    const rechazado = { ...usuarios.estudiante, estadoAprobacion: 'Rechazado' };
    await iniciarSesion(page, rechazado);
    await simularApi(page, { '/api/auth/sesion': rechazado });

    await page.goto('/aplicar-tutor');
    await expect(page).toHaveURL('/estado-solicitud');
    await expect(page.getByText('Solicitud rechazada', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: /inicio/i }).click();
    await expect(page).toHaveURL('/');
  });
});

test.describe('Materias del tutor', () => {
  test('marca las que ya imparte, guarda los cambios y avisa', async ({ page }) => {
    await iniciarSesion(page, usuarios.tutor);
    const recibidas = await simularApi(page, {
      '/api/auth/sesion': usuarios.tutor,
      '/api/materias': materias,
      // El servidor devuelve nombres; acentos y mayúsculas no deben importar.
      '/api/tutores/11': { ...tutores[0], materias: ['calculo', 'ÁLGEBRA'] },
      'PUT /api/tutores/mis-materias': null,
    });

    await page.goto('/tutor/mis-materias');
    await expect(page.getByRole('heading', { name: 'Materias que imparto' })).toBeVisible();
    const guardar = page.getByRole('button', { name: 'Guardar cambios' });
    await expect(page.getByRole('button', { name: 'Quitar Cálculo' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Quitar Álgebra' })).toBeVisible();
    await expect(guardar).toBeDisabled();

    await page.getByRole('button', { name: 'Quitar Álgebra' }).click();
    await materia(page, 'Programación').click();
    await guardar.click();

    await expect(page.getByText('Materias guardadas', { exact: true })).toBeVisible();
    await expect(guardar).toBeDisabled();
    const cambio = recibidas.find((r) => r.metodo === 'PUT' && r.ruta === '/api/tutores/mis-materias');
    expect(cambio.cuerpo.materiaIds.sort()).toEqual([1, 4]);
  });

  test('si no se guardan, lo dice y conserva la selección', async ({ page }) => {
    await iniciarSesion(page, usuarios.tutor);
    await simularApi(page, {
      '/api/auth/sesion': usuarios.tutor,
      '/api/materias': materias,
      '/api/tutores/11': { status: 500 },
      'PUT /api/tutores/mis-materias': { status: 500 },
    });

    await page.goto('/tutor/mis-materias');
    await materia(page, 'Física').click();
    await page.getByRole('button', { name: 'Guardar cambios' }).click();

    await expect(page.getByText('No se pudieron guardar tus materias. Intenta nuevamente.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Quitar Física' })).toBeVisible();
  });
});

test.describe('Mis intereses', () => {
  test('el estudiante cambia sus intereses y los guarda', async ({ page }) => {
    await iniciarSesion(page, usuarios.estudiante);
    const recibidas = await simularApi(page, {
      '/api/auth/sesion': usuarios.estudiante,
      '/api/materias': materias,
      '/api/estudiantes/intereses': [{ id: 1, nombre: 'Cálculo' }],
      'POST /api/estudiantes/intereses': { message: 'ok', materiaIds: [1, 3] },
    });

    await page.goto('/intereses');
    await expect(page.getByRole('heading', { name: 'Mis intereses' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Quitar Cálculo' })).toBeVisible();

    await materia(page, 'Física').click();
    await page.getByRole('button', { name: 'Guardar cambios' }).click();

    await expect(page.getByText('Intereses guardados', { exact: true })).toBeVisible();
    const guardado = recibidas.find((r) => r.metodo === 'POST' && r.ruta === '/api/estudiantes/intereses');
    expect(guardado.cuerpo.materiaIds.sort()).toEqual([1, 3]);
  });

  test('si el catálogo no carga, lo dice', async ({ page }) => {
    await iniciarSesion(page, usuarios.estudiante);
    await simularApi(page, {
      '/api/auth/sesion': usuarios.estudiante,
      '/api/materias': { status: 500 },
      '/api/estudiantes/intereses': [],
    });

    await page.goto('/intereses');
    await expect(page.getByText('No se pudieron cargar las materias. Intenta nuevamente.')).toBeVisible();
  });
});

test.describe('Aprobación de tutores', () => {
  const solicitud = (id, nombre) => ({
    id,
    nombre,
    correo: `${nombre.split(' ')[0].toLowerCase()}@universidad.edu`,
    urlCredencial: null,
    fechaSolicitud: '2026-10-01T10:00:00',
    materias: ['Cálculo'],
  });

  test('aprueba una solicitud y la quita de la lista', async ({ page }) => {
    await iniciarSesion(page, usuarios.admin);
    await simularApi(page, {
      '/api/auth/sesion': usuarios.admin,
      '/api/admin/solicitudes': [solicitud(40, 'Sofía Treviño'), solicitud(41, 'Iván Ríos')],
      'PUT /api/admin/tutores/40/aprobar': null,
    });

    await page.goto('/admin/aprobaciones');
    await expect(page.getByRole('heading', { name: 'Solicitudes pendientes (2)' })).toBeVisible();
    await page.getByRole('listitem').filter({ hasText: 'Sofía Treviño' }).getByRole('button', { name: 'Aprobar' }).click();

    await expect(page.getByText('Sofía Treviño ya puede configurar sus materias y horarios.', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Solicitudes pendientes (1)' })).toBeVisible();
    await expect(page.getByRole('listitem').filter({ hasText: 'Iván Ríos' })).toBeVisible();
  });

  test('si no cargan, ofrece reintentar', async ({ page }) => {
    await iniciarSesion(page, usuarios.admin);
    let caido = true;
    await simularApi(page, {
      '/api/auth/sesion': usuarios.admin,
      '/api/admin/solicitudes': () => (caido ? { status: 503, json: { title: 'Servicio no disponible.', status: 503 } } : []),
    });

    await page.goto('/admin/aprobaciones');
    await expect(page.getByText('Servicio no disponible.')).toBeVisible();
    caido = false;
    await page.getByRole('button', { name: 'Reintentar' }).click();
    await expect(page.getByText('No hay solicitudes por revisar')).toBeVisible();
  });

  test('si aprobar falla, la solicitud sigue ahí con el error', async ({ page }) => {
    await iniciarSesion(page, usuarios.admin);
    await simularApi(page, {
      '/api/auth/sesion': usuarios.admin,
      '/api/admin/solicitudes': [solicitud(40, 'Sofía Treviño')],
      'PUT /api/admin/tutores/40/aprobar': { status: 404, json: { title: 'La solicitud ya no está pendiente.', status: 404 } },
    });

    await page.goto('/admin/aprobaciones');
    await page.getByRole('button', { name: 'Aprobar' }).click();
    await expect(page.getByText('La solicitud ya no está pendiente.')).toBeVisible();
    await expect(page.getByRole('listitem').filter({ hasText: 'Sofía Treviño' })).toBeVisible();
  });
});
