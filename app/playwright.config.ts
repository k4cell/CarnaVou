import { defineConfig, devices } from '@playwright/test';

/** Outro endereço para testar, como o site no ar (`E2E_ENDERECO=https://…/ npx playwright test`). */
const ENDERECO = process.env['E2E_ENDERECO'];

/**
 * O teste no navegador: abre o site montado (o mesmo que vai para o GitHub Pages) num Chrome de
 * verdade, com a tela e o toque de um celular, e confere o que os testes de unidade não veem: o mapa
 * desenhando, o service worker sem internet, a localização e o relógio de verdade.
 *
 * Uso, dentro de app/: `npm run e2e` (monta o site e roda o teste) ou, com o site já montado,
 * `npx playwright test`. Na primeira vez: `npx playwright install chromium`. A publicação roda este
 * teste antes de pôr o site no ar.
 */
export default defineConfig({
  testDir: 'e2e',
  testMatch: '**/*.e2e.ts',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  // O mapa desenha sem placa de vídeo, o que pesa: com mais de dois navegadores ao mesmo tempo, o
  // computador fica lento e os testes estouram o tempo.
  workers: 2,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI'] ? [['list'], ['github']] : 'list',
  use: {
    baseURL: ENDERECO ?? 'http://127.0.0.1:4300/CarnaVou/',
    ...devices['Pixel 7'],
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    trace: 'retain-on-failure',
    launchOptions: {
      // O mapa precisa de WebGL: sem placa de vídeo (como na máquina do GitHub), ele vem pelo SwiftShader.
      args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'],
    },
  },
  projects: [{ name: 'celular', use: { browserName: 'chromium' } }],
  // Com outro endereço, o teste vai até ele; sem, serve o site montado aqui.
  webServer: ENDERECO
    ? undefined
    : {
        command: 'node e2e/servidor.mjs 4300',
        url: 'http://127.0.0.1:4300/CarnaVou/',
        reuseExistingServer: !process.env['CI'],
      },
});
