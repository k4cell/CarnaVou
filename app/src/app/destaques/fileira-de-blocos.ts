import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BlocoNaVitrine } from './vitrine';

/**
 * Uma fileira que desliza para o lado, com dois blocos por coluna: muita opção na mesma altura de
 * tela, sem rolar tanto para baixo. Cada bloco tem um quadradinho na cor do lugar, com a hora em
 * destaque (o que está rolando e começando) ou o dia (os mais famosos), e o nome com os artistas (ou
 * o lugar) embaixo.
 */
@Component({
  selector: 'app-fileira-de-blocos',
  imports: [RouterLink],
  template: `
    <ul class="fileira">
      @for (item of itens(); track item.bloco.id) {
        <li>
          <a class="item" [attr.data-faixa]="item.faixa" [routerLink]="item.caminho">
            <span
              class="quadro"
              [class.por-dia]="destaque() === 'dia'"
              [attr.data-tipo]="item.quando.tipo"
              [attr.aria-label]="item.quando.texto"
            >
              @if (destaque() === 'dia') {
                <span class="pequeno" aria-hidden="true">{{ item.data.semana }}</span>
                <span class="grande" aria-hidden="true">{{ item.data.dia }}</span>
              } @else {
                <span class="pequeno" aria-hidden="true">{{ item.quando.dia }}</span>
                <span class="grande" aria-hidden="true">{{ item.quando.hora }}</span>
              }
            </span>
            <span class="texto-do-item">
              <strong class="nome-do-item">{{ item.bloco.nome }}</strong>
              <span class="sobre">{{ item.artistas || item.local.nome }}</span>
            </span>
          </a>
        </li>
      }
    </ul>
  `,
  styles: `
    // Duas linhas que deslizam para o lado. A fileira vai de uma borda à outra da tela (sai pelos
    // 16px de espaço da página) e para em cada coluna. A próxima coluna aparece pela metade, para a
    // pessoa ver que dá para deslizar.
    .fileira {
      display: grid;
      grid-template-rows: repeat(2, auto);
      grid-auto-columns: 82%;
      grid-auto-flow: column;
      gap: 8px 10px;
      margin: 0 -16px;
      padding: 0 16px 4px;
      overflow-x: auto;
      list-style: none;
      scroll-padding: 0 16px;
      scroll-snap-type: x mandatory;
      scrollbar-width: none;

      &::-webkit-scrollbar {
        display: none;
      }
    }

    li {
      min-width: 0;
      scroll-snap-align: start;
    }

    .item {
      display: flex;
      gap: 12px;
      align-items: center;
      height: 100%;
      padding: 10px 12px;
      border-radius: var(--canto-do-cartao);
      background: var(--cartao);
      color: var(--texto);
      text-decoration: none;

      &:active {
        background: color-mix(in srgb, var(--cor-da-faixa) 10%, var(--cartao));
      }

      &:focus-visible {
        outline: 3px solid var(--texto);
        outline-offset: 2px;
      }
    }

    // O quadradinho: a cor cheia do lugar, com texto branco; no amarelo, no verde, no laranja e no
    // verde-mar, escuro.
    .quadro {
      display: flex;
      flex: none;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 56px;
      border-radius: 10px;
      background: var(--cor-da-faixa);
      color: var(--cartao);
      line-height: 1.15;
      text-align: center;
    }

    [data-faixa='amarelo'] .quadro,
    [data-faixa='verde'] .quadro,
    [data-faixa='laranja'] .quadro,
    [data-faixa='verde-mar'] .quadro {
      color: var(--texto);
    }

    .pequeno {
      font-size: 0.6875rem;
      font-weight: 800;
      text-transform: uppercase;
    }

    .grande {
      font-size: 1rem;
      font-weight: 800;
    }

    // Com o dia em destaque, o número do dia fica maior.
    .por-dia .grande {
      font-size: 1.375rem;
      line-height: 1;
    }


    .texto-do-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .nome-do-item,
    .sobre {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .nome-do-item {
      font-size: 1.0625rem;
    }

    .sobre {
      color: var(--texto-suave);
      font-size: 0.9375rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileiraDeBlocos {
  readonly itens = input.required<BlocoNaVitrine[]>();
  /** O que o quadradinho destaca: a hora (o padrão) ou o dia. */
  readonly destaque = input<'hora' | 'dia'>('hora');
}
