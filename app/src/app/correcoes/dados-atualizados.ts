import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { dataDaAtualizacao } from '../dados/formato';
import { Correcoes } from './correcoes';

/** A linha "Dados atualizados em…". Só aparece depois que o app sabe a data. */
@Component({
  selector: 'app-dados-atualizados',
  template: `
    @if (texto(); as data) {
      <p class="dados-atualizados">Dados atualizados em {{ data }}</p>
    }
  `,
  styles: `
    .dados-atualizados {
      margin: 24px 0 8px;
      color: var(--texto-suave);
      font-size: 0.875rem;
      text-align: center;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DadosAtualizados {
  private readonly correcoes = inject(Correcoes);

  protected readonly texto = computed(() => {
    const data = this.correcoes.atualizadoEm();
    return data ? dataDaAtualizacao(data) : null;
  });
}
