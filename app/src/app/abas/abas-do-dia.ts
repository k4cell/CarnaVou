import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
} from '@angular/core';

import { Aba } from '../dados/agenda';
import { FiltroDeDia } from '../filtro/filtro-de-dia';

const ABAS: { id: Aba; nome: string }[] = [
  { id: 'hoje', nome: 'Hoje' },
  { id: 'amanha', nome: 'Amanhã' },
  { id: 'geral', nome: 'Geral' },
];

/**
 * O filtro Hoje | Amanhã | Geral. Fica preso no alto da tela quando a lista rola, para trocar de
 * dia sem voltar lá em cima, e aí ganha uma linha embaixo. (A data de teste fica no aviso do
 * cabeçalho.)
 */
@Component({
  selector: 'app-abas-do-dia',
  templateUrl: './abas-do-dia.html',
  styleUrl: './abas-do-dia.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.presa]': 'presa()', '[class.compacta]': 'compacta()' },
})
export class AbasDoDia {
  private readonly filtro = inject(FiltroDeDia);

  /** Mais baixas e sem prender no alto: para a caixa que flutua em cima do mapa. */
  readonly compacta = input(false, { transform: booleanAttribute });

  protected readonly abas = ABAS;
  protected readonly ativa = this.filtro.ativa;
  /** Verdade enquanto as abas estão presas no alto da tela, com a lista passando por baixo. */
  protected readonly presa = signal(false);

  constructor() {
    const elemento = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const aoSair = inject(DestroyRef);
    afterNextRender(() => {
      if (typeof IntersectionObserver === 'undefined') {
        return;
      }
      // O CSS não sabe quando um `sticky` prendeu. A área observada começa 1px abaixo do alto da
      // tela: as abas só ficam cortadas por ela quando encostam no alto, ou seja, quando prendem.
      const observador = new IntersectionObserver(
        ([entrada]) => this.presa.set(entrada.intersectionRatio < 1 && entrada.boundingClientRect.top < 1),
        { threshold: 1, rootMargin: '-1px 0px 0px 0px' },
      );
      observador.observe(elemento);
      aoSair.onDestroy(() => observador.disconnect());
    });
  }

  protected escolher(aba: Aba): void {
    this.filtro.escolher(aba);
  }
}
