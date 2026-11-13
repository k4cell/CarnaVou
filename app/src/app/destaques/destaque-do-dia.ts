import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ZonaTag } from '../zona/zona-tag';
import { BlocoNaVitrine } from './vitrine';

/**
 * O destaque do topo do Descobrir: um bloco só, num cartão de cor cheia, com quando ele começa em
 * evidência ("Rolando agora", "Começa em 35 min"). O cartão todo abre o bloco.
 */
@Component({
  selector: 'app-destaque-do-dia',
  imports: [RouterLink, ZonaTag],
  template: `
    @let item = destaque();
    <a class="destaque" [routerLink]="item.caminho">
      <span class="rotulo">{{ rotulo() }}</span>
      <span class="quando" [attr.data-tipo]="item.quando.tipo">
        @if (item.quando.tipo === 'agora') {
          <span class="rolando">Rolando agora</span>
        } @else {
          {{ item.quando.texto }}
        }
      </span>
      <strong class="nome-do-destaque">{{ item.bloco.nome }}</strong>
      @if (item.artistas) {
        <span class="artistas-do-destaque">{{ item.artistas }}</span>
      }
      <span class="onde">
        {{ item.local.nome }}
        <app-zona-tag [zona]="item.local.zona" />
      </span>
      <span class="ver" aria-hidden="true">Ver o bloco ›</span>
    </a>
  `,
  styles: `
    :host {
      display: block;
      margin-top: 16px;
    }

    // Cor cheia (sem degradê), com texto branco: é o que mais chama na tela.
    .destaque {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 16px;
      border-radius: var(--canto-do-cartao);
      background: var(--roxo-escuro);
      color: var(--cartao);
      text-decoration: none;

      &:active {
        filter: brightness(1.15);
      }

      &:focus-visible {
        outline: 3px solid var(--texto);
        outline-offset: 2px;
      }
    }

    .rotulo {
      font-size: 0.8125rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    // Quando começa, numa pílula: branca (com o aviso vermelho, quando está rolando) ou amarela
    // (quando começa mais tarde hoje). Texto escuro, para ler no sol.
    .quando {
      align-self: flex-start;
      padding: 4px 12px;
      border-radius: 999px;
      background: var(--cartao);
      color: var(--texto);
      font-size: 0.875rem;
      font-weight: 800;

      &[data-tipo='hoje'] {
        background: var(--amarelo);
      }
    }

    .nome-do-destaque {
      font-size: 1.5rem;
      line-height: 1.2;
      overflow-wrap: anywhere;
    }

    .artistas-do-destaque {
      font-size: 1.0625rem;
    }

    .onde {
      display: flex;
      flex-wrap: wrap;
      gap: 4px 8px;
      align-items: center;

      app-zona-tag {
        margin: 0;
      }
    }

    // Parece botão (o toque é no cartão todo): amarelo, como os botões principais do app.
    .ver {
      align-self: flex-end;
      margin-top: 4px;
      padding: 10px 16px;
      border-radius: 999px;
      background: var(--amarelo);
      color: var(--texto);
      font-weight: 800;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DestaqueDoDia {
  readonly destaque = input.required<BlocoNaVitrine>();
  /** "Destaque do momento", "Destaque de amanhã"… */
  readonly rotulo = input.required<string>();
}
