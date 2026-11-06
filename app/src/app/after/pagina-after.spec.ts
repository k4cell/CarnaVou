import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { blocosDaNoite } from '../dados/lista-de-blocos';
import { LUGARES_DO_AFTER } from '../dados/lugares-do-after';
import { FiltroDeDia } from '../filtro/filtro-de-dia';
import { distanciaEmMetros, textoDaDistancia } from '../localizacao/distancia';
import { criarGeolocalizacaoFalsa } from '../localizacao/geolocalizacao-falsa';
import { CONSULTAR_PERMISSAO, GEOLOCALIZACAO, Localizacao, PermissaoDoCelular } from '../localizacao/localizacao';
import { estaNaGrandeSP } from '../mapa/limites';
import { Relogio } from '../relogio/relogio';
import { PaginaAfter } from './pagina-after';

// Sábado, 07/02/2026, meio-dia: o "hoje" de demonstração. Amanhã tem a Banda do Fuxico.
const SABADO_MEIO_DIA = new Date(2026, 1, 7, 12, 0);
// Uma pessoa no Largo da Batata, em Pinheiros.
const NO_LARGO_DA_BATATA = { lat: -23.5667, lng: -46.6936 };

describe('PaginaAfter', () => {
  async function renderizar(agora?: Date, permissao: PermissaoDoCelular = 'prompt', abaNasOutrasTelas?: 'amanha') {
    const geo = criarGeolocalizacaoFalsa({ ok: { ...NO_LARGO_DA_BATATA, precisao: 30 } });
    await TestBed.configureTestingModule({
      imports: [PaginaAfter],
      providers: [
        provideRouter([{ path: 'mapa', children: [] }]),
        { provide: GEOLOCALIZACAO, useValue: geo.api },
        { provide: CONSULTAR_PERMISSAO, useValue: async () => permissao },
      ],
    }).compileComponents();
    if (agora) {
      TestBed.inject(Relogio).definir(agora);
    }
    if (abaNasOutrasTelas) {
      TestBed.inject(FiltroDeDia).escolher(abaNasOutrasTelas);
    }
    const fixture = TestBed.createComponent(PaginaAfter);
    await fixture.whenStable();
    const tela = fixture.nativeElement as HTMLElement;
    const tocarEmOndeEstou = async () => {
      tela.querySelector<HTMLButtonElement>('.onde-estou')!.click();
      await fixture.whenStable();
      await new Promise((resolver) => setTimeout(resolver));
      await fixture.whenStable();
    };
    return { fixture, tela, geo, tocarEmOndeEstou };
  }

  const nomesDosBlocos = (tela: HTMLElement) =>
    Array.from(tela.querySelectorAll('app-banner-bloco .nome')).map((nome) => nome.textContent);
  const nomesDosLugares = (tela: HTMLElement) =>
    Array.from(tela.querySelectorAll('.lugar-do-after .nome')).map((nome) => nome.textContent);

  it('não tem as abas de dia: vale sempre o hoje', async () => {
    const { tela } = await renderizar(SABADO_MEIO_DIA);
    expect(tela.querySelector('app-abas-do-dia')).toBeNull();
  });

  it('mostra os blocos da noite de hoje, mesmo com outra aba escolhida nas outras telas', async () => {
    const { tela } = await renderizar(SABADO_MEIO_DIA, 'prompt', 'amanha');
    expect(nomesDosBlocos(tela)).toEqual(blocosDaNoite('hoje', SABADO_MEIO_DIA).map((bloco) => bloco.nome));
    expect(nomesDosBlocos(tela)).toEqual(['Blocos dos Sem Tetos']);
    expect(tela.querySelector('app-banner-bloco .lugar')).not.toBeNull();
  });

  it('avisa quando não tem mais bloco da noite hoje', async () => {
    const { tela } = await renderizar(new Date(2026, 1, 7, 19, 0));
    expect(nomesDosBlocos(tela)).toEqual([]);
    expect(tela.querySelector('.vazio')?.textContent).toContain('Nenhum bloco da noite hoje.');
  });

  it('na página pronta (sem saber o dia), não diz nada sobre os blocos da noite', async () => {
    const { tela } = await renderizar();
    expect(nomesDosBlocos(tela)).toEqual([]);
    expect(tela.querySelector('.vazio')).toBeNull();
  });

  it('mostra os bares e pontos de encontro, com Ir a pé, Uber, Metrô e Mapa', async () => {
    const { tela } = await renderizar();
    expect(nomesDosLugares(tela)).toEqual(LUGARES_DO_AFTER.map((lugar) => lugar.nome));
    for (const [posicao, cartao] of Array.from(tela.querySelectorAll('.lugar-do-after')).entries()) {
      const links = Array.from(cartao.querySelectorAll<HTMLAnchorElement>('.acoes a'));
      expect(links.map((link) => link.textContent?.trim())).toEqual(['Ir a pé', 'Uber', 'Metrô', 'Mapa']);
      // O Mapa, e também o nome (que cobre o cartão todo), abrem o mapa do After já no lugar.
      const noMapa = `/mapa?after=${LUGARES_DO_AFTER[posicao].id}`;
      expect(links[3].getAttribute('href')).toBe(noMapa);
      expect(cartao.querySelector('a.nome')?.getAttribute('href')).toBe(noMapa);
      expect(links[3].getAttribute('target')).toBeNull();
      links.pop();
      expect(links[0].getAttribute('href')).toContain('travelmode=walking');
      expect(links[2].getAttribute('href')).toContain('travelmode=transit');
      expect(links.every((link) => link.getAttribute('target') === '_blank')).toBe(true);
    }
  });

  it('cada lugar está na Grande São Paulo e tem endereço', () => {
    for (const lugar of LUGARES_DO_AFTER) {
      expect(estaNaGrandeSP(lugar.lat, lugar.lng), lugar.nome).toBe(true);
      expect(lugar.endereco.length, lugar.nome).toBeGreaterThan(5);
    }
  });

  describe('"Onde estou"', () => {
    it('não pede a localização ao abrir a aba', async () => {
      const { tela, geo } = await renderizar(SABADO_MEIO_DIA);
      expect(geo.chamadas.length).toBe(0);
      expect(tela.querySelector('.distancia')).toBeNull();
    });

    it('leva ao mapa do After, que procura a pessoa lá', async () => {
      const { geo, tocarEmOndeEstou } = await renderizar(SABADO_MEIO_DIA, 'granted');
      await tocarEmOndeEstou();
      expect(TestBed.inject(Router).url).toBe('/mapa?after=sim');
      // Aqui não procura: quem procura é o mapa, uma vez, por causa deste toque.
      expect(geo.chamadas.length).toBe(0);
      const localizacao = TestBed.inject(Localizacao);
      expect(localizacao.veioDeUmToque()).toBe(true);
      expect(localizacao.veioDeUmToque()).toBe(false);
    });

    it('quando a pessoa já mostrou onde está, põe os lugares do mais perto para o mais longe', async () => {
      const { tela, fixture } = await renderizar(SABADO_MEIO_DIA);
      const localizacao = TestBed.inject(Localizacao);
      const cores = () =>
        Object.fromEntries(
          Array.from(tela.querySelectorAll('.lugar-do-after')).map((cartao) => [
            cartao.querySelector('.nome')?.textContent,
            cartao.getAttribute('data-faixa'),
          ]),
        );
      const coresAntes = cores();
      localizacao.posicao.set({ ...NO_LARGO_DA_BATATA, precisao: 30 });
      localizacao.estado.set('ligada');
      await fixture.whenStable();
      const esperados = [...LUGARES_DO_AFTER].sort(
        (a, b) => distanciaEmMetros(NO_LARGO_DA_BATATA, a) - distanciaEmMetros(NO_LARGO_DA_BATATA, b),
      );
      expect(nomesDosLugares(tela)).toEqual(esperados.map((lugar) => lugar.nome));
      const maisPerto = textoDaDistancia(distanciaEmMetros(NO_LARGO_DA_BATATA, esperados[0]));
      expect(tela.querySelector('.lugar-do-after .distancia')?.textContent).toBe(`A ${maisPerto} de você, em linha reta.`);
      // A cor de cada lugar não muda quando a ordem muda.
      expect(cores()).toEqual(coresAntes);
    });
  });
});
