import MCR from 'monocart-coverage-reports';

// Los mapas de fuente de Vite nombran solo el archivo ("AcercaDe.jsx"): la
// carpeta sale de la URL del módulo ("localhost-5173/src/features/info/...").
const rutaFuente = (ruta, info) => {
  if (ruta.includes('/') || !info?.distFile) return ruta;
  const carpeta = info.distFile.replace(/^localhost-\d+\//, '').split('?')[0].replace(/\/[^/]*$/, '');
  return `${carpeta}/${ruta}`;
};

// Cobertura de las pruebas e2e (npm run e2e:cobertura): solo el código de src/.
export const opcionesCobertura = {
  name: 'Cobertura e2e · TutoriasU',
  outputDir: './coverage-e2e',
  reports: ['v8', 'console-summary', 'json-summary'],
  entryFilter: (entrada) => entrada.url.includes('localhost:5173/src/') && !entrada.url.endsWith('.css'),
  sourcePath: rutaFuente,
  // Sin hojas de estilo ni imágenes importadas: solo código.
  sourceFilter: (ruta) => !ruta.includes('node_modules') && !/\.(css|png|jpe?g|svg|webp)/.test(ruta),
};

export async function inicio() {
  if (process.env.COBERTURA) await MCR(opcionesCobertura).cleanCache();
}

export async function fin() {
  if (process.env.COBERTURA) await MCR(opcionesCobertura).generate();
}
