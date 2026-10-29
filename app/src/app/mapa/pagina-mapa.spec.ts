import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { cartoesDaAba } from '../dados/agenda';
import { LOCAIS } from '../dados/locais';
import { MENSAGENS_DA_ABA_VAZIA } from '../filtro/filtro-de-dia';
import { Relogio } from '../relogio/relogio';
import { CARREGAR_MAPLIBRE } from './maplibre';
import { criarMapLibreFalso, esperarOMapa } from './maplibre-falso';
import { PaginaMapa } from './pagina-mapa';

// Sábado de carnaval de 2026, duas da tarde: tem bloco hoje e amanhã.
const SABADO_14H = new Date(2026, 1, 14, 14, 0);
// Sexta, antes do pré-carnaval: não tem bloco hoje nem amanhã.
const SEXTA_ANTES = new Date(2026, 0, 30, 12, 0);

describe('PaginaMapa', () => {
  async function renderizar(agora?: Date) {
    const falso = criarMapLibreFalso();
    await TestBed.configureTestingModule({
      imports: [PaginaMapa],
      providers: [
        provideRouter([]),
        { provide: CARREGAR_MAPLIBRE, useValue: () => Promise.resolve(falso.biblioteca) },
      ],
    }).compileComponents();
    if (agora) {
      TestBed.inject(Relogio).definir(agora);
    }
    const fixture = TestBed.createComponent(PaginaMapa);
    await esperarOMapa(fixture);
    const tela = fixture.nativeElement as HTMLElement;

    const nomesDosPinos = () => falso.pinos().map((pino) => pino.elemento.getAttribute('aria-label'));
    const cartao = () => tela.querySelector<HTMLElement>('.cartao-do-ponto');
    const tocarNoPino = async (nome: string) => {
      falso.pinos().find((pino) => pino.elemento.getAttribute('aria-label') === nome)?.elemento.click();
      await esperarOMapa(fixture);
    };
    const tocarNaAba = async (nome: string) => {
      Array.from(tela.querySelectorAll<HTMLButtonElement>('.aba'))
        .find((aba) => aba.textContent?.trim() === nome)
        ?.click();
      await esperarOMapa(fixture);
    };
    return { fixture, tela, falso, nomesDosPinos, cartao, tocarNoPino, tocarNaAba };
  }

  describe('num dia de carnaval', () => {
    it('abre na aba Hoje, com um pino para cada lugar que tem bloco hoje', async () => {
      const { tela, nomesDosPinos } = await renderizar(SABADO_14H);
      expect(tela.querySelector('.aba[aria-pressed="true"]')?.textContent?.trim()).toBe('Hoje');
      const esperados = cartoesDaAba('hoje', SABADO_14H).map((c) => c.local.nome);
      expect(esperados.length).toBeGreaterThan(0);
      expect(nomesDosPinos()).toEqual(esperados);
    });

    it('mostra todos os lugares na aba Geral', async () => {
      const { nomesDosPinos, tocarNaAba } = await renderizar(SABADO_14H);
      await tocarNaAba('Geral');
      // A ordem muda (a Geral põe os lugares em alta primeiro), mas todos os lugares aparecem.
      expect(nomesDosPinos().sort()).toEqual(LOCAIS.map((local) => local.nome).sort());
    });

    it('não mostra o cartão do lugar enquanto ninguém tocou num pino', async () => {
      const { cartao } = await renderizar(SABADO_14H);
      expect(cartao()).toBeNull();
    });

    it('mostra o cartão do lugar quando alguém toca no pino', async () => {
      const { cartao, tocarNoPino } = await renderizar(SABADO_14H);
      const primeiro = cartoesDaAba('hoje', SABADO_14H)[0];
      await tocarNoPino(primeiro.local.nome);
      expect(cartao()?.querySelector('.nome')?.textContent).toContain(primeiro.local.nome);
      expect(cartao()?.querySelector('.selo')?.textContent).toBe(primeiro.selo);
      expect(cartao()?.querySelector('app-zona-tag')).not.toBeNull();
    });

    it('mostra os artistas do lugar, o primeiro em destaque', async () => {
      const { cartao, tocarNoPino } = await renderizar(SABADO_14H);
      const comArtistas = cartoesDaAba('hoje', SABADO_14H).find((c) => c.principal);
      expect(comArtistas).toBeDefined();
      await tocarNoPino(comArtistas!.local.nome);
      expect(cartao()?.querySelector('.principal')?.textContent).toBe(comArtistas!.principal);
    });

    it('leva o botão "Como chegar" ao Google Maps e o outro ao Waze, com o destino do lugar', async () => {
      const { cartao, tocarNoPino } = await renderizar(SABADO_14H);
      const { local } = cartoesDaAba('hoje', SABADO_14H)[0];
      await tocarNoPino(local.nome);
      const links = Array.from(cartao()!.querySelectorAll<HTMLAnchorElement>('.acoes a'));
      const comoChegar = links.find((link) => link.textContent?.trim() === 'Como chegar');
      const waze = links.find((link) => link.textContent?.trim() === 'Waze');
      expect(comoChegar?.getAttribute('href')).toBe(
        `https://www.google.com/maps/dir/?api=1&destination=${local.lat},${local.lng}`,
      );
      expect(waze?.getAttribute('href')).toBe(`https://waze.com/ul?ll=${local.lat}%2C${local.lng}&navigate=yes`);
      expect(comoChegar?.getAttribute('rel')).toBe('noopener');
      expect(comoChegar?.getAttribute('target')).toBe('_blank');
    });

    it('tem um botão para ver a página do lugar', async () => {
      const { cartao, tocarNoPino } = await renderizar(SABADO_14H);
      const { local } = cartoesDaAba('hoje', SABADO_14H)[0];
      await tocarNoPino(local.nome);
      const ver = Array.from(cartao()!.querySelectorAll<HTMLAnchorElement>('.acoes a')).find(
        (link) => link.textContent?.trim() === 'Ver o lugar',
      );
      expect(ver?.getAttribute('href')).toBe(`/local/${local.id}`);
    });

    it('destaca o pino do lugar escolhido', async () => {
      const { falso, tocarNoPino } = await renderizar(SABADO_14H);
      const { local } = cartoesDaAba('hoje', SABADO_14H)[0];
      await tocarNoPino(local.nome);
      const selecionados = falso.pinos().filter((pino) => pino.elemento.classList.contains('selecionado'));
      expect(selecionados.map((pino) => pino.elemento.getAttribute('aria-label'))).toEqual([local.nome]);
    });

    it('fecha o cartão no botão ×', async () => {
      const { fixture, cartao, tocarNoPino } = await renderizar(SABADO_14H);
      await tocarNoPino(cartoesDaAba('hoje', SABADO_14H)[0].local.nome);
      cartao()!.querySelector<HTMLButtonElement>('.fechar')!.click();
      await esperarOMapa(fixture);
      expect(cartao()).toBeNull();
    });

    it('fecha o cartão quando alguém toca no mapa fora dos pinos', async () => {
      const { fixture, falso, cartao, tocarNoPino } = await renderizar(SABADO_14H);
      await tocarNoPino(cartoesDaAba('hoje', SABADO_14H)[0].local.nome);
      expect(cartao()).not.toBeNull();
      falso.mapas[0].tocar();
      await esperarOMapa(fixture);
      expect(cartao()).toBeNull();
    });

    it('troca o cartão quando alguém toca noutro pino', async () => {
      const { cartao, tocarNoPino } = await renderizar(SABADO_14H);
      const [primeiro, segundo] = cartoesDaAba('hoje', SABADO_14H);
      await tocarNoPino(primeiro.local.nome);
      await tocarNoPino(segundo.local.nome);
      expect(cartao()?.querySelector('.nome')?.textContent).toContain(segundo.local.nome);
    });

    it('tira o cartão quando a aba nova não tem aquele lugar', async () => {
      const { cartao, tocarNoPino, tocarNaAba } = await renderizar(SABADO_14H);
      const hoje = cartoesDaAba('hoje', SABADO_14H);
      const amanha = new Set(cartoesDaAba('amanha', SABADO_14H).map((c) => c.local.id));
      const soDeHoje = hoje.find((c) => !amanha.has(c.local.id));
      expect(soDeHoje).toBeDefined();
      await tocarNoPino(soDeHoje!.local.nome);
      expect(cartao()).not.toBeNull();
      await tocarNaAba('Amanhã');
      expect(cartao()).toBeNull();
    });
  });

  describe('num dia sem bloco', () => {
    it('abre na aba Geral, com todos os lugares', async () => {
      const { tela, nomesDosPinos } = await renderizar(SEXTA_ANTES);
      expect(tela.querySelector('.aba[aria-pressed="true"]')?.textContent?.trim()).toBe('Geral');
      expect(nomesDosPinos().sort()).toEqual(LOCAIS.map((local) => local.nome).sort());
    });

    it('avisa e fica sem pinos na aba Hoje', async () => {
      const { tela, falso, tocarNaAba } = await renderizar(SEXTA_ANTES);
      await tocarNaAba('Hoje');
      expect(falso.pinos().length).toBe(0);
      expect(tela.querySelector('.vazio')?.textContent).toContain(MENSAGENS_DA_ABA_VAZIA.hoje);
    });
  });
});
