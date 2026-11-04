import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { Bloco } from '../dados/tipos';
import { Favoritos } from './favoritos';

/** A estrela que marca um bloco. Com `comTexto`, vira um botão com o nome, na página do bloco. */
@Component({
  selector: 'app-botao-favorito',
  template: `
    <button
      type="button"
      class="favorito"
      [class.botao-claro]="comTexto()"
      [class.marcado]="marcado()"
      [attr.aria-pressed]="marcado()"
      [attr.aria-label]="'Favorito: ' + bloco().nome"
      (click)="trocar()"
    >
      <!-- Estrela: Lucide (licença ISC). -->
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
      </svg>
      @if (comTexto()) {
        <span>{{ marcado() ? 'Nos favoritos' : 'Favoritar' }}</span>
      }
    </button>
  `,
  styles: `
    .favorito:not(.botao-claro) {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      padding: 0;
      border: 0;
      background: none;
      cursor: pointer;
    }

    .botao-claro {
      font: inherit;
      font-weight: 700;
      cursor: pointer;
    }

    svg {
      width: 24px;
      height: 24px;
      fill: none;
      stroke: var(--texto-suave);
      stroke-width: 2;
      stroke-linejoin: round;
    }

    .marcado svg {
      fill: var(--amarelo);
      stroke: var(--texto);
    }

    button:focus-visible {
      outline: 3px solid var(--roxo);
      outline-offset: -3px;
      border-radius: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BotaoFavorito {
  readonly bloco = input.required<Bloco>();
  readonly comTexto = input(false);

  private readonly favoritos = inject(Favoritos);

  protected readonly marcado = computed(() => this.favoritos.tem(this.bloco().id));

  protected trocar(): void {
    this.favoritos.trocar(this.bloco().id);
  }
}
