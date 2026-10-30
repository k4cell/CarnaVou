import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { distanciaEmMetros } from '../localizacao/distancia';
import { MapaBase, PontoNoMapa, PosicaoNoMapa, TrajetoNoMapa } from './mapa-base';
import { BibliotecaDeMapa, CARREGAR_MAPLIBRE } from './maplibre';
import { criarMapLibreFalso, esperarOMapa } from './maplibre-falso';

const SE: PontoNoMapa = { id: 'se', nome: 'Praça da Sé', lat: -23.55, lng: -46.63, zona: 'centro' };
const SANTO_AMARO: PontoNoMapa = { id: 'santo-amaro', nome: 'Santo Amaro', lat: -23.64, lng: -46.71, zona: 'sul' };
const PINHEIROS: PontoNoMapa = { id: 'pinheiros', nome: 'Pinheiros', lat: -23.56, lng: -46.69, zona: 'oeste' };

describe('MapaBase', () => {
  async function renderizar(
    pontos: PontoNoMapa[],
    carregar?: () => Promise<BibliotecaDeMapa>,
  ) {
    const falso = criarMapLibreFalso();
    await TestBed.configureTestingModule({
      imports: [MapaBase],
      providers: [
        provideRouter([]),
        { provide: CARREGAR_MAPLIBRE, useValue: carregar ?? (() => Promise.resolve(falso.biblioteca)) },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(MapaBase);
    fixture.componentRef.setInput('pontos', pontos);
    const escolhidos: string[] = [];
    fixture.componentInstance.escolher.subscribe((id) => escolhidos.push(id));
    await esperarOMapa(fixture);

    const mudar = async (entradas: {
      pontos?: PontoNoMapa[];
      selecionado?: string | null;
      voce?: PosicaoNoMapa | null;
      trajetos?: TrajetoNoMapa[];
    }) => {
      for (const [nome, valor] of Object.entries(entradas)) {
        fixture.componentRef.setInput(nome, valor);
      }
      await esperarOMapa(fixture);
    };
    return { fixture, tela: fixture.nativeElement as HTMLElement, falso, escolhidos, mudar };
  }

  it('abre o mapa com o estilo do CarnaVou, sem girar nem inclinar', async () => {
    const { falso } = await renderizar([SE]);
    expect(falso.mapas.length).toBe(1);
    const opcoes = falso.mapas[0].opcoes;
    expect(String(opcoes['style'])).toMatch(/mapa\/estilo-carnavou\.json$/);
    expect(opcoes['dragRotate']).toBe(false);
    expect(opcoes['touchPitch']).toBe(false);
    expect(falso.mapas[0].rotacaoDesligada).toBe(true);
  });

  it('diz ao MapLibre onde está o worker, que o build copia para a pasta do mapa', async () => {
    const { falso } = await renderizar([SE]);
    expect(falso.worker()).toMatch(/\/mapa\/maplibre-gl-worker\.mjs$/);
  });

  it('põe uma bolinha para cada ponto, na posição certa, depois de o mapa carregar', async () => {
    const { falso, fixture } = await renderizar([SE, SANTO_AMARO]);
    expect(falso.mapas[0].pontos()).toEqual([]);
    falso.mapas[0].carregar();
    await esperarOMapa(fixture);
    const pontos = falso.mapas[0].pontos();
    expect(pontos.map((ponto) => ponto.id)).toEqual(['se', 'santo-amaro']);
    expect(pontos[0].posicao).toEqual([SE.lng, SE.lat]);
    expect(pontos[1].posicao).toEqual([SANTO_AMARO.lng, SANTO_AMARO.lat]);
    // São bolinhas do mapa, e não pinos: assim cabem centenas sem pesar no celular.
    expect(falso.pinos().length).toBe(0);
  });

  it('pinta cada bolinha com a cor da zona do lugar', async () => {
    const { falso, fixture } = await renderizar([SE, SANTO_AMARO, PINHEIROS]);
    falso.mapas[0].carregar();
    await esperarOMapa(fixture);
    expect(falso.mapas[0].pontos().map((ponto) => ponto.cor)).toEqual(['#6a0dad', '#00e676', '#d62828']);
  });

  it('avisa qual ponto foi escolhido quando alguém toca na bolinha, com folga em volta do dedo', async () => {
    const { falso, fixture, escolhidos } = await renderizar([SE, SANTO_AMARO]);
    falso.mapas[0].carregar();
    await esperarOMapa(fixture);
    falso.mapas[0].tocarNoPonto('santo-amaro');
    expect(escolhidos).toEqual(['santo-amaro']);
    const consulta = falso.mapas[0].consultas.at(-1);
    expect(consulta?.caixa).toEqual([
      [86, 186],
      [114, 214],
    ]);
    expect(consulta?.opcoes).toEqual({ layers: ['pontos-bolinhas'] });
  });

  it('avisa quando alguém toca no mapa fora dos pontos', async () => {
    const { fixture, falso, escolhidos } = await renderizar([SE]);
    let toques = 0;
    fixture.componentInstance.fundoTocado.subscribe(() => toques++);
    falso.mapas[0].tocar();
    falso.mapas[0].carregar();
    await esperarOMapa(fixture);
    falso.mapas[0].tocar();
    expect(toques).toBe(2);
    expect(escolhidos).toEqual([]);
  });

  it('põe o pino só no ponto selecionado, com o nome para o leitor de tela, no lugar da bolinha', async () => {
    const { falso, fixture, mudar } = await renderizar([SE, SANTO_AMARO]);
    falso.mapas[0].carregar();
    await mudar({ selecionado: 'se' });
    const pinos = falso.pinos();
    expect(pinos.length).toBe(1);
    expect(pinos[0].posicao).toEqual([SE.lng, SE.lat]);
    expect(pinos[0].elemento.getAttribute('aria-label')).toBe('Praça da Sé');
    expect(pinos[0].elemento.getAttribute('aria-pressed')).toBe('true');
    expect(pinos[0].elemento.className).toContain('pino-centro');
    expect(pinos[0].opcoes.anchor).toBe('bottom');
    expect(falso.mapas[0].pontos().map((ponto) => ponto.id)).toEqual(['santo-amaro']);
    await esperarOMapa(fixture);
  });

  it('troca o pino quando outro ponto é escolhido e tira quando nenhum está', async () => {
    const { falso, mudar } = await renderizar([SE, SANTO_AMARO]);
    await mudar({ selecionado: 'se' });
    await mudar({ selecionado: 'santo-amaro' });
    expect(falso.pinos().map((pino) => pino.posicao)).toEqual([[SANTO_AMARO.lng, SANTO_AMARO.lat]]);
    await mudar({ selecionado: null });
    expect(falso.pinos().length).toBe(0);
  });

  it('puxa o mapa para o ponto selecionado', async () => {
    const { falso, mudar } = await renderizar([SE, SANTO_AMARO]);
    await mudar({ selecionado: 'santo-amaro' });
    const ultimo = falso.mapas[0].movimentos.at(-1);
    expect(ultimo?.['center']).toEqual([SANTO_AMARO.lng, SANTO_AMARO.lat]);
  });

  it('enquadra todos os pontos de uma vez', async () => {
    const { falso } = await renderizar([SE, SANTO_AMARO, PINHEIROS]);
    const enquadramento = falso.mapas[0].enquadramentos[0];
    expect(enquadramento.limites.pontos).toEqual([
      [SE.lng, SE.lat],
      [SANTO_AMARO.lng, SANTO_AMARO.lat],
      [PINHEIROS.lng, PINHEIROS.lat],
    ]);
  });

  it('chega perto quando só tem um ponto', async () => {
    const { falso } = await renderizar([SE]);
    expect(falso.mapas[0].enquadramentos.length).toBe(0);
    const movimento = falso.mapas[0].movimentos[0];
    expect(movimento['center']).toEqual([SE.lng, SE.lat]);
    expect(movimento['zoom']).toBe(14);
  });

  it('tira do mapa as bolinhas que saíram da lista e enquadra de novo', async () => {
    const { falso, fixture, mudar } = await renderizar([SE, SANTO_AMARO, PINHEIROS]);
    falso.mapas[0].carregar();
    await esperarOMapa(fixture);
    await mudar({ pontos: [PINHEIROS, SE] });
    expect(falso.mapas[0].pontos().map((ponto) => ponto.id)).toEqual(['pinheiros', 'se']);
    expect(falso.mapas[0].fontes.get('pontos')?.atualizacoes).toBe(1);
    expect(falso.mapas[0].enquadramentos.length).toBe(2);
  });

  it('não enquadra de novo quando a lista de lugares é a mesma', async () => {
    const { falso, mudar } = await renderizar([SE, SANTO_AMARO]);
    await mudar({ pontos: [SE, SANTO_AMARO], selecionado: 'se' });
    expect(falso.mapas[0].enquadramentos.length).toBe(1);
  });

  describe('os trajetos', () => {
    const NA_SE: TrajetoNoMapa = { id: 'se', zona: 'centro', linha: [[-46.63, -23.55], [-46.632, -23.552]] };
    const EM_SANTO_AMARO: TrajetoNoMapa = {
      id: 'santo-amaro',
      zona: 'sul',
      linha: [[-46.71, -23.64], [-46.712, -23.642]],
    };
    type Desenho = { properties: Record<string, unknown>; geometry: { type: string; coordinates: unknown } };
    const desenhos = (falso: ReturnType<typeof criarMapLibreFalso>) =>
      (falso.mapas[0].fontes.get('trajetos')?.dados as { features: Desenho[] } | undefined)?.features;
    const linhas = (falso: ReturnType<typeof criarMapLibreFalso>) => {
      const todos = desenhos(falso);
      return todos && { features: todos.filter((desenho) => desenho.geometry.type === 'LineString') };
    };
    const fins = (falso: ReturnType<typeof criarMapLibreFalso>) =>
      (desenhos(falso) ?? []).filter((desenho) => desenho.geometry.type === 'Point');
    const camadasDosTrajetos = (falso: ReturnType<typeof criarMapLibreFalso>) =>
      falso.mapas[0].camadas.filter((camada) => camada['source'] === 'trajetos').map((camada) => camada['id']);

    it('só desenha as linhas depois de o mapa carregar', async () => {
      const { falso, fixture, mudar } = await renderizar([SE]);
      await mudar({ trajetos: [NA_SE] });
      expect(linhas(falso)).toBeUndefined();
      falso.mapas[0].carregar();
      await esperarOMapa(fixture);
      expect(linhas(falso)?.features.length).toBe(1);
    });

    it('marca o fim de cada linha com uma bolinha, menos quando a linha volta ao começo', async () => {
      const VOLTA: TrajetoNoMapa = {
        id: 'santo-amaro',
        zona: 'sul',
        linha: [[-46.71, -23.64], [-46.712, -23.642], [-46.71, -23.64]],
      };
      const { falso, mudar } = await renderizar([SE, SANTO_AMARO]);
      falso.mapas[0].carregar();
      await mudar({ trajetos: [NA_SE, VOLTA] });
      expect(fins(falso).map((fim) => fim.geometry.coordinates)).toEqual([NA_SE.linha.at(-1)]);
      expect(fins(falso)[0].properties['cor']).toBe('#6a0dad');
    });

    it('desenha uma linha por trajeto, seguindo os pontos, na cor da zona', async () => {
      const { falso, mudar } = await renderizar([SE, SANTO_AMARO]);
      falso.mapas[0].carregar();
      await mudar({ trajetos: [NA_SE, EM_SANTO_AMARO] });
      const [doCentro, doSul] = linhas(falso)!.features;
      expect(doCentro.geometry.coordinates).toEqual(NA_SE.linha);
      expect(doCentro.properties['cor']).toBe('#6a0dad');
      expect(doSul.properties['cor']).toBe('#00e676');
    });

    it('põe uma borda branca embaixo da linha colorida, e a bolinha do fim por cima', async () => {
      const { falso, mudar } = await renderizar([SE]);
      falso.mapas[0].carregar();
      await mudar({ trajetos: [NA_SE] });
      expect(camadasDosTrajetos(falso)).toEqual(['trajetos-borda', 'trajetos-linha', 'trajetos-fim']);
    });

    it('fica por cima das bolinhas dos pontos', async () => {
      const { falso, mudar } = await renderizar([SE]);
      falso.mapas[0].carregar();
      await mudar({ trajetos: [NA_SE] });
      const ids = falso.mapas[0].camadas.map((camada) => camada['id']);
      expect(ids.indexOf('pontos-bolinhas')).toBeLessThan(ids.indexOf('trajetos-borda'));
    });

    it('marca o trajeto do ponto selecionado, para ele ficar mais grosso', async () => {
      const { falso, mudar } = await renderizar([SE, SANTO_AMARO]);
      falso.mapas[0].carregar();
      await mudar({ trajetos: [NA_SE, EM_SANTO_AMARO], selecionado: 'santo-amaro' });
      expect(linhas(falso)!.features.map((linha) => linha.properties['selecionado'])).toEqual([false, true]);
    });

    it('troca as linhas sem criar outra fonte quando a lista muda', async () => {
      const { falso, mudar } = await renderizar([SE, SANTO_AMARO]);
      falso.mapas[0].carregar();
      await mudar({ trajetos: [NA_SE, EM_SANTO_AMARO] });
      await mudar({ trajetos: [EM_SANTO_AMARO] });
      expect(camadasDosTrajetos(falso).length).toBe(3);
      expect(linhas(falso)!.features.map((linha) => linha.properties['id'])).toEqual(['santo-amaro']);
      await mudar({ trajetos: [] });
      expect(desenhos(falso)).toEqual([]);
    });

    it('não cria nada no mapa enquanto não há trajeto', async () => {
      const { falso, fixture } = await renderizar([SE]);
      falso.mapas[0].carregar();
      await esperarOMapa(fixture);
      expect(falso.mapas[0].fontes.has('trajetos')).toBe(false);
    });

    it('ao escolher um ponto com trajeto, enquadra o trajeto inteiro e o pino', async () => {
      const { falso, mudar } = await renderizar([SE, SANTO_AMARO]);
      await mudar({ trajetos: [NA_SE] });
      const antes = falso.mapas[0].enquadramentos.length;
      await mudar({ selecionado: 'se' });
      expect(falso.mapas[0].enquadramentos.length).toBe(antes + 1);
      const ultimo = falso.mapas[0].enquadramentos.at(-1)!;
      expect(ultimo.limites.pontos).toEqual([[SE.lng, SE.lat], ...NA_SE.linha]);
    });

    it('ao escolher um ponto sem trajeto, só puxa o mapa para o pino', async () => {
      const { falso, mudar } = await renderizar([SE, SANTO_AMARO]);
      await mudar({ trajetos: [NA_SE] });
      const antes = falso.mapas[0].enquadramentos.length;
      await mudar({ selecionado: 'santo-amaro' });
      expect(falso.mapas[0].enquadramentos.length).toBe(antes);
      expect(falso.mapas[0].movimentos.at(-1)?.['center']).toEqual([SANTO_AMARO.lng, SANTO_AMARO.lat]);
    });

    it('fica embaixo do círculo de precisão da pessoa', async () => {
      const { falso, fixture, mudar } = await renderizar([SE]);
      await mudar({ voce: { lat: -23.56, lng: -46.65, precisao: 50 } });
      falso.mapas[0].carregar();
      await esperarOMapa(fixture);
      await mudar({ trajetos: [NA_SE] });
      const borda = falso.mapas[0].camadas.find((camada) => camada['id'] === 'trajetos-borda');
      expect(borda?.['embaixoDe']).toBe('voce-precisao-area');
    });
  });

  describe('a pessoa no mapa', () => {
    const VOCE: PosicaoNoMapa = { lat: -23.56, lng: -46.65, precisao: 120 };
    const camadasDaPessoa = (falso: ReturnType<typeof criarMapLibreFalso>) =>
      falso.mapas[0].camadas.filter((camada) => camada['source'] === 'voce-precisao');

    it('não desenha ninguém enquanto a pessoa não pediu para ver onde está', async () => {
      const { falso, fixture } = await renderizar([SE]);
      falso.mapas[0].carregar();
      await esperarOMapa(fixture);
      expect(falso.bolinha()).toBeUndefined();
      expect(falso.mapas[0].fontes.has('voce-precisao')).toBe(false);
    });

    it('põe uma bolinha, avisada para o leitor de tela, na posição da pessoa', async () => {
      const { falso, mudar } = await renderizar([SE]);
      await mudar({ voce: VOCE });
      const bolinha = falso.bolinha();
      expect(bolinha?.posicao).toEqual([VOCE.lng, VOCE.lat]);
      expect(bolinha?.elemento.getAttribute('aria-label')).toBe('Você está aqui');
      expect(bolinha?.opcoes.anchor).toBe('center');
    });

    it('não confunde a bolinha com o pino do ponto escolhido', async () => {
      const { falso, mudar } = await renderizar([SE, SANTO_AMARO]);
      await mudar({ voce: VOCE, selecionado: 'se' });
      expect(falso.pinos().length).toBe(1);
      expect(falso.bolinha()).toBeDefined();
    });

    it('move a mesma bolinha quando a posição muda', async () => {
      const { falso, mudar } = await renderizar([SE]);
      await mudar({ voce: VOCE });
      await mudar({ voce: { lat: -23.57, lng: -46.66, precisao: 30 } });
      expect(falso.marcadores.filter((m) => m.elemento.classList.contains('voce')).length).toBe(1);
      expect(falso.bolinha()?.posicao).toEqual([-46.66, -23.57]);
    });

    it('tira a bolinha quando a posição some', async () => {
      const { falso, mudar } = await renderizar([SE]);
      await mudar({ voce: VOCE });
      await mudar({ voce: null });
      expect(falso.bolinha()).toBeUndefined();
    });

    it('só desenha o círculo de precisão depois de o mapa carregar', async () => {
      const { falso, fixture, mudar } = await renderizar([SE]);
      await mudar({ voce: VOCE });
      expect(falso.mapas[0].fontes.size).toBe(0);
      falso.mapas[0].carregar();
      await esperarOMapa(fixture);
      expect(falso.mapas[0].fontes.has('voce-precisao')).toBe(true);
      expect(camadasDaPessoa(falso).map((camada) => camada['type'])).toEqual(['fill', 'line']);
    });

    it('desenha o círculo com o raio da precisão e na cor rosa do app', async () => {
      const { falso, mudar } = await renderizar([SE]);
      falso.mapas[0].carregar();
      await mudar({ voce: VOCE });
      const contorno = (
        falso.mapas[0].fontes.get('voce-precisao')?.dados as { geometry: { coordinates: [number, number][][] } }
      ).geometry.coordinates[0];
      for (const [lng, lat] of contorno) {
        const metros = distanciaEmMetros(VOCE, { lat, lng });
        expect(metros).toBeGreaterThan(VOCE.precisao * 0.99);
        expect(metros).toBeLessThan(VOCE.precisao * 1.01);
      }
      const area = camadasDaPessoa(falso)[0]['paint'] as Record<string, unknown>;
      expect(String(area['fill-color']).toLowerCase()).toBe('#e21d89');
    });

    it('atualiza o círculo, sem criar outro, quando a posição muda ou some', async () => {
      const { falso, mudar } = await renderizar([SE]);
      falso.mapas[0].carregar();
      await mudar({ voce: VOCE });
      await mudar({ voce: { lat: -23.57, lng: -46.66, precisao: 30 } });
      const fonte = falso.mapas[0].fontes.get('voce-precisao');
      expect(camadasDaPessoa(falso).length).toBe(2);
      expect(fonte?.atualizacoes).toBe(1);
      await mudar({ voce: null });
      expect(fonte?.dados).toEqual({ type: 'FeatureCollection', features: [] });
    });

    it('leva o mapa até a pessoa e chega mais perto', async () => {
      const { falso, fixture } = await renderizar([SE]);
      fixture.componentInstance.irPara(VOCE.lat, VOCE.lng);
      const movimento = falso.mapas[0].movimentos.at(-1);
      expect(movimento?.['center']).toEqual([VOCE.lng, VOCE.lat]);
      expect(movimento?.['zoom']).toBe(15);
    });

    it('não se afasta se o mapa já estiver bem perto', async () => {
      const { falso, fixture } = await renderizar([SE]);
      falso.mapas[0].zoom = 17;
      fixture.componentInstance.irPara(VOCE.lat, VOCE.lng);
      expect(falso.mapas[0].movimentos.at(-1)?.['zoom']).toBe(17);
    });

    it('tira a bolinha quando a tela é destruída', async () => {
      const { falso, fixture, mudar } = await renderizar([SE]);
      await mudar({ voce: VOCE });
      const bolinha = falso.bolinha();
      fixture.destroy();
      expect(bolinha?.removido).toBe(true);
    });
  });

  it('fecha o mapa e tira o pino quando a tela é destruída', async () => {
    const { fixture, falso, mudar } = await renderizar([SE, SANTO_AMARO]);
    await mudar({ selecionado: 'se' });
    expect(falso.pinos().length).toBe(1);
    fixture.destroy();
    expect(falso.mapas[0].removido).toBe(true);
    expect(falso.pinos().length).toBe(0);
  });

  it('não abre o mapa se a tela foi destruída antes de o MapLibre chegar', async () => {
    const falso = criarMapLibreFalso();
    let chegou!: () => void;
    const demora = () =>
      new Promise<BibliotecaDeMapa>((resolve) => {
        chegou = () => resolve(falso.biblioteca);
      });
    await TestBed.configureTestingModule({
      imports: [MapaBase],
      providers: [provideRouter([]), { provide: CARREGAR_MAPLIBRE, useValue: demora }],
    }).compileComponents();
    const fixture = TestBed.createComponent(MapaBase);
    fixture.componentRef.setInput('pontos', [SE]);
    await fixture.whenStable();
    fixture.destroy();
    chegou();
    await Promise.resolve();
    expect(falso.mapas.length).toBe(0);
  });

  describe('quando o MapLibre não carrega sem internet', () => {
    afterEach(() => {
      Reflect.deleteProperty(navigator, 'onLine');
    });

    it('explica que o mapa só fica guardado depois de aberto uma vez com internet', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
      const aviso = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const { tela } = await renderizar([SE], () => Promise.reject(new Error('sem rede')));
      const mensagem = tela.querySelector('.mapa-erro')?.textContent ?? '';
      expect(mensagem).toContain('Sem internet');
      expect(mensagem).toContain('abre o mapa uma vez com internet');
      expect(mensagem).not.toContain('Não consegui abrir');
      aviso.mockRestore();
    });
  });

  describe('quando o MapLibre não carrega', () => {
    it('avisa com uma mensagem e manda para a lista', async () => {
      const aviso = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const { tela } = await renderizar([SE], () => Promise.reject(new Error('sem internet')));
      const mensagem = tela.querySelector('.mapa-erro');
      expect(mensagem?.textContent).toContain('Não consegui abrir o mapa');
      expect(mensagem?.querySelector('a')?.getAttribute('href')).toBe('/');
      aviso.mockRestore();
    });
  });
});
