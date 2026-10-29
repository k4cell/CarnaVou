import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { MapaBase, PontoNoMapa } from './mapa-base';
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

    const mudar = async (entradas: { pontos?: PontoNoMapa[]; selecionado?: string | null }) => {
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
