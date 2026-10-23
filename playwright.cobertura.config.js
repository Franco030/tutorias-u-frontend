// Las mismas pruebas e2e, midiendo qué código de src/ ejecutan (npm run e2e:cobertura).
// La variable se fija antes de crear los workers, que la heredan.
process.env.COBERTURA = '1';

export { default } from './playwright.config.js';
