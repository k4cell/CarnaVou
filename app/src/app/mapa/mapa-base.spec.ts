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

  it('põe um pino para cada ponto, na posição certa e com o nome para o leitor de tela', async () => {
    const { falso } = await renderizar([SE, SANTO_AMARO]);
    const pinos = falso.pinos();
    expect(pinos.length).toBe(2);
    expect(pinos[0].posicao).toEqual([SE.lng, SE.lat]);
    expect(pinos[0].elemento.getAttribute('aria-label')).toBe('Praça da Sé');
    expect(pinos[1].posicao).toEqual([SANTO_AMARO.lng, SANTO_AMARO.lat]);
  });

  it('pinta cada pino com a cor da zona do lugar', async () => {
    const { falso } = await renderizar([SE, SANTO_AMARO, PINHEIROS]);
    const classes = falso.pinos().map((pino) => pino.elemento.className);
    expect(classes[0]).toContain('pino-centro');
    expect(classes[1]).toContain('pino-sul');
    expect(classes[2]).toContain('pino-oeste');
  });

  it('avisa qual lugar foi escolhido quando alguém toca no pino', async () => {
    const { falso, escolhidos } = await renderizar([SE, SANTO_AMARO]);
    falso.pinos()[1].elemento.click();
    expect(escolhidos).toEqual(['santo-amaro']);
  });

  it('avisa quando alguém toca no mapa fora dos pinos', async () => {
    const { fixture, falso } = await renderizar([SE]);
    let toques = 0;
    fixture.componentInstance.fundoTocado.subscribe(() => toques++);
    falso.mapas[0].tocar();
    expect(toques).toBe(1);
  });

  it('destaca só o pino do lugar selecionado', async () => {
    const { falso, mudar } = await renderizar([SE, SANTO_AMARO]);
    await mudar({ selecionado: 'se' });
    const [primeiro, segundo] = falso.pinos();
    expect(primeiro.elemento.classList.contains('selecionado')).toBe(true);
    expect(primeiro.elemento.getAttribute('aria-pressed')).toBe('true');
    expect(segundo.elemento.classList.contains('selecionado')).toBe(false);
    expect(segundo.elemento.getAttribute('aria-pressed')).toBe('false');
  });

  it('puxa o mapa para o lugar selecionado', async () => {
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

  it('tira do mapa os pinos que saíram da lista e enquadra de novo', async () => {
    const { falso, mudar } = await renderizar([SE, SANTO_AMARO, PINHEIROS]);
    await mudar({ pontos: [PINHEIROS, SE] });
    expect(falso.pinos().map((pino) => pino.elemento.getAttribute('aria-label'))).toEqual([
      'Praça da Sé',
      'Pinheiros',
    ]);
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
    type Linhas = { features: { properties: Record<string, unknown>; geometry: { coordinates: unknown } }[] };
    const linhas = (falso: ReturnType<typeof criarMapLibreFalso>) =>
      falso.mapas[0].fontes.get('trajetos')?.dados as Linhas | undefined;

    it('só desenha as linhas depois de o mapa carregar', async () => {
      const { falso, fixture, mudar } = await renderizar([SE]);
      await mudar({ trajetos: [NA_SE] });
      expect(linhas(falso)).toBeUndefined();
      falso.mapas[0].carregar();
      await esperarOMapa(fixture);
      expect(linhas(falso)?.features.length).toBe(1);
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

    it('põe uma borda branca embaixo da linha colorida', async () => {
      const { falso, mudar } = await renderizar([SE]);
      falso.mapas[0].carregar();
      await mudar({ trajetos: [NA_SE] });
      expect(falso.mapas[0].camadas.map((camada) => camada['id'])).toEqual(['trajetos-borda', 'trajetos-linha']);
    });

    it('marca o trajeto do lugar selecionado, para ele ficar mais grosso', async () => {
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
      expect(falso.mapas[0].camadas.length).toBe(2);
      expect(linhas(falso)!.features.map((linha) => linha.properties['id'])).toEqual(['santo-amaro']);
      await mudar({ trajetos: [] });
      expect(linhas(falso)!.features).toEqual([]);
    });

    it('não cria nada no mapa enquanto não há trajeto', async () => {
      const { falso, fixture } = await renderizar([SE]);
      falso.mapas[0].carregar();
      await esperarOMapa(fixture);
      expect(falso.mapas[0].fontes.has('trajetos')).toBe(false);
    });

    it('ao escolher um lugar com trajeto, enquadra o trajeto inteiro e o pino', async () => {
      const { falso, mudar } = await renderizar([SE, SANTO_AMARO]);
      await mudar({ trajetos: [NA_SE] });
      const antes = falso.mapas[0].enquadramentos.length;
      await mudar({ selecionado: 'se' });
      expect(falso.mapas[0].enquadramentos.length).toBe(antes + 1);
      const ultimo = falso.mapas[0].enquadramentos.at(-1)!;
      expect(ultimo.limites.pontos).toEqual([[SE.lng, SE.lat], ...NA_SE.linha]);
    });

    it('ao escolher um lugar sem trajeto, só puxa o mapa para o pino', async () => {
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

    it('não desenha ninguém enquanto a pessoa não pediu para ver onde está', async () => {
      const { falso } = await renderizar([SE]);
      falso.mapas[0].carregar();
      expect(falso.bolinha()).toBeUndefined();
      expect(falso.mapas[0].fontes.size).toBe(0);
    });

    it('põe uma bolinha, avisada para o leitor de tela, na posição da pessoa', async () => {
      const { falso, mudar } = await renderizar([SE]);
      await mudar({ voce: VOCE });
      const bolinha = falso.bolinha();
      expect(bolinha?.posicao).toEqual([VOCE.lng, VOCE.lat]);
      expect(bolinha?.elemento.getAttribute('aria-label')).toBe('Você está aqui');
      expect(bolinha?.opcoes.anchor).toBe('center');
    });

    it('não confunde a bolinha com um pino de lugar', async () => {
      const { falso, mudar } = await renderizar([SE, SANTO_AMARO]);
      await mudar({ voce: VOCE });
      expect(falso.pinos().length).toBe(2);
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
      expect([...falso.mapas[0].fontes.keys()]).toEqual(['voce-precisao']);
      expect(falso.mapas[0].camadas.map((camada) => camada['type'])).toEqual(['fill', 'line']);
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
      const area = falso.mapas[0].camadas[0]['paint'] as Record<string, unknown>;
      expect(String(area['fill-color']).toLowerCase()).toBe('#e21d89');
    });

    it('atualiza o círculo, sem criar outro, quando a posição muda ou some', async () => {
      const { falso, mudar } = await renderizar([SE]);
      falso.mapas[0].carregar();
      await mudar({ voce: VOCE });
      await mudar({ voce: { lat: -23.57, lng: -46.66, precisao: 30 } });
      const fonte = falso.mapas[0].fontes.get('voce-precisao');
      expect(falso.mapas[0].fontes.size).toBe(1);
      expect(falso.mapas[0].camadas.length).toBe(2);
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

  it('fecha o mapa e tira os pinos quando a tela é destruída', async () => {
    const { fixture, falso } = await renderizar([SE, SANTO_AMARO]);
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
