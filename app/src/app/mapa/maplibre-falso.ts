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

  /** Faz de conta que a pessoa tocou no mapa (num lugar sem pino). */
  tocar(): void {
    this.ouvintes.get('click')?.();
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
    /** Os pinos que estão no mapa agora (os que saíram não contam). */
    pinos: () => marcadores.filter((marcador) => !marcador.removido),
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
