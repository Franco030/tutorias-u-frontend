import { test as base, expect } from '@playwright/test';
import MCR from 'monocart-coverage-reports';
import { opcionesCobertura } from './cobertura.config.js';

/*
 * `test` de las pruebas e2e. Con COBERTURA=1 registra qué código de src/ se
 * ejecutó en el navegador (cobertura V8 de Chromium, mapeada a los archivos
 * fuente); sin la variable se comporta igual que el de Playwright.
 */
export const test = base.extend({
  autoCobertura: [
    async ({ page }, use) => {
      if (!process.env.COBERTURA) {
        await use();
        return;
      }
      await page.coverage.startJSCoverage({ resetOnNavigation: false });
      await use();
      const cobertura = await page.coverage.stopJSCoverage();
      await MCR(opcionesCobertura).add(cobertura);
    },
    { auto: true },
  ],
});

export { expect };
