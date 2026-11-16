import { expect, test, type Page } from '@playwright/test';

/*
 * O site montado, num Chrome de verdade com a tela de um celular. Os testes não dependem dos blocos de
 * um ano: o bloco usado vem da própria aba Blocos, e o dia e a hora dele, dos dados de evento da página.
 */

/** Uma hora de São Paulo (sem horário de verão desde 2019) num instante do relógio. */
const emSaoPaulo = (dia: string, hora: string) => new Date(`${dia}T${hora}:00-03:00`);
const MINUTO = 60_000;

/** Erros no console ou no JavaScript da página: um teste que passa não pode ter nenhum. */
function anotarErros(page: Page): string[] {
  const erros: string[] = [];
  page.on('pageerror', (erro) => erros.push(erro.message));
  page.on('console', (mensagem) => {
    if (mensagem.type() === 'error') {
      erros.push(mensagem.text());
    }
  });
  return erros;
}

/** O endereço completo do início do site (no GitHub Pages, com a pasta /CarnaVou/). */
const inicioDoSite = (page: Page) => new URL('./', test.info().project.use.baseURL ?? page.url()).href;

/** O primeiro bloco da aba Geral: o endereço da página dele e quando ele começa e acaba. */
async function umBloco(page: Page) {
  await page.goto('');
  await page.getByRole('button', { name: 'Geral' }).click();
  const href = await page.locator('app-banner-bloco a.cartao').first().getAttribute('href');
  expect(href).toBeTruthy();
  const endereco = new URL(href!, page.url()).href;
  await page.goto(endereco);
  const evento = JSON.parse((await page.locator('script#dados-do-evento').textContent()) ?? '{}');
  expect(evento['@type']).toBe('Event');
  return {
    endereco,
    nome: evento.name as string,
    dia: (evento.startDate as string).slice(0, 10),
    inicio: new Date(evento.startDate),
    fim: evento.endDate ? new Date(evento.endDate) : null,
  };
}

test('a aba Blocos abre com os cartões dos blocos', async ({ page }) => {
  const erros = anotarErros(page);
  await page.goto('');
  await page.getByRole('button', { name: 'Geral' }).click();
  await expect(page.locator('app-banner-bloco').first()).toBeVisible();
  await expect(page).toHaveTitle(/CarnaVou/);
  expect(erros).toEqual([]);
});

test('um cartão abre a página do bloco, com os dados de evento, e a seta volta', async ({ page }) => {
  const erros = anotarErros(page);
  await page.goto('');
  await page.getByRole('button', { name: 'Geral' }).click();
  const cartao = page.locator('app-banner-bloco a.cartao').first();
  const nome = (await cartao.locator('.nome').textContent())?.trim();
  await cartao.click();
  await expect(page).toHaveURL(/\/local\/[^/]+\/[^/]+/);
  await expect(page.locator('h2.titulo')).toHaveText(nome!);
  const evento = JSON.parse((await page.locator('script#dados-do-evento').textContent()) ?? '{}');
  expect(evento.name).toBe(nome);
  await page.locator('a.voltar').click();
  const inicio = inicioDoSite(page);
  await expect(page).toHaveURL((endereco) => endereco.href.split('?')[0] === inicio);
  expect(erros).toEqual([]);
});

test('o mapa abre e desenha o mapa guardado no site', async ({ page }) => {
  const erros = anotarErros(page);
  const pedaco = page.waitForResponse((resposta) => /\/mapa\/pedacos\/\d+\/\d+\/\d+\.pbf$/.test(resposta.url()) && resposta.ok());
  await page.goto('mapa');
  await pedaco;
  await expect(page.locator('app-mapa-base canvas')).toBeVisible();
  await expect(page.locator('.mapa-carregando')).toHaveCount(0);
  await expect(page.locator('.mapa-erro')).toHaveCount(0);
  // Os créditos do mapa têm que continuar à vista.
  await expect(page.getByText('© OpenStreetMap contributors')).toBeAttached();
  expect(erros).toEqual([]);
});

test('"Perto de mim", no Descobrir, põe a distância e o tempo a pé em cada bloco', async ({ page, context }) => {
  const bloco = await umBloco(page);
  // Na Avenida Paulista, perto do MASP, meia hora depois de o bloco começar.
  await context.grantPermissions(['geolocation']);
  await context.setGeolocation({ latitude: -23.5614, longitude: -46.6559 });
  const descobrir = await context.newPage();
  const erros = anotarErros(descobrir);
  await descobrir.clock.install({ time: new Date(bloco.inicio.getTime() + 30 * MINUTO) });
  await descobrir.goto('descobrir?hoje=relogio');
  const perto = descobrir.getByRole('button', { name: 'Perto de mim' });
  await perto.click();
  // O celular já deixou: vai direto, sem a tela que explica.
  await expect(perto).toHaveAttribute('aria-pressed', 'true');
  await expect(descobrir.locator('app-fileira-de-blocos .distancia').first()).toHaveText(/a pé$/);
  expect(erros).toEqual([]);
});

test('relógio de verdade: a virada da meia-noite e o bloco começando e acabando', async ({ page, context }) => {
  const bloco = await umBloco(page);
  const pagina = await context.newPage();
  const erros = anotarErros(pagina);
  // Dois minutos antes da meia-noite da véspera do bloco, em São Paulo.
  await pagina.clock.install({ time: new Date(emSaoPaulo(bloco.dia, '00:00').getTime() - 2 * MINUTO) });
  await pagina.goto(`${bloco.endereco}?hoje=relogio`);
  const quando = pagina.locator('.quando-e-onde');
  await expect(quando).toContainText('Amanhã,');
  // Sem data de teste, o aviso do alto não diz data nenhuma.
  await expect(pagina.locator('app-aviso-de-teste .data')).toHaveCount(0);

  await pagina.clock.fastForward('03:00');
  await expect(quando).toContainText('Hoje,');

  // Em segundo plano, o relógio anda sem o app ver; ao voltar, a hora se acerta na hora.
  await pagina.clock.setSystemTime(new Date(bloco.inicio.getTime() + MINUTO));
  await pagina.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await expect(pagina.locator('.linha-do-nome .rolando')).toHaveText('Rolando agora');

  if (bloco.fim) {
    await pagina.clock.fastForward(bloco.fim.getTime() - bloco.inicio.getTime());
    await expect(pagina.locator('.linha-do-nome .rolando')).toHaveCount(0);
    await expect(pagina.locator('.horario')).toContainText('acabou às');
  }
  expect(erros).toEqual([]);
});

test('sem internet: depois da primeira visita, o app abre sem rede', async ({ page, context }) => {
  test.setTimeout(120_000);
  await page.goto('');
  // O service worker se registra quando o app fica estável (ou em até 30 s) e guarda o app.
  await page.waitForFunction(async () => {
    const registro = await navigator.serviceWorker.getRegistration();
    return registro?.active?.state === 'activated';
  }, undefined, { timeout: 60_000 });
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller, undefined, { timeout: 30_000 });
  // Espera o service worker terminar de guardar os arquivos do app.
  await page.waitForFunction(async () => (await caches.keys()).some((nome) => nome.includes(':assets:app:cache')), undefined, {
    timeout: 30_000,
  });

  await context.setOffline(true);
  await page.goto('descobrir');
  await expect(page.getByText('Sem internet')).toBeVisible();
  await expect(page.locator('a.cartao[href*="/local/"]').first()).toBeVisible();
});
