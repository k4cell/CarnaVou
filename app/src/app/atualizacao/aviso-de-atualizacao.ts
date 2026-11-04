import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { Atualizacao } from './atualizacao';

/** O aviso de que tem versão nova do app, logo acima do menu de baixo, com o botão de atualizar. */
@Component({
  selector: 'app-aviso-de-atualizacao',
  template: `
    @if (atualizacao.temVersaoNova()) {
      <div class="aviso aviso-flutuante" role="status">
        <span>Tem versão nova do CarnaVou.</span>
        <button type="button" (click)="atualizar()">Atualizar</button>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvisoDeAtualizacao {
  protected readonly atualizacao = inject(Atualizacao);

  protected atualizar(): void {
    void this.atualizacao.atualizar();
  }
}
