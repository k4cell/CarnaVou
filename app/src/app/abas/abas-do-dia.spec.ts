import { TestBed } from '@angular/core/testing';

import { AbasDoDia } from './abas-do-dia';

describe('AbasDoDia', () => {
  const original = globalThis.IntersectionObserver;
  let opcoes: IntersectionObserverInit | undefined;
  let desligou = false;
  // Faz o papel do navegador: avisa como as abas estão em relação à área observada.
  let avisar: (visivel: number, alto: number) => void;

  beforeEach(() => {
    desligou = false;
    globalThis.IntersectionObserver = class {
      constructor(aoMudar: IntersectionObserverCallback, comOpcoes?: IntersectionObserverInit) {
        opcoes = comOpcoes;
        avisar = (visivel, alto) =>
          aoMudar(
            [{ intersectionRatio: visivel, boundingClientRect: { top: alto } } as IntersectionObserverEntry],
            this as unknown as IntersectionObserver,
          );
      }
      observe(): void {}
      disconnect(): void {
        desligou = true;
      }
    } as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    globalThis.IntersectionObserver = original;
  });

  async function renderizar() {
    const fixture = TestBed.createComponent(AbasDoDia);
    await fixture.whenStable();
    const abas = fixture.nativeElement as HTMLElement;
    const presa = async (visivel: number, alto: number) => {
      avisar(visivel, alto);
      await fixture.whenStable();
      return abas.classList.contains('presa');
    };
    return { fixture, abas, presa };
  }

  it('ganha a linha de baixo só enquanto está presa no alto da tela', async () => {
    const { abas, presa } = await renderizar();
    expect(abas.classList.contains('presa')).toBe(false);
    // A área observada começa 1px abaixo do alto da tela.
    expect(opcoes).toEqual({ threshold: 1, rootMargin: '-1px 0px 0px 0px' });
    expect(await presa(0.98, 0)).toBe(true);
    expect(await presa(1, 40)).toBe(false);
  });

  it('cortada pelo fim da tela, e não pelo alto, não está presa', async () => {
    const { presa } = await renderizar();
    expect(await presa(0.5, 700)).toBe(false);
  });

  it('para de observar quando sai da tela', async () => {
    const { fixture } = await renderizar();
    fixture.destroy();
    expect(desligou).toBe(true);
  });
});
