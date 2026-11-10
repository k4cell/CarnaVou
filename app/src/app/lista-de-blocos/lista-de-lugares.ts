import { afterNextRender, ChangeDetectionStrategy, Component, ElementRef, inject, output } from '@angular/core';

import { NOMES_DAS_ZONAS } from '../dados/formato';
import { LOCAIS } from '../dados/locais';
import { Zona } from '../dados/tipos';
import { FiltrosDaLista } from './filtros-da-lista';

const ORDEM_DAS_ZONAS: Zona[] = ['centro', 'sul', 'oeste', 'leste', 'norte'];

/** Os lugares do filtro, juntos por zona. */
const LUGARES_POR_ZONA = ORDEM_DAS_ZONAS.map((zona) => ({
  id: zona,
  nome: NOMES_DAS_ZONAS[zona],
  lugares: LOCAIS.filter((local) => local.zona === zona),
})).filter((zona) => zona.lugares.length > 0);

/**
 * A lista do filtro de lugar da aba Blocos: todos os lugares, uma zona inteira ou um lugar só. É uma
 * lista do app, e não a do celular (que não aceita cor), para cada zona ter o fundo da cor dela. Pede
 * para fechar quando a pessoa escolhe, aperta Esc ou toca fora dela.
 */
@Component({
  selector: 'app-lista-de-lugares',
  templateUrl: './lista-de-lugares.html',
  styleUrl: './lista-de-lugares.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'aoTocarFora($event)',
    '(document:keydown.escape)': 'fechar.emit()',
  },
})
export class ListaDeLugares {
  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  protected readonly filtros = inject(FiltrosDaLista);

  protected readonly zonas = LUGARES_POR_ZONA;

  readonly fechar = output<void>();

  constructor() {
    // Num celular baixo, a página rola o que faltar para a lista caber acima do menu de baixo.
    afterNextRender(() => this.elemento.scrollIntoView?.({ block: 'nearest' }));
  }

  protected escolher(onde?: { lugar?: string; zona?: Zona }): void {
    this.filtros.escolherOnde(onde);
    this.fechar.emit();
  }

  protected aoTocarFora(evento: Event): void {
    if (!this.elemento.contains(evento.target as Node)) {
      this.fechar.emit();
    }
  }
}
