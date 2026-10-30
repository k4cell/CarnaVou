import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { Atualizacao } from './atualizacao';

/** O aviso de que tem versão nova do app, logo acima do menu de baixo, com o botão de atualizar. */
@Component({
  selector: 'app-aviso-de-atualizacao',
  template: `
    @if (atualizacao.temVersaoNova()) {
      <div class="aviso" role="status">
        <span>Tem versão nova do CarnaVou.</span>
        <button type="button" (click)="atualizar()">Atualizar</button>
      </div>
    }
  `,
  styles: `
    .aviso {
      position: fixed;
      right: 12px;
      bottom: calc(var(--altura-menu) + 12px);
      left: 12px;
      z-index: 30;
      display: flex;
      gap: 12px;
      align-items: center;
      justify-content: space-between;
      max-width: 480px;
      margin: 0 auto;
      padding: 8px 8px 8px 16px;
      border-radius: 12px;
      background: var(--noite);
      box-shadow: 0 2px 12px rgb(0 0 0 / 30%);
      color: #fff;
      font-weight: 600;
    }

    // Amarelo só como fundo, com texto escuro.
    button {
      flex: none;
      min-height: 44px;
      padding: 0 16px;
      border: 0;
      border-radius: 999px;
      background: var(--amarelo);
      color: var(--texto);
      font: inherit;
      font-weight: 800;
      cursor: pointer;

      &:focus-visible {
        outline: 3px solid #fff;
        outline-offset: 2px;
      }
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
