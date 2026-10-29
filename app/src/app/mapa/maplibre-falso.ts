import type { ComponentFixture } from '@angular/core/testing';

import { BibliotecaDeMapa } from './maplibre';

/*
 * Um MapLibre de mentirinha, só para os testes: não desenha nada, só anota o que o app pediu.
 * Assim os testes não dependem de WebGL nem da internet. Não entra no site.
 */

export class LimitesFalsos {
  readonly pontos: [number, number][] = [];

  extend(ponto: [number, number]): this {
    this.pontos.push(ponto);
    return this;
  }
}

export class MapaFalso {
  removido = false;
  rotacaoDesligada = false;
  readonly enquadramentos: { limites: LimitesFalsos; opcoes: Record<string, unknown> }[] = [];
  readonly movimentos: Record<string, unknown>[] = [];
  readonly camadas: Record<string, unknown>[] = [];
  readonly fontes = new Map<string, { definicao: Record<string, unknown>; dados: unknown; atualizacoes: number }>();
  zoom = 11;
  readonly touchZoomRotate = {
    disableRotation: () => {
      this.rotacaoDesligada = true;
    },
  };

  private readonly ouvintes = new Map<string, () => void>();

  constructor(readonly opcoes: Record<string, unknown>) {}

  on(evento: string, ouvinte: () => void): this {
    this.ouvintes.set(evento, ouvinte);
    return this;
  }

  /** Dispara um evento do mapa, como o MapLibre faria. */
  disparar(evento: string): void {
    this.ouvintes.get(evento)?.();
  }

  /** Faz de conta que a pessoa tocou no mapa (num lugar sem pino). */
  tocar(): void {
    this.disparar('click');
  }

  /** Faz de conta que o estilo do mapa terminou de carregar. */
  carregar(): void {
    this.disparar('load');
  }

  getZoom(): number {
    return this.zoom;
  }

  addSource(id: string, definicao: Record<string, unknown>): this {
    this.fontes.set(id, { definicao, dados: definicao['data'], atualizacoes: 0 });
    return this;
  }

  getSource(id: string): { setData: (dados: unknown) => void } | undefined {
    const fonte = this.fontes.get(id);
    return fonte
      ? {
          setData: (dados) => {
            fonte.dados = dados;
            fonte.atualizacoes++;
          },
        }
      : undefined;
  }

  addLayer(camada: Record<string, unknown>): this {
    this.camadas.push(camada);
    return this;
  }

  fitBounds(limites: LimitesFalsos, opcoes: Record<string, unknown>): this {
    this.enquadramentos.push({ limites, opcoes });
    return this;
  }

  easeTo(opcoes: Record<string, unknown>): this {
    this.movimentos.push(opcoes);
    return this;
  }

  remove(): void {
    this.removido = true;
  }
}

export class MarcadorFalso {
  removido = false;
  posicao?: [number, number];
  mapa?: MapaFalso;

  constructor(readonly opcoes: { element: HTMLElement; anchor?: string }) {}

  get elemento(): HTMLElement {
    return this.opcoes.element;
  }

  setLngLat(posicao: [number, number]): this {
    this.posicao = posicao;
    return this;
  }

  addTo(mapa: MapaFalso): this {
    this.mapa = mapa;
    return this;
  }

  remove(): this {
    this.removido = true;
    return this;
  }
}

/** Cria um MapLibre falso novo, junto com as listas do que foi criado com ele. */
export function criarMapLibreFalso() {
  const mapas: MapaFalso[] = [];
  const marcadores: MarcadorFalso[] = [];
  const estado: { worker?: string } = {};

  class Mapa extends MapaFalso {
    constructor(opcoes: Record<string, unknown>) {
      super(opcoes);
      mapas.push(this);
    }
  }

  class Marcador extends MarcadorFalso {
    constructor(opcoes: { element: HTMLElement; anchor?: string }) {
      super(opcoes);
      marcadores.push(this);
    }
  }

  const setWorkerUrl = (endereco: string) => {
    estado.worker = endereco;
  };

  return {
    biblioteca: {
      Map: Mapa,
      Marker: Marcador,
      LngLatBounds: LimitesFalsos,
      setWorkerUrl,
    } as unknown as BibliotecaDeMapa,
    mapas,
    marcadores,
    /** O endereço do worker que o app passou para o MapLibre. */
    worker: () => estado.worker,
    /** Os pinos dos lugares que estão no mapa agora (os que saíram não contam, nem a bolinha da pessoa). */
    pinos: () => marcadores.filter((marcador) => !marcador.removido && !marcador.elemento.classList.contains('voce')),
    /** A bolinha de quem está vendo o mapa, se estiver no mapa. */
    bolinha: () => marcadores.find((marcador) => !marcador.removido && marcador.elemento.classList.contains('voce')),
  };
}

/**
 * Espera o mapa "abrir". O MapLibre chega por uma promessa (o `import()`), que o Angular não
 * enxerga, então a gente deixa as promessas andarem e roda a tela de novo.
 */
export async function esperarOMapa(fixture: ComponentFixture<unknown>): Promise<void> {
  for (let volta = 0; volta < 3; volta++) {
    await fixture.whenStable();
    await Promise.resolve();
  }
  await fixture.whenStable();
}
