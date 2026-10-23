import { test, expect } from './fixtures';
import {
  enDias,
  historialPorCalificar,
  iniciarSesion,
  materias,
  rutasPerfilTutor,
  simularApi,
  tutores,
  usuarios,
} from './helpers';

const rutasEstudiante = {
  '/api/citas/proximas': [],
  '/api/citas/historial': [],
  '/api/tutores/recomendados': tutores,
  '/api/tutores': tutores,
  '/api/materias': materias,
  '/api/estudiantes/intereses': [1],
};

test.describe('Estudiante', () => {
  test('el onboarding omitido se conserva al recargar', async ({ page }) => {
    // Al recargar, la app pide la sesión al servidor: el indicador debe venir de ahí.
    let onboardingCompleto = false;
    const recibidas = await simularApi(page, {
      ...rutasEstudiante,
      'POST /api/auth/login': () => ({ ...usuarios.estudiante, onboardingCompleto }),
      'GET /api/auth/sesion': () => ({ ...usuarios.estudiante, onboardingCompleto }),
      'POST /api/estudiantes/intereses/omitir': () => {
        onboardingCompleto = true;
        return null;
      },
    });

    await page.goto('/');
    await page.getByRole('textbox', { name: 'Correo electrónico' }).fill('ana.ruiz@universidad.edu');
    await page.locator('#password').fill('prueba123');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    await page.goto('/intereses');
    await expect(page.getByRole('heading', { name: '¿Qué materias te interesan?' })).toBeVisible();
    await page.getByRole('button', { name: 'Omitir por ahora' }).click();
    await expect(page).toHaveURL('/');
    expect(recibidas.some((r) => r.ruta === '/api/estudiantes/intereses/omitir')).toBe(true);

    await page.goto('/intereses');
    await expect(page.getByRole('heading', { name: 'Mis intereses' })).toBeVisible();
  });

  test('si no se puede omitir, se queda en el onboarding con el error', async ({ page }) => {
    await iniciarSesion(page, { ...usuarios.estudiante, onboardingCompleto: false });
    await simularApi(page, {
      ...rutasEstudiante,
      'GET /api/auth/sesion': { ...usuarios.estudiante, onboardingCompleto: false },
      'POST /api/estudiantes/intereses/omitir': { status: 500, json: { title: 'Servidor caído.', status: 500 } },
    });

    await page.goto('/intereses');
    await page.getByRole('button', { name: 'Omitir por ahora' }).click();

    await expect(page.getByText('Servidor caído.')).toBeVisible();
    await expect(page.getByRole('heading', { name: '¿Qué materias te interesan?' })).toBeVisible();
  });

  test('una sesión expirada vuelve al acceso con un aviso', async ({ page }) => {
    await iniciarSesion(page, usuarios.estudiante);
    await simularApi(page, {
      ...rutasEstudiante,
      '/api/citas/proximas': { status: 401 },
    });

    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Inicia sesión' })).toBeVisible();
    await expect(page.getByText('Tu sesión ha expirado')).toBeVisible();
  });

  test('busca desde la barra superior y filtra el catálogo', async ({ page }) => {
    await iniciarSesion(page, usuarios.estudiante);
    await simularApi(page, rutasEstudiante);

    await page.goto('/');
    const busqueda = page.getByRole('searchbox', { name: 'Buscar tutores o materias' });
    await busqueda.fill('física');
    await busqueda.press('Enter');

    await expect(page).toHaveURL(/\/tutores\?q=f%C3%ADsica/);
    await expect(page.getByRole('link', { name: /Lucía Campos/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Mateo Herrera/ })).toHaveCount(0);

    await page.getByRole('searchbox', { name: 'Buscar por nombre o materia' }).fill('');
    await page.getByRole('tab', { name: 'Tecnología' }).click();
    await expect(page.getByRole('link', { name: /Diego Salinas/ })).toBeVisible();
    await expect(page.locator('a[href^="/tutor/"]')).toHaveCount(1);
  });

  test('agenda una cita eligiendo día en el calendario', async ({ page }) => {
    await iniciarSesion(page, usuarios.estudiante);
    // El tutor atiende todos los días a las 23:00 UTC, siempre en el futuro.
    const disponibilidad = [0, 1, 2, 3, 4, 5, 6].map((dia) => ({
      diaSemana: dia,
      horaInicio: '23:00',
      horaFin: '23:59',
    }));
    const recibidas = await simularApi(page, {
      ...rutasEstudiante,
      '/api/tutores/11': tutores[0],
      '/api/tutores/11/disponibilidad': disponibilidad,
      '/api/citas/ocupadas': [],
      'POST /api/citas/agendar': { id: 99, estado: 'Pendiente' },
    });

    await page.goto('/tutor/11');
    await expect(page.getByRole('heading', { name: 'Mateo Herrera' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Horario semanal' })).toBeVisible();

    await page.getByRole('button', { name: 'Agendar cita' }).click();
    const dialogo = page.getByRole('dialog');
    await dialogo.getByRole('combobox', { name: /Materia/ }).click();
    await page.getByRole('option', { name: 'Cálculo' }).click();

    // Primer día habilitado del calendario (mañana como muy tarde).
    const manana = new Date(enDias(1));
    await dialogo
      .getByRole('gridcell')
      .getByRole('button', { name: new RegExp(`^${manana.getDate()},`) })
      .first()
      .click();

    await dialogo.getByRole('radio', { name: /23:00/ }).check();
    await dialogo.getByRole('button', { name: 'Confirmar cita' }).click();

    await expect(dialogo.getByText('Solicitud enviada')).toBeVisible();
    const peticion = recibidas.find((r) => r.metodo === 'POST' && r.ruta === '/api/citas/agendar');
    expect(peticion?.cuerpo).toMatchObject({ tutorId: 11, materiaId: 1 });
  });

  test('muestra "Unirse" en sesiones con enlace de reunión', async ({ page }) => {
    await iniciarSesion(page, usuarios.estudiante);
    await simularApi(page, {
      ...rutasEstudiante,
      '/api/citas/proximas': [
        {
          id: 1,
          materia: 'Cálculo',
          rolOpuestoNombre: 'Mateo Herrera',
          fechaHoraInicio: enDias(1),
          estado: 'Aceptada',
          linkReunion: 'https://meet.example.com/abc',
        },
      ],
    });

    await page.goto('/mis-tutorias');
    const unirse = page.getByRole('listitem').filter({ hasText: 'Cálculo' }).getByRole('link', { name: 'Unirse' });
    // El contexto de la fila va como descripción, no en el nombre del botón.
    await expect(unirse).toHaveAccessibleDescription(/Cálculo.*con Mateo Herrera/);
    await expect(unirse).toHaveAttribute('href', 'https://meet.example.com/abc');
    await expect(unirse).toHaveAttribute('target', '_blank');
  });

  test('califica una tutoría completada desde el historial', async ({ page }) => {
    await iniciarSesion(page, usuarios.estudiante);
    const recibidas = await simularApi(page, {
      ...rutasEstudiante,
      '/api/citas/historial': historialPorCalificar,
      'POST /api/resenas': { resena: { id: 1 }, calificacionPromedio: 4.5 },
    });

    await page.goto('/mis-tutorias');
    await page.getByRole('tab', { name: 'Historial' }).click();
    // La sesión ya calificada no ofrece calificar otra vez.
    await expect(page.getByRole('listitem').filter({ hasText: 'Álgebra' }).getByRole('button', { name: 'Calificar' })).toHaveCount(0);
    await page.getByRole('listitem').filter({ hasText: 'Cálculo' }).getByRole('button', { name: 'Calificar' }).click();

    const dialogo = page.getByRole('dialog', { name: 'Calificar tutoría' });
    const enviar = dialogo.getByRole('button', { name: 'Enviar reseña' });
    await expect(enviar).toBeDisabled();
    await dialogo.getByRole('radio', { name: '5 de 5 estrellas' }).check();
    await dialogo.getByLabel('Comentario (opcional)').fill('Explica con mucha paciencia.');
    await enviar.click();

    await expect(dialogo).toBeHidden();
    await expect(page.getByText('Gracias por tu reseña', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /Calificar Cálculo/ })).toHaveCount(0);
    const peticion = recibidas.find((r) => r.metodo === 'POST' && r.ruta === '/api/resenas');
    expect(peticion?.cuerpo).toEqual({ citaId: 5, puntuacion: 5, comentario: 'Explica con mucha paciencia.' });
  });

  test('si la reseña no se guarda, lo dice y conserva lo escrito', async ({ page }) => {
    await iniciarSesion(page, usuarios.estudiante);
    await simularApi(page, {
      ...rutasEstudiante,
      '/api/citas/historial': historialPorCalificar,
      'POST /api/resenas': { status: 409, json: { title: 'Esta tutoría ya fue calificada.', status: 409 } },
    });

    await page.goto('/mis-tutorias');
    await page.getByRole('tab', { name: 'Historial' }).click();
    await page.getByRole('listitem').filter({ hasText: 'Cálculo' }).getByRole('button', { name: 'Calificar' }).click();
    const dialogo = page.getByRole('dialog', { name: 'Calificar tutoría' });
    await dialogo.getByRole('radio', { name: '3 de 5 estrellas' }).check();
    await dialogo.getByLabel('Comentario (opcional)').fill('Bien.');
    await dialogo.getByRole('button', { name: 'Enviar reseña' }).click();

    await expect(dialogo.getByText('Esta tutoría ya fue calificada.')).toBeVisible();
    await expect(dialogo.getByLabel('Comentario (opcional)')).toHaveValue('Bien.');
    await dialogo.getByRole('button', { name: 'Cancelar' }).click();
    await expect(dialogo).toBeHidden();
  });

  test('en el onboarding guarda las materias elegidas; si falla, lo dice', async ({ page }) => {
    let fallar = true;
    await iniciarSesion(page, { ...usuarios.estudiante, onboardingCompleto: false });
    const recibidas = await simularApi(page, {
      ...rutasEstudiante,
      'GET /api/auth/sesion': { ...usuarios.estudiante, onboardingCompleto: false },
      'POST /api/estudiantes/intereses': () =>
        fallar ? { status: 500, json: { title: 'No se pudo guardar.', status: 500 } } : { materiaIds: [2] },
    });

    await page.goto('/intereses');
    const guardar = page.getByRole('button', { name: 'Guardar y continuar' });
    await expect(guardar).toBeDisabled();
    await page.locator('button[aria-pressed]', { hasText: 'Álgebra' }).click();
    await guardar.click();
    await expect(page.getByText('No se pudo guardar.')).toBeVisible();

    fallar = false;
    await guardar.click();
    await expect(page).toHaveURL('/');
    const guardado = recibidas.findLast((r) => r.ruta === '/api/estudiantes/intereses' && r.metodo === 'POST');
    expect(guardado.cuerpo).toEqual({ materiaIds: [2] });
  });

  test('el perfil del tutor muestra promedio, total y reseñas', async ({ page }) => {
    await iniciarSesion(page, usuarios.estudiante);
    await simularApi(page, { ...rutasEstudiante, ...rutasPerfilTutor });

    await page.goto('/tutor/11');
    await expect(page.getByText('4.7 de 5 · 3 opiniones')).toBeVisible();
    const resenas = page.getByRole('region', { name: 'Reseñas de estudiantes' });
    await expect(resenas.getByText('4.7', { exact: true })).toBeVisible();
    await expect(resenas.getByText('5 estrellas: 2 opiniones')).toBeAttached();
    await expect(resenas.getByText('Excelente tutor.')).toBeVisible();
    await expect(resenas.getByText('Sofía Paz')).toBeVisible();
    await expect(resenas.getByRole('button', { name: 'Mostrar más reseñas' })).toHaveCount(0);
  });

  test('una tecla modificadora sola no muestra el anillo de foco', async ({ page }) => {
    await iniciarSesion(page, usuarios.estudiante);
    await simularApi(page, {
      ...rutasEstudiante,
      '/api/citas/proximas': [
        { id: 1, materia: 'Cálculo', rolOpuestoNombre: 'Mateo Herrera', fechaHoraInicio: enDias(1), estado: 'Pendiente' },
      ],
    });

    await page.goto('/mis-tutorias');
    await page.getByRole('button', { name: /Cálculo.*con Mateo Herrera/ }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    for (const tecla of ['Meta', 'Alt', 'Control', 'Shift']) await page.keyboard.press(tecla);
    await expect(page.locator('[data-fui-focus-visible]')).toHaveCount(0);

    await page.keyboard.press('Tab');
    await expect(page.locator('[data-fui-focus-visible]')).toHaveCount(1);
  });
});
