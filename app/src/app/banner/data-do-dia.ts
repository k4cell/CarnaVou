import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { partesDaData } from '../dados/formato';

/**
 * A data em três linhas (SÁB / 14 / FEV), na cor escura do cabeçalho: no banner de um bloco e no
 * cartão de um dia.
 */
@Component({
  selector: 'app-data-do-dia',
  template: `
    <time [attr.datetime]="data()">
      <span class="semana">{{ partes().semana }}</span>
      <span class="dia">{{ partes().dia }}</span>
      <span class="mes">{{ partes().mes }}</span>
    </time>
  `,
  styles: `
    time {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 56px;
      line-height: 1.2;
      color: var(--noite);
      text-transform: uppercase;
    }

    .semana,
    .mes {
      font-size: 0.875rem;
      font-weight: 700;
    }

    .dia {
      font-size: 2rem;
      font-weight: 800;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataDoDia {
  /** O dia, como "2026-02-14". */
  readonly data = input.required<string>();

  protected readonly partes = computed(() => partesDaData(this.data()));
}
