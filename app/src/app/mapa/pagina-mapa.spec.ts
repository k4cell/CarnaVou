import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Aba, blocosDaAba, cartoesDaAba, momentoDoBloco } from '../dados/agenda';
import { BLOCOS } from '../dados/blocos';
import { formatarHora, textoDoHorario } from '../dados/formato';
import { itinerarioDoBloco } from '../dados/itinerario';
import { blocosDaNoite } from '../dados/lista-de-blocos';
import { LUGARES_DO_AFTER } from '../dados/lugares-do-after';
import { Bloco } from '../dados/tipos';
import { trajetoDoBloco } from '../dados/trajetos';
import { MENSAGENS_DA_ABA_VAZIA } from '../filtro/filtro-de-dia';
import { distanciaEmMetros, fraseDaDistancia, textoDaDistancia } from '../localizacao/distancia';
import { criarGeolocalizacaoFalsa, Resposta } from '../localizacao/geolocalizacao-falsa';
import { CONSULTAR_PERMISSAO, GEOLOCALIZACAO, Localizacao, PermissaoDoCelular } from '../localizacao/localizacao';
import { Relogio } from '../relogio/relogio';
import { CARREGAR_MAPLIBRE } from './maplibre';
import { criarMapLibreFalso, esperarOMapa } from './maplibre-falso';
import { PaginaMapa } from './pagina-mapa';
import { PONTOS_DO_AFTER } from './pontos-do-after';
import { blocosPertoDeVoce } from './perto-de-voce';

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
  async function renderizar(
    agora?: Date,
    celular: Celular = {},
    endereco: { lugar?: string; bloco?: string; after?: string } = {},
    antesDeAbrir?: () => void,
  ) {
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
    antesDeAbrir?.();
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
    /** O cartão abre pequeno; tocar na alça mostra o resto (itinerário, artistas, blocos). */
    const abrirOCartao = async () => {
      if (cartao()?.querySelector('.alca')?.getAttribute('aria-expanded') !== 'true') {
        cartao()?.querySelector<HTMLButtonElement>('.alca')?.click();
        await esperarOMapa(fixture);
      }
    };
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
      abrirOCartao,
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

    it('num ponto de vários blocos, mostra o nome de cada um numa linha, sem "X blocos neste ponto"', async () => {
      const { cartao, tocarNoBloco } = await renderizar(SABADO_14H);
      const blocos = acharPonto('hoje', (grupo) => grupo.length === 2);
      await tocarNoBloco(blocos[0]);
      const nomes = Array.from(cartao()!.querySelectorAll('.blocos-do-ponto .nome')).map((nome) => nome.textContent);
      expect(nomes).toEqual(blocos.map((bloco) => bloco.nome));
      expect(cartao()?.textContent).not.toContain('blocos neste ponto');
      expect(cartao()?.querySelector('.mais-blocos')).toBeNull();
    });

    it('cada nome leva para a página do bloco', async () => {
      const { cartao, tocarNoBloco } = await renderizar(SABADO_14H);
      const [bloco] = acharPonto('hoje', umBloco);
      await tocarNoBloco(bloco);
      expect(cartao()?.querySelector('.blocos-do-ponto a')?.getAttribute('href')).toBe(`/local/${bloco.localId}/${bloco.id}`);
    });

    it('põe a zona na linha da alça, antes dos blocos, e o lugar depois deles', async () => {
      const { cartao, tocarNoBloco } = await renderizar(SABADO_14H);
      await tocarNoBloco(acharPonto('hoje', umBloco)[0]);
      const ordem = Array.from(cartao()!.children).map((filho) => filho.classList[0]);
      expect(ordem.indexOf('zona-do-cartao')).toBeLessThan(ordem.indexOf('blocos-do-ponto'));
      expect(ordem.indexOf('blocos-do-ponto')).toBeLessThan(ordem.indexOf('lugar'));
    });

    it('mostra o itinerário oficial do bloco', async () => {
      const { cartao, tocarNoBloco, abrirOCartao } = await renderizar(SABADO_14H);
      const [bloco] = acharPonto('hoje', umBloco);
      await tocarNoBloco(bloco);
      await abrirOCartao();
      expect(cartao()?.querySelector('.trajeto')?.textContent).toBe(`Itinerário: ${itinerarioDoBloco(bloco.id)}`);
    });

    it('avisa quando o ponto e a linha são aproximados, e só nesse caso', async () => {
      const { cartao, tocarNoBloco, abrirOCartao } = await renderizar(SABADO_14H);
      const aproximado = acharPonto('hoje', (grupo) => grupo.every((b) => trajetoDoBloco(b.id)!.aproximado));
      const exato = acharPonto('hoje', (grupo) => grupo.every((b) => !trajetoDoBloco(b.id)!.aproximado));
      await tocarNoBloco(aproximado[0]);
      await abrirOCartao();
      expect(cartao()?.querySelector('.aproximado')?.textContent).toContain('aproximados');
      await tocarNoBloco(exato[0]);
      await abrirOCartao();
      expect(cartao()?.querySelector('.aproximado')).toBeNull();
    });

    describe('embaixo do nome de cada bloco, já no cartão pequeno', () => {
      const sobre = (cartao: HTMLElement | null, nome: string) =>
        Array.from(cartao?.querySelectorAll('.blocos-do-ponto li') ?? [])
          .find((linha) => linha.querySelector('.nome')?.textContent === nome)
          ?.querySelector('.sobre')?.textContent;

      it('vêm os artistas, quando as notícias citam', async () => {
        const { cartao, tocarNoBloco } = await renderizar(SABADO_14H);
        const agrada = BLOCOS.find((bloco) => bloco.id === 'agrada-gregos')!;
        await tocarNoBloco(agrada);
        expect(sobre(cartao(), 'Agrada Gregos')).toBe('Gloria Groove, Gretchen');
      });

      it('vem o horário, quando o bloco não tem artista divulgado', async () => {
        const { cartao, tocarNoBloco } = await renderizar(SABADO_14H);
        const carnaLau = BLOCOS.find((bloco) => bloco.id === 'carna-lau')!;
        await tocarNoBloco(carnaLau);
        // Às 14h, o Carna Lau (12h às 16h) já começou.
        expect(sobre(cartao(), 'Carna Lau')).toBe(textoDoHorario(carnaLau, 'rolando'));
        expect(sobre(cartao(), 'Carna Lau')).toBe('Começou às 12h · vai até 16h');
      });
    });

    it('leva "Ir a pé", Uber e Metrô ao ponto da concentração', async () => {
      const { cartao, tocarNoBloco } = await renderizar(SABADO_14H);
      const [bloco] = acharPonto('hoje', umBloco);
      await tocarNoBloco(bloco);
      const [lng, lat] = trajetoDoBloco(bloco.id)!.inicio;
      const links = Array.from(cartao()!.querySelectorAll<HTMLAnchorElement>('.acoes a'));
      expect(links.map((link) => link.textContent?.trim())).toEqual(['Ir a pé', 'Uber', 'Metrô']);
      const [aPe, uber, metro] = links;
      const rota = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      expect(aPe.getAttribute('href')).toBe(`${rota}&travelmode=walking`);
      expect(uber.getAttribute('href')).toContain(encodeURIComponent(`"latitude":${lat},"longitude":${lng}`));
      expect(metro.getAttribute('href')).toBe(`${rota}&travelmode=transit`);
      for (const link of links) {
        expect(link.getAttribute('rel')).toBe('noopener');
        expect(link.getAttribute('target')).toBe('_blank');
      }
    });

    it('o nome do lugar leva para a página dele', async () => {
      const { cartao, tocarNoBloco } = await renderizar(SABADO_14H);
      const [bloco] = acharPonto('hoje', umBloco);
      await tocarNoBloco(bloco);
      expect(cartao()!.querySelector('a.lugar')?.getAttribute('href')).toBe(`/local/${bloco.localId}`);
    });

    it('põe o pino, com o nome do bloco, no ponto escolhido', async () => {
      const { falso, tocarNoBloco } = await renderizar(SABADO_14H);
      const [bloco] = acharPonto('hoje', umBloco);
      await tocarNoBloco(bloco);
      expect(falso.pinos().map((pino) => pino.elemento.getAttribute('aria-label'))).toEqual([bloco.nome]);
    });

    it('o × minimiza o cartão (só os nomes e os botões de ir, com o pino) e, minimizado, fecha', async () => {
      const { fixture, cartao, falso, tocarNoBloco } = await renderizar(SABADO_14H);
      const [bloco] = acharPonto('hoje', umBloco);
      await tocarNoBloco(bloco);
      const fechar = () => cartao()!.querySelector<HTMLButtonElement>('.fechar')!;
      expect(fechar().getAttribute('aria-label')).toBe('Minimizar');
      fechar().click();
      await esperarOMapa(fixture);
      expect(cartao()?.classList.contains('minimizado')).toBe(true);
      expect(cartao()?.querySelector('.nome')?.textContent).toBe(bloco.nome);
      const links = Array.from(cartao()!.querySelectorAll<HTMLAnchorElement>('.acoes a'));
      expect(links.map((link) => link.textContent?.trim())).toEqual(['Ir a pé', 'Uber', 'Metrô']);
      expect(falso.pinos().map((pino) => pino.elemento.getAttribute('aria-label'))).toEqual([bloco.nome]);
      expect(fechar().getAttribute('aria-label')).toBe('Fechar');
      fechar().click();
      await esperarOMapa(fixture);
      expect(cartao()).toBeNull();
      expect(falso.pinos()).toEqual([]);
    });

    it('minimizado, a alça e o toque no pino voltam o cartão ao tamanho de quando abre', async () => {
      const { fixture, cartao, falso, tocarNoBloco } = await renderizar(SABADO_14H);
      await tocarNoBloco(acharPonto('hoje', umBloco)[0]);
      const minimizar = async () => {
        cartao()!.querySelector<HTMLButtonElement>('.fechar')!.click();
        await esperarOMapa(fixture);
      };
      await minimizar();
      cartao()!.querySelector<HTMLButtonElement>('.alca')!.click();
      await esperarOMapa(fixture);
      expect(cartao()?.classList.contains('minimizado')).toBe(false);
      expect(cartao()?.querySelector('.alca')?.getAttribute('aria-expanded')).toBe('false');
      await minimizar();
      falso.pinos()[0].elemento.click();
      await esperarOMapa(fixture);
      expect(cartao()?.classList.contains('minimizado')).toBe(false);
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

  describe('o cartão do ponto, que se puxa pela alça', () => {
    it('abre pequeno: o nome, o lugar e os botões, sem o resto, para a rota ficar à vista', async () => {
      const { cartao, tocarNoBloco } = await renderizar(SABADO_14H);
      await tocarNoBloco(acharPonto('hoje', umBloco)[0]);
      expect(cartao()?.querySelector('.nome')).not.toBeNull();
      expect(cartao()?.querySelector('.acoes')).not.toBeNull();
      expect(cartao()?.querySelector('.trajeto')).toBeNull();
      expect(cartao()?.querySelector('.alca')?.getAttribute('aria-expanded')).toBe('false');
    });

    it('cresce e encolhe tocando na alça, que diz o que faz para o leitor de tela', async () => {
      const { fixture, cartao, tocarNoBloco } = await renderizar(SABADO_14H);
      await tocarNoBloco(acharPonto('hoje', umBloco)[0]);
      const alca = () => cartao()!.querySelector<HTMLButtonElement>('.alca')!;
      expect(alca().getAttribute('aria-label')).toBe('Mostrar mais');
      alca().click();
      await esperarOMapa(fixture);
      expect(alca().getAttribute('aria-expanded')).toBe('true');
      expect(alca().getAttribute('aria-label')).toBe('Mostrar menos');
      expect(cartao()?.querySelector('.trajeto')).not.toBeNull();
      alca().click();
      await esperarOMapa(fixture);
      expect(cartao()?.querySelector('.trajeto')).toBeNull();
    });

    it('cresce puxando a alça para cima; para baixo, encolhe, minimiza e, já minimizado, fecha', async () => {
      const { fixture, cartao, tocarNoBloco } = await renderizar(SABADO_14H);
      await tocarNoBloco(acharPonto('hoje', umBloco)[0]);
      const puxar = async (de: number, ate: number) => {
        const alca = cartao()!.querySelector<HTMLButtonElement>('.alca')!;
        alca.dispatchEvent(new PointerEvent('pointerdown', { clientY: de, pointerId: 1 }));
        alca.dispatchEvent(new PointerEvent('pointermove', { clientY: ate, pointerId: 1 }));
        alca.dispatchEvent(new PointerEvent('pointerup', { clientY: ate, pointerId: 1 }));
        await esperarOMapa(fixture);
      };
      await puxar(500, 400);
      expect(cartao()?.querySelector('.alca')?.getAttribute('aria-expanded')).toBe('true');
      await puxar(400, 500);
      expect(cartao()?.querySelector('.alca')?.getAttribute('aria-expanded')).toBe('false');
      expect(cartao()?.classList.contains('minimizado')).toBe(false);
      await puxar(400, 500);
      expect(cartao()?.classList.contains('minimizado')).toBe(true);
      await puxar(500, 400);
      expect(cartao()?.classList.contains('minimizado')).toBe(false);
      await puxar(400, 500);
      await puxar(400, 500);
      expect(cartao()).toBeNull();
    });

    it('volta pequeno quando outro ponto é escolhido', async () => {
      const { cartao, tocarNoBloco, abrirOCartao } = await renderizar(SABADO_14H);
      const [primeiro, segundo] = [...pontosDaAba('hoje', SABADO_14H).values()].filter(umBloco).map(([b]) => b);
      await tocarNoBloco(primeiro);
      await abrirOCartao();
      await tocarNoBloco(segundo);
      expect(cartao()?.querySelector('.alca')?.getAttribute('aria-expanded')).toBe('false');
    });
  });

  describe('um ponto com 4 blocos ou mais', () => {
    const linhasDosBlocos = (cartao: HTMLElement | null) =>
      Array.from(cartao?.querySelectorAll<HTMLAnchorElement>('.blocos a') ?? []);
    const nomesEmDestaque = (cartao: HTMLElement | null) =>
      Array.from(cartao?.querySelectorAll('.blocos-do-ponto .nome') ?? []).map((nome) => nome.textContent);

    // Na Geral, o ponto do Agrada Gregos (Ibirapuera) junta os blocos de vários dias.
    async function abrirOPontoCheio() {
      const tela = await renderizar(SABADO_14H);
      await tela.tocarNaAba('Geral');
      const agrada = BLOCOS.find((bloco) => bloco.id === 'agrada-gregos')!;
      const doPonto = pontosDaAba('geral', SABADO_14H).get(comoTexto(trajetoDoBloco(agrada.id)!.inicio))!;
      expect(doPonto.length).toBeGreaterThan(3);
      await tela.tocarNoBloco(agrada);
      return { ...tela, doPonto };
    }

    it('mostra só os 2 de agora ou dos próximos horários, sem os que já acabaram', async () => {
      const { cartao, doPonto } = await abrirOPontoCheio();
      const aindaVao = [...doPonto]
        .sort((a, b) => (a.data + a.inicio).localeCompare(b.data + b.inicio))
        .filter((bloco) => momentoDoBloco(bloco, SABADO_14H) !== 'acabou');
      expect(nomesEmDestaque(cartao())).toEqual(aindaVao.slice(0, 2).map((bloco) => bloco.nome));
    });

    it('tem o "+ X blocos aqui", que abre o cartão com os outros', async () => {
      const { cartao, doPonto, fixture } = await abrirOPontoCheio();
      const mais = cartao()!.querySelector<HTMLButtonElement>('.mais-blocos')!;
      expect(mais.textContent?.trim()).toBe(`+ ${doPonto.length - 2} blocos aqui`);
      mais.click();
      await esperarOMapa(fixture);
      expect(cartao()?.querySelector('.alca')?.getAttribute('aria-expanded')).toBe('true');
      expect(cartao()?.querySelector('.mais-blocos')).toBeNull();
      const links = linhasDosBlocos(cartao());
      expect(links.length).toBe(Math.min(3, doPonto.length - 2));
      expect(links[0].textContent?.trim()).toMatch(/^\w{3} \d+ \w{3} · \d+h(\d\d)? · /);
      expect(links[0].getAttribute('href')).toMatch(/^\/local\/ibirapuera\//);
      const sobram = doPonto.length - 2 - links.length;
      if (sobram > 0) {
        expect(cartao()?.querySelector('.mais')?.textContent).toBe(`E mais ${sobram} na página do lugar.`);
      }
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
      const { tela, cartao, abrirOCartao } = await renderizar(SABADO_14H, {}, { bloco: outroDia.id });
      await abrirOCartao();
      expect(tela.querySelector('.aba[aria-pressed="true"]')?.textContent?.trim()).toBe('Geral');
      expect(cartao()?.querySelector('.blocos-do-ponto')?.textContent).toContain(outroDia.nome);
    });

    it('abre o mapa no ponto do próximo bloco do lugar', async () => {
      const { cartao, abrirOCartao } = await renderizar(SABADO_14H, {}, { lugar: 'ibirapuera' });
      await abrirOCartao();
      const primeiro = blocosDaAba('hoje', 'ibirapuera', SABADO_14H).find((bloco) => trajetoDoBloco(bloco.id))!;
      expect(cartao()?.querySelector('.lugar')?.textContent).toBe('Parque Ibirapuera');
      expect(cartao()?.querySelector('.blocos-do-ponto')?.textContent).toContain(primeiro.nome);
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

    describe('a lista "Perto de você"', () => {
      const lista = (tela: HTMLElement) => tela.querySelector<HTMLElement>('.perto-de-voce');
      const nomesDaLista = (tela: HTMLElement) =>
        Array.from(tela.querySelectorAll('.bloco-perto strong')).map((nome) => nome.textContent);

      it('não aparece antes de a pessoa mostrar onde está', async () => {
        const { tela } = await renderizar(SABADO_14H, { permissao: 'granted' });
        expect(lista(tela)).toBeNull();
      });

      it('depois do "onde estou", mostra os blocos rolando perto, com a distância', async () => {
        const { tela, tocarEmOndeEstou } = await renderizar(SABADO_14H, { permissao: 'granted' });
        await tocarEmOndeEstou();
        const esperados = blocosPertoDeVoce({ lat: -23.5614, lng: -46.6559 }, SABADO_14H);
        expect(lista(tela)?.querySelector('h2')?.textContent).toBe('Rolando perto de você');
        expect(nomesDaLista(tela)).toEqual(esperados.map(({ bloco }) => bloco.nome));
        const [primeiro] = esperados;
        expect(tela.querySelector('.bloco-perto span')?.textContent).toContain(
          `${textoDaDistancia(primeiro.metros)} · Já começou`,
        );
      });

      it('tocar num bloco da lista abre o cartão dele, na aba Hoje', async () => {
        const { tela, fixture, falso, cartao, tocarNaAba, tocarEmOndeEstou } = await renderizar(SABADO_14H, {
          permissao: 'granted',
        });
        await tocarNaAba('Geral');
        await tocarEmOndeEstou();
        const [primeiro] = blocosPertoDeVoce({ lat: -23.5614, lng: -46.6559 }, SABADO_14H);
        tela.querySelector<HTMLButtonElement>('.bloco-perto')!.click();
        await esperarOMapa(fixture);
        expect(cartao()).not.toBeNull();
        expect(tela.querySelector('.aba[aria-pressed="true"]')?.textContent?.trim()).toBe('Hoje');
        expect(falso.pinos().map((pino) => comoTexto(pino.posicao!))).toEqual([
          comoTexto(trajetoDoBloco(primeiro.bloco.id)!.inicio),
        ]);
        expect(lista(tela)).toBeNull();
      });

      it('fecha no ×, e volta no próximo "onde estou"', async () => {
        const { tela, fixture, tocarEmOndeEstou } = await renderizar(SABADO_14H, { permissao: 'granted' });
        await tocarEmOndeEstou();
        lista(tela)!.querySelector<HTMLButtonElement>('.fechar')!.click();
        await esperarOMapa(fixture);
        expect(lista(tela)).toBeNull();
        await tocarEmOndeEstou();
        expect(lista(tela)).not.toBeNull();
      });

      it('não aparece para quem está fora da Grande São Paulo', async () => {
        const { tela, tocarEmOndeEstou } = await renderizar(SABADO_14H, { permissao: 'granted', resposta: NO_RIO });
        await tocarEmOndeEstou();
        expect(lista(tela)).toBeNull();
      });

      it('num dia sem bloco, diz que não tem bloco hoje', async () => {
        const { tela, tocarEmOndeEstou } = await renderizar(SEXTA_ANTES, { permissao: 'granted' });
        await tocarEmOndeEstou();
        expect(lista(tela)?.textContent).toContain('Nenhum bloco hoje.');
      });
    });

    describe('a distância no cartão do ponto', () => {
      it('não aparece enquanto a pessoa não mostrou onde está', async () => {
        const { cartao, tocarNoBloco } = await renderizar(SABADO_14H);
        await tocarNoBloco(acharPonto('hoje', umBloco)[0]);
        expect(cartao()?.querySelector('.distancia')).toBeNull();
      });

      it('aparece, com o tempo a pé até a concentração, depois que a pessoa mostrou onde está', async () => {
        const { cartao, tocarNoBloco, tocarEmOndeEstou } = await renderizar(SABADO_14H, { permissao: 'granted' });
        await tocarEmOndeEstou();
        const [bloco] = acharPonto('hoje', umBloco);
        await tocarNoBloco(bloco);
        const [lng, lat] = trajetoDoBloco(bloco.id)!.inicio;
        const metros = distanciaEmMetros({ lat: -23.5614, lng: -46.6559 }, { lat, lng });
        expect(cartao()?.querySelector('.distancia')?.textContent).toBe(fraseDaDistancia(metros));
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

  describe('vindo do After', () => {
    const noMapa = (lugar: { lat: number; lng: number }) => comoTexto([lugar.lng, lugar.lat]);
    // O primeiro dia, ao meio-dia, que tem bloco da noite com ponto no mapa.
    const DIA_COM_NOITE = [...new Set(BLOCOS.map((bloco) => bloco.data))]
      .sort()
      .map((dia) => new Date(`${dia}T12:00:00`))
      .find((agora) => blocosDaNoite('hoje', agora).some((bloco) => trajetoDoBloco(bloco.id)))!;

    it('mostra os bares e os blocos da noite de hoje, sem as abas de dia', async () => {
      const { tela, posicoes, falso } = await renderizar(DIA_COM_NOITE, {}, { after: 'sim' });
      expect(tela.querySelector('app-abas-do-dia')).toBeNull();
      expect(tela.querySelector('.titulo-do-after')?.textContent).toContain('After de hoje');
      expect(tela.querySelector('.titulo-do-after a')?.getAttribute('href')).toBe('/mapa');
      const daNoite = blocosDaNoite('hoje', DIA_COM_NOITE).flatMap((bloco) => {
        const trajeto = trajetoDoBloco(bloco.id);
        return trajeto ? [comoTexto(trajeto.inicio)] : [];
      });
      expect(daNoite.length).toBeGreaterThan(0);
      const esperados = [...new Set([...daNoite, ...PONTOS_DO_AFTER.map(noMapa)])].sort();
      expect(posicoes()).toEqual(esperados);
      // Os lugares do After são azuis (no mapa, pinos pequenos, e não bolinhas como os blocos).
      const doAfter = falso.mapas[0].pontos().filter((ponto) => ponto.id.startsWith('after:'));
      expect(doAfter.length).toBe(PONTOS_DO_AFTER.length);
      expect(new Set(doAfter.map((ponto) => ponto.cor))).toEqual(new Set(['#2563eb']));
    });

    it('abre já no lugar pedido, com o que ele é e os botões de ir', async () => {
      const lugar = LUGARES_DO_AFTER[0];
      const { cartao, falso } = await renderizar(SABADO_14H, {}, { after: lugar.id });
      expect(cartao()?.querySelector('.nome')?.textContent).toBe(lugar.nome);
      expect(cartao()?.querySelector('.sobre')?.textContent).toBe(`${lugar.tipo} · ${lugar.endereco}`);
      const links = Array.from(cartao()!.querySelectorAll<HTMLAnchorElement>('.acoes a'));
      expect(links.map((link) => link.textContent?.trim())).toEqual(['Ir a pé', 'Uber', 'Metrô']);
      const [pino] = falso.pinos();
      expect(comoTexto(pino.posicao!)).toBe(noMapa(lugar));
      expect(pino.elemento.classList.contains('pino-after')).toBe(true);
    });

    it('o × do lugar do After minimiza (só o nome e os botões de ir) e a seta volta', async () => {
      const lugar = LUGARES_DO_AFTER[0];
      const { fixture, cartao } = await renderizar(SABADO_14H, {}, { after: lugar.id });
      expect(cartao()?.querySelector('.alca')).toBeNull();
      cartao()!.querySelector<HTMLButtonElement>('.fechar')!.click();
      await esperarOMapa(fixture);
      expect(cartao()?.classList.contains('minimizado')).toBe(true);
      expect(cartao()?.querySelector('.nome')?.textContent).toBe(lugar.nome);
      expect(cartao()?.querySelectorAll('.acoes a').length).toBe(3);
      cartao()!.querySelector<HTMLButtonElement>('.alca')!.click();
      await esperarOMapa(fixture);
      expect(cartao()?.classList.contains('minimizado')).toBe(false);
      expect(cartao()?.querySelector('.alca')).toBeNull();
    });

    it('junta num pino só os lugares vizinhos, como o Galo e o Meretriz', async () => {
      expect(PONTOS_DO_AFTER.length).toBeLessThan(LUGARES_DO_AFTER.length);
      const { cartao, falso } = await renderizar(SABADO_14H, {}, { after: 'galo' });
      const nomes = Array.from(cartao()!.querySelectorAll('.nome')).map((nome) => nome.textContent);
      expect(nomes).toEqual(['Meretriz', 'Galo']);
      const [pino] = falso.pinos();
      expect(pino.elemento.getAttribute('aria-label')).toBe('Meretriz e Galo');
    });

    it('sem o toque em "Onde estou", não procura a pessoa', async () => {
      const { geo } = await renderizar(SABADO_14H, { permissao: 'granted' }, { after: 'sim' });
      expect(geo.chamadas.length).toBe(0);
    });

    it('chegando pelo "Onde estou", procura a pessoa uma vez e mostra o After mais perto dela', async () => {
      const { fixture, tela, geo } = await renderizar(SABADO_14H, { permissao: 'granted' }, { after: 'sim' }, () =>
        TestBed.inject(Localizacao).procurarAoAbrirOMapa(),
      );
      await esperarOMapa(fixture);
      expect(geo.chamadas.length).toBe(1);
      const lista = tela.querySelector('.perto-de-voce');
      expect(lista?.querySelector('h2')?.textContent).toBe('Perto de você');
      const itens = Array.from(lista!.querySelectorAll('.bloco-perto'));
      expect(itens.length).toBe(4);
      const voce = { lat: -23.5614, lng: -46.6559 };
      const maisPerto = [...LUGARES_DO_AFTER].sort((a, b) => distanciaEmMetros(voce, a) - distanciaEmMetros(voce, b))[0];
      const distancias = itens.map((item) => item.querySelector('span')?.textContent ?? '');
      expect(distancias.some((texto) => texto.startsWith(textoDaDistancia(distanciaEmMetros(voce, maisPerto))))).toBe(true);
    });
  });
});
