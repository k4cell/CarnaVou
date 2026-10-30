import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Aba, blocosDaAba, cartoesDaAba } from '../dados/agenda';
import { BLOCOS } from '../dados/blocos';
import { formatarHora } from '../dados/formato';
import { itinerarioDoBloco } from '../dados/itinerario';
import { Bloco } from '../dados/tipos';
import { trajetoDoBloco } from '../dados/trajetos';
import { MENSAGENS_DA_ABA_VAZIA } from '../filtro/filtro-de-dia';
import { distanciaEmMetros, textoDaDistancia } from '../localizacao/distancia';
import { criarGeolocalizacaoFalsa, Resposta } from '../localizacao/geolocalizacao-falsa';
import { CONSULTAR_PERMISSAO, GEOLOCALIZACAO, PermissaoDoCelular } from '../localizacao/localizacao';
import { Relogio } from '../relogio/relogio';
import { CARREGAR_MAPLIBRE } from './maplibre';
import { criarMapLibreFalso, esperarOMapa } from './maplibre-falso';
import { PaginaMapa } from './pagina-mapa';

// Sábado de carnaval de 2026, duas da tarde: tem bloco hoje e amanhã.
const SABADO_14H = new Date(2026, 1, 14, 14, 0);
// Sexta, antes do pré-carnaval: não tem bloco hoje nem amanhã.
const SEXTA_ANTES = new Date(2026, 0, 30, 12, 0);

// Uma pessoa na Avenida Paulista, e outra no Rio de Janeiro.
const NA_PAULISTA: Resposta = { ok: { lat: -23.5614, lng: -46.6559, precisao: 40 } };
const NO_RIO: Resposta = { ok: { lat: -22.9068, lng: -43.1729, precisao: 40 } };

interface Celular {
  /** O que o celular responde quando a posição é pedida. */
  resposta?: Resposta;
  /** O que o navegador diz sobre a permissão, sem abrir o aviso do celular. */
  permissao?: PermissaoDoCelular | null;
  /** O navegador não tem localização. */
  semLocalizacao?: boolean;
}

/** O ponto como texto, para comparar posições sem brigar com as casas decimais. */
const comoTexto = ([lng, lat]: [number, number]) => `${lng.toFixed(5)},${lat.toFixed(5)}`;

/** Os blocos da aba que têm ponto no mapa, como o mapa os junta: um grupo por ponto. */
function pontosDaAba(aba: Aba, agora: Date): Map<string, Bloco[]> {
  const pontos = new Map<string, Bloco[]>();
  for (const { local } of cartoesDaAba(aba, agora)) {
    for (const bloco of blocosDaAba(aba, local.id, agora)) {
      const trajeto = trajetoDoBloco(bloco.id);
      if (trajeto) {
        const chave = comoTexto(trajeto.inicio);
        pontos.set(chave, [...(pontos.get(chave) ?? []), bloco]);
      }
    }
  }
  return pontos;
}

/** Um ponto da aba que cumpre a condição, com os blocos dele (o que vem primeiro na frente). */
function acharPonto(aba: Aba, condicao: (blocos: Bloco[]) => boolean): Bloco[] {
  const achado = [...pontosDaAba(aba, SABADO_14H).values()].find(condicao);
  expect(achado, 'nenhum ponto da aba serve para este teste').toBeDefined();
  return achado!;
}

describe('PaginaMapa', () => {
  async function renderizar(agora?: Date, celular: Celular = {}, endereco: { lugar?: string; bloco?: string } = {}) {
    const falso = criarMapLibreFalso();
    const geo = criarGeolocalizacaoFalsa(celular.resposta ?? NA_PAULISTA);
    let consultas = 0;
    await TestBed.configureTestingModule({
      imports: [PaginaMapa],
      providers: [
        provideRouter([]),
        { provide: CARREGAR_MAPLIBRE, useValue: () => Promise.resolve(falso.biblioteca) },
        { provide: GEOLOCALIZACAO, useValue: celular.semLocalizacao ? null : geo.api },
        {
          provide: CONSULTAR_PERMISSAO,
          useValue: async () => {
            consultas++;
            return celular.permissao === undefined ? 'prompt' : celular.permissao;
          },
        },
      ],
    }).compileComponents();
    if (agora) {
      TestBed.inject(Relogio).definir(agora);
    }
    const fixture = TestBed.createComponent(PaginaMapa);
    for (const [nome, valor] of Object.entries(endereco)) {
      fixture.componentRef.setInput(nome, valor);
    }
    await esperarOMapa(fixture);
    falso.mapas[0].carregar();
    await esperarOMapa(fixture);
    const tela = fixture.nativeElement as HTMLElement;

    /** As posições das bolinhas no mapa, mais a do pino (o ponto escolhido sai das bolinhas). */
    const posicoes = () =>
      [...falso.mapas[0].pontos().map((ponto) => ponto.posicao), ...falso.pinos().map((pino) => pino.posicao!)]
        .map(comoTexto)
        .sort();
    const cartao = () => tela.querySelector<HTMLElement>('.cartao-do-ponto');
    /** Toca na bolinha onde o bloco se concentra. */
    const tocarNoBloco = async (bloco: Bloco) => {
      const inicio = comoTexto(trajetoDoBloco(bloco.id)!.inicio);
      const ponto = falso.mapas[0].pontos().find((candidato) => comoTexto(candidato.posicao) === inicio);
      expect(ponto, `o ponto de ${bloco.nome} não está no mapa`).toBeDefined();
      falso.mapas[0].tocarNoPonto(ponto!.id);
      await esperarOMapa(fixture);
    };
    const tocarNaAba = async (nome: string) => {
      Array.from(tela.querySelectorAll<HTMLButtonElement>('.aba'))
        .find((aba) => aba.textContent?.trim() === nome)
        ?.click();
      await esperarOMapa(fixture);
    };
    const linhasNoMapa = () => {
      const dados = falso.mapas[0].fontes.get('trajetos')?.dados as
        | { features: { properties: { id: string }; geometry: { type: string; coordinates: unknown } }[] }
        | undefined;
      return (dados?.features ?? []).filter((desenho) => desenho.geometry.type === 'LineString');
    };
    const botaoOndeEstou = () => tela.querySelector<HTMLButtonElement>('.botao-redondo')!;
    const tocarEmOndeEstou = async () => {
      botaoOndeEstou().click();
      await esperarOMapa(fixture);
    };
    const botaoDaExplicacao = (nome: string) =>
      Array.from(tela.querySelectorAll<HTMLButtonElement>('app-explicacao-da-localizacao button')).find(
        (botao) => botao.textContent?.trim() === nome,
      );
    const explicacao = () => tela.querySelector('app-explicacao-da-localizacao');
    const aviso = () => tela.querySelector('.aviso')?.textContent?.trim() ?? null;
    return {
      fixture,
      tela,
      falso,
      geo,
      consultas: () => consultas,
      posicoes,
      cartao,
      tocarNoBloco,
      tocarNaAba,
      linhasNoMapa,
      botaoOndeEstou,
      tocarEmOndeEstou,
      botaoDaExplicacao,
      explicacao,
      aviso,
    };
  }

  const umBloco = (blocos: Bloco[]) => blocos.length === 1;

  describe('num dia de carnaval', () => {
    it('abre na aba Hoje, com uma bolinha onde cada bloco de hoje se concentra', async () => {
      const { tela, posicoes } = await renderizar(SABADO_14H);
      expect(tela.querySelector('.aba[aria-pressed="true"]')?.textContent?.trim()).toBe('Hoje');
      const esperados = [...pontosDaAba('hoje', SABADO_14H).keys()].sort();
      expect(esperados.length).toBeGreaterThan(0);
      expect(posicoes()).toEqual(esperados);
    });

    it('na Geral, mostra os pontos de todos os blocos que ainda vão passar', async () => {
      const { posicoes, tocarNaAba } = await renderizar(SABADO_14H);
      await tocarNaAba('Geral');
      const esperados = [...pontosDaAba('geral', SABADO_14H).keys()].sort();
      expect(esperados.length).toBeGreaterThan(pontosDaAba('hoje', SABADO_14H).size);
      expect(posicoes()).toEqual(esperados);
    });

    it('junta num ponto só os blocos que se concentram no mesmo lugar', async () => {
      const { posicoes } = await renderizar(SABADO_14H);
      const blocosComPonto = [...pontosDaAba('hoje', SABADO_14H).values()].flat();
      expect(posicoes().length).toBeLessThan(blocosComPonto.length);
    });

    it('não mostra o cartão enquanto ninguém tocou num ponto', async () => {
      const { cartao } = await renderizar(SABADO_14H);
      expect(cartao()).toBeNull();
    });

    it('mostra o cartão do bloco quando alguém toca no ponto, com o lugar e a zona', async () => {
      const { cartao, tocarNoBloco } = await renderizar(SABADO_14H);
      const [bloco] = acharPonto('hoje', umBloco);
      await tocarNoBloco(bloco);
      expect(cartao()?.querySelector('.nome')?.textContent).toBe(bloco.nome);
      expect(cartao()?.querySelector('.lugar')?.textContent).toBe(
        cartoesDaAba('hoje', SABADO_14H).find((c) => c.local.id === bloco.localId)?.local.nome,
      );
      expect(cartao()?.querySelector('app-zona-tag')).not.toBeNull();
    });

    it('num ponto de vários blocos, o título diz quantos são', async () => {
      const { cartao, tocarNoBloco } = await renderizar(SABADO_14H);
      const blocos = acharPonto('hoje', (grupo) => grupo.length > 1);
      await tocarNoBloco(blocos[0]);
      expect(cartao()?.querySelector('.nome')?.textContent).toBe(`${blocos.length} blocos neste ponto`);
    });

    it('mostra o itinerário oficial do bloco', async () => {
      const { cartao, tocarNoBloco } = await renderizar(SABADO_14H);
      const [bloco] = acharPonto('hoje', umBloco);
      await tocarNoBloco(bloco);
      expect(cartao()?.querySelector('.trajeto')?.textContent).toBe(`Itinerário: ${itinerarioDoBloco(bloco.id)}`);
    });

    it('avisa quando o ponto e a linha são aproximados, e só nesse caso', async () => {
      const { cartao, tocarNoBloco } = await renderizar(SABADO_14H);
      const aproximado = acharPonto('hoje', (grupo) => grupo.every((b) => trajetoDoBloco(b.id)!.aproximado));
      const exato = acharPonto('hoje', (grupo) => grupo.every((b) => !trajetoDoBloco(b.id)!.aproximado));
      await tocarNoBloco(aproximado[0]);
      expect(cartao()?.querySelector('.aproximado')?.textContent).toContain('aproximados');
      await tocarNoBloco(exato[0]);
      expect(cartao()?.querySelector('.aproximado')).toBeNull();
    });

    it('mostra os artistas dos blocos do ponto, quando as notícias citam', async () => {
      const { cartao, tocarNoBloco } = await renderizar(SABADO_14H);
      const agrada = BLOCOS.find((bloco) => bloco.id === 'agrada-gregos')!;
      await tocarNoBloco(agrada);
      expect(cartao()?.querySelector('.artistas')?.textContent).toContain('Gloria Groove');
    });

    it('leva o botão "Como chegar" ao Google Maps e o outro ao Waze, com o ponto da concentração', async () => {
      const { cartao, tocarNoBloco } = await renderizar(SABADO_14H);
      const [bloco] = acharPonto('hoje', umBloco);
      await tocarNoBloco(bloco);
      const [lng, lat] = trajetoDoBloco(bloco.id)!.inicio;
      const links = Array.from(cartao()!.querySelectorAll<HTMLAnchorElement>('.acoes a'));
      const comoChegar = links.find((link) => link.textContent?.trim() === 'Como chegar');
      const waze = links.find((link) => link.textContent?.trim() === 'Waze');
      expect(comoChegar?.getAttribute('href')).toBe(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
      expect(waze?.getAttribute('href')).toBe(`https://waze.com/ul?ll=${lat}%2C${lng}&navigate=yes`);
      expect(comoChegar?.getAttribute('rel')).toBe('noopener');
      expect(comoChegar?.getAttribute('target')).toBe('_blank');
    });

    it('tem um botão para ver a página do lugar', async () => {
      const { cartao, tocarNoBloco } = await renderizar(SABADO_14H);
      const [bloco] = acharPonto('hoje', umBloco);
      await tocarNoBloco(bloco);
      const ver = Array.from(cartao()!.querySelectorAll<HTMLAnchorElement>('.acoes a')).find(
        (link) => link.textContent?.trim() === 'Ver o lugar',
      );
      expect(ver?.getAttribute('href')).toBe(`/local/${bloco.localId}`);
    });

    it('põe o pino, com o nome do bloco, no ponto escolhido', async () => {
      const { falso, tocarNoBloco } = await renderizar(SABADO_14H);
      const [bloco] = acharPonto('hoje', umBloco);
      await tocarNoBloco(bloco);
      expect(falso.pinos().map((pino) => pino.elemento.getAttribute('aria-label'))).toEqual([bloco.nome]);
    });

    it('fecha o cartão no botão ×', async () => {
      const { fixture, cartao, tocarNoBloco } = await renderizar(SABADO_14H);
      await tocarNoBloco(acharPonto('hoje', umBloco)[0]);
      cartao()!.querySelector<HTMLButtonElement>('.fechar')!.click();
      await esperarOMapa(fixture);
      expect(cartao()).toBeNull();
    });

    it('fecha o cartão quando alguém toca no mapa fora dos pontos', async () => {
      const { fixture, falso, cartao, tocarNoBloco } = await renderizar(SABADO_14H);
      await tocarNoBloco(acharPonto('hoje', umBloco)[0]);
      expect(cartao()).not.toBeNull();
      falso.mapas[0].tocar();
      await esperarOMapa(fixture);
      expect(cartao()).toBeNull();
    });

    it('troca o cartão quando alguém toca noutro ponto', async () => {
      const { cartao, tocarNoBloco } = await renderizar(SABADO_14H);
      const [primeiro, segundo] = [...pontosDaAba('hoje', SABADO_14H).values()].filter(umBloco).map(([b]) => b);
      await tocarNoBloco(primeiro);
      await tocarNoBloco(segundo);
      expect(cartao()?.querySelector('.nome')?.textContent).toBe(segundo.nome);
    });

    it('tira o cartão quando a aba nova não tem aquele ponto', async () => {
      const { cartao, tocarNoBloco, tocarNaAba } = await renderizar(SABADO_14H);
      const deAmanha = pontosDaAba('amanha', SABADO_14H);
      const soDeHoje = acharPonto('hoje', (grupo) => !deAmanha.has(comoTexto(trajetoDoBloco(grupo[0].id)!.inicio)));
      await tocarNoBloco(soDeHoje[0]);
      expect(cartao()).not.toBeNull();
      await tocarNaAba('Amanhã');
      expect(cartao()).toBeNull();
    });
  });

  describe('a linha do bloco', () => {
    const comLinha = (grupo: Bloco[]) => grupo.length === 1 && !!trajetoDoBloco(grupo[0].id)!.linha;

    it('não desenha linha nenhuma enquanto ninguém escolheu um ponto', async () => {
      const { linhasNoMapa } = await renderizar(SABADO_14H);
      expect(linhasNoMapa()).toEqual([]);
    });

    it('desenha só a linha do ponto escolhido, começando no pino', async () => {
      const { linhasNoMapa, tocarNoBloco } = await renderizar(SABADO_14H);
      const [bloco] = acharPonto('hoje', comLinha);
      await tocarNoBloco(bloco);
      const trajeto = trajetoDoBloco(bloco.id)!;
      const linhas = linhasNoMapa();
      expect(linhas.length).toBe(1);
      expect(linhas[0].geometry.coordinates).toEqual(trajeto.linha);
      expect(trajeto.linha![0]).toEqual(trajeto.inicio);
    });

    it('não inventa linha para um bloco parado', async () => {
      const { linhasNoMapa, tocarNoBloco, tocarNaAba } = await renderizar(SABADO_14H);
      await tocarNaAba('Geral');
      const [parado] = acharPonto('geral', (grupo) => grupo.every((b) => !trajetoDoBloco(b.id)!.linha));
      await tocarNoBloco(parado);
      expect(linhasNoMapa()).toEqual([]);
    });
  });

  describe('os blocos no cartão do ponto', () => {
    const linhasDosBlocos = (cartao: HTMLElement | null) =>
      Array.from(cartao?.querySelectorAll<HTMLAnchorElement>('.blocos a') ?? []);

    it('lista os blocos do ponto, com a hora, levando para a página do bloco', async () => {
      const { cartao, tocarNoBloco } = await renderizar(SABADO_14H);
      const blocos = acharPonto('hoje', (grupo) => grupo.length > 1);
      await tocarNoBloco(blocos[0]);
      const links = linhasDosBlocos(cartao());
      expect(links.length).toBe(Math.min(3, blocos.length));
      const [primeiro] = blocos;
      expect(links[0].textContent?.trim()).toBe(`${formatarHora(primeiro.inicio)} · ${primeiro.nome}`);
      expect(links[0].getAttribute('href')).toBe(`/local/${primeiro.localId}/${primeiro.id}`);
    });

    it('na Geral, põe o dia na frente, mostra só três e diz quantos ficaram de fora', async () => {
      const { cartao, tocarNoBloco, tocarNaAba } = await renderizar(SABADO_14H);
      await tocarNaAba('Geral');
      const agrada = BLOCOS.find((bloco) => bloco.id === 'agrada-gregos')!;
      const doPonto = pontosDaAba('geral', SABADO_14H).get(comoTexto(trajetoDoBloco(agrada.id)!.inicio))!;
      expect(doPonto.length).toBeGreaterThan(3);
      await tocarNoBloco(agrada);
      const links = linhasDosBlocos(cartao());
      expect(links.length).toBe(3);
      expect(links[0].textContent?.trim()).toMatch(/^sáb 14 fev · \d+h(\d\d)? · /);
      expect(cartao()?.querySelector('.mais')?.textContent).toBe(`E mais ${doPonto.length - 3} na página do lugar.`);
    });
  });

  describe('"Ver no mapa" (o bloco ou o lugar vem no endereço)', () => {
    it('abre o mapa já no ponto do bloco', async () => {
      const [bloco] = acharPonto('hoje', umBloco);
      const { cartao, tela } = await renderizar(SABADO_14H, {}, { bloco: bloco.id });
      expect(cartao()?.querySelector('.nome')?.textContent).toBe(bloco.nome);
      expect(tela.querySelector('.aba[aria-pressed="true"]')?.textContent?.trim()).toBe('Hoje');
    });

    it('passa para a Geral quando o bloco não é de hoje', async () => {
      // Um bloco de terça (17/02) num ponto de até três blocos, para ele aparecer na lista do cartão.
      const doPonto = acharPonto('geral', (grupo) => grupo.length <= 3 && grupo.some((b) => b.data === '2026-02-17'));
      const outroDia = doPonto.find((bloco) => bloco.data === '2026-02-17')!;
      const { tela, cartao } = await renderizar(SABADO_14H, {}, { bloco: outroDia.id });
      expect(tela.querySelector('.aba[aria-pressed="true"]')?.textContent?.trim()).toBe('Geral');
      expect(cartao()?.querySelector('.blocos')?.textContent).toContain(outroDia.nome);
    });

    it('abre o mapa no ponto do próximo bloco do lugar', async () => {
      const { cartao } = await renderizar(SABADO_14H, {}, { lugar: 'vila-mariana' });
      const primeiro = blocosDaAba('hoje', 'vila-mariana', SABADO_14H).find((bloco) => trajetoDoBloco(bloco.id))!;
      expect(cartao()?.querySelector('.lugar')?.textContent).toBe('Vila Mariana');
      expect(cartao()?.querySelector('.blocos')?.textContent).toContain(primeiro.nome);
    });
  });

  describe('"onde estou"', () => {
    it('tem um botão redondo com nome para o leitor de tela', async () => {
      const { botaoOndeEstou } = await renderizar(SABADO_14H);
      expect(botaoOndeEstou().getAttribute('aria-label')).toBe('Mostrar onde eu estou');
    });

    it('não pede a localização de cara, nem pergunta nada ao celular, ao abrir o mapa', async () => {
      const { geo, consultas, falso, aviso } = await renderizar(SABADO_14H);
      expect(geo.chamadas.length).toBe(0);
      expect(consultas()).toBe(0);
      expect(falso.bolinha()).toBeUndefined();
      expect(aviso()).toBeNull();
    });

    it('explica para que serve antes de pedir, quando o celular ainda vai perguntar', async () => {
      const { tocarEmOndeEstou, explicacao, geo } = await renderizar(SABADO_14H, { permissao: 'prompt' });
      await tocarEmOndeEstou();
      expect(explicacao()).not.toBeNull();
      expect(geo.chamadas.length).toBe(0);
    });

    it('"Agora não" fecha a explicação sem pedir nada e devolve o foco ao botão', async () => {
      const { fixture, tocarEmOndeEstou, botaoDaExplicacao, explicacao, geo, botaoOndeEstou } = await renderizar(
        SABADO_14H,
      );
      await tocarEmOndeEstou();
      botaoDaExplicacao('Agora não')!.click();
      await esperarOMapa(fixture);
      expect(explicacao()).toBeNull();
      expect(geo.chamadas.length).toBe(0);
      expect(document.activeElement).toBe(botaoOndeEstou());
    });

    it('"Continuar" pede a posição, põe a bolinha no mapa e leva o mapa até a pessoa', async () => {
      const { fixture, tocarEmOndeEstou, botaoDaExplicacao, explicacao, geo, falso } = await renderizar(SABADO_14H);
      await tocarEmOndeEstou();
      botaoDaExplicacao('Continuar')!.click();
      await esperarOMapa(fixture);
      expect(explicacao()).toBeNull();
      expect(geo.chamadas.length).toBe(1);
      expect(falso.bolinha()?.posicao).toEqual([-46.6559, -23.5614]);
      const movimento = falso.mapas[0].movimentos.at(-1);
      expect(movimento?.['center']).toEqual([-46.6559, -23.5614]);
      expect(movimento?.['zoom']).toBe(15);
    });

    it('vai direto procurar, sem explicar, quando a pessoa já deixou', async () => {
      const { tocarEmOndeEstou, explicacao, geo, falso } = await renderizar(SABADO_14H, { permissao: 'granted' });
      await tocarEmOndeEstou();
      expect(explicacao()).toBeNull();
      expect(geo.chamadas.length).toBe(1);
      expect(falso.bolinha()).toBeDefined();
    });

    it('depois de achar a pessoa, um novo toque procura de novo sem explicar outra vez', async () => {
      const { tocarEmOndeEstou, explicacao, geo, falso } = await renderizar(SABADO_14H, { permissao: 'granted' });
      await tocarEmOndeEstou();
      geo.responder({ ok: { lat: -23.57, lng: -46.66, precisao: 15 } });
      await tocarEmOndeEstou();
      expect(explicacao()).toBeNull();
      expect(geo.chamadas.length).toBe(2);
      expect(falso.bolinha()?.posicao).toEqual([-46.66, -23.57]);
    });

    it('avisa, sem pedir de novo, quando a pessoa já tinha dito não', async () => {
      const { tocarEmOndeEstou, aviso, geo, explicacao } = await renderizar(SABADO_14H, { permissao: 'denied' });
      await tocarEmOndeEstou();
      expect(aviso()).toContain('não deixou o CarnaVou ver onde você está');
      expect(aviso()).toContain('O mapa continua funcionando');
      expect(geo.chamadas.length).toBe(0);
      expect(explicacao()).toBeNull();
    });

    it('avisa quando a pessoa diz não ao aviso do celular', async () => {
      const { fixture, tocarEmOndeEstou, botaoDaExplicacao, aviso, falso } = await renderizar(SABADO_14H, {
        resposta: { erro: 1 },
      });
      await tocarEmOndeEstou();
      botaoDaExplicacao('Continuar')!.click();
      await esperarOMapa(fixture);
      expect(aviso()).toContain('não deixou o CarnaVou ver onde você está');
      expect(falso.bolinha()).toBeUndefined();
    });

    it('avisa para tentar de novo em lugar aberto quando o celular não acha a pessoa', async () => {
      const { tocarEmOndeEstou, aviso, falso } = await renderizar(SABADO_14H, {
        permissao: 'granted',
        resposta: { erro: 2 },
      });
      await tocarEmOndeEstou();
      expect(aviso()).toContain('Tente de novo em um lugar aberto');
      expect(falso.bolinha()).toBeUndefined();
    });

    it('avisa quando o navegador não tem localização', async () => {
      const { tocarEmOndeEstou, aviso } = await renderizar(SABADO_14H, { semLocalizacao: true });
      await tocarEmOndeEstou();
      expect(aviso()).toContain('Este navegador não consegue dizer onde você está');
    });

    it('avisa e não leva o mapa quando a pessoa está fora da Grande São Paulo', async () => {
      const { tocarEmOndeEstou, aviso, falso } = await renderizar(SABADO_14H, {
        permissao: 'granted',
        resposta: NO_RIO,
      });
      await tocarEmOndeEstou();
      expect(aviso()).toContain('fora da Grande São Paulo');
      expect(falso.mapas[0].movimentos.some((movimento) => movimento['zoom'] === 15)).toBe(false);
    });

    it('fecha o aviso no ×, e o aviso volta se a pessoa tentar de novo', async () => {
      const { fixture, tela, tocarEmOndeEstou, aviso } = await renderizar(SABADO_14H, {
        permissao: 'granted',
        resposta: { erro: 2 },
      });
      await tocarEmOndeEstou();
      tela.querySelector<HTMLButtonElement>('.aviso .fechar')!.click();
      await esperarOMapa(fixture);
      expect(aviso()).toBeNull();
      await tocarEmOndeEstou();
      expect(aviso()).not.toBeNull();
    });

    describe('a distância no cartão do ponto', () => {
      it('não aparece enquanto a pessoa não mostrou onde está', async () => {
        const { cartao, tocarNoBloco } = await renderizar(SABADO_14H);
        await tocarNoBloco(acharPonto('hoje', umBloco)[0]);
        expect(cartao()?.querySelector('.distancia')).toBeNull();
      });

      it('aparece, em linha reta até a concentração, depois que a pessoa mostrou onde está', async () => {
        const { cartao, tocarNoBloco, tocarEmOndeEstou } = await renderizar(SABADO_14H, { permissao: 'granted' });
        await tocarEmOndeEstou();
        const [bloco] = acharPonto('hoje', umBloco);
        await tocarNoBloco(bloco);
        const [lng, lat] = trajetoDoBloco(bloco.id)!.inicio;
        const metros = distanciaEmMetros({ lat: -23.5614, lng: -46.6559 }, { lat, lng });
        expect(cartao()?.querySelector('.distancia')?.textContent).toBe(
          `A ${textoDaDistancia(metros)} de você, em linha reta.`,
        );
      });
    });
  });

  describe('num dia sem bloco', () => {
    it('abre na aba Geral, com os pontos de todos os blocos', async () => {
      const { tela, posicoes } = await renderizar(SEXTA_ANTES);
      expect(tela.querySelector('.aba[aria-pressed="true"]')?.textContent?.trim()).toBe('Geral');
      expect(posicoes()).toEqual([...pontosDaAba('geral', SEXTA_ANTES).keys()].sort());
    });

    it('avisa e fica sem pontos na aba Hoje', async () => {
      const { tela, posicoes, tocarNaAba } = await renderizar(SEXTA_ANTES);
      await tocarNaAba('Hoje');
      expect(posicoes()).toEqual([]);
      expect(tela.querySelector('.vazio')?.textContent).toContain(MENSAGENS_DA_ABA_VAZIA.hoje);
    });
  });
});
