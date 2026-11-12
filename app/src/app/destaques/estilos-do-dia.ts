import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';

import { FAIXAS } from '../dados/consultas';
import { Estilo } from '../dados/tipos';
import { FiltrosDaLista } from '../lista-de-blocos/filtros-da-lista';
import { EstiloNaVitrine } from './vitrine';

/** O desenho de cada estilo. */
type Figura = 'microfone' | 'tambor' | 'nota' | 'caixa-de-som' | 'guarda-chuva' | 'disco' | 'raio';

const FIGURAS: Record<Estilo, Figura> = {
  pop: 'microfone',
  mpb: 'microfone',
  axe: 'tambor',
  samba: 'tambor',
  marchinha: 'nota',
  forro: 'nota',
  sertanejo: 'nota',
  funk: 'caixa-de-som',
  frevo: 'guarda-chuva',
  eletronico: 'disco',
  rock: 'raio',
};

/**
 * Os estilos que têm bloco na aba, em quadrados coloridos que deslizam para o lado. Tocar num deles
 * abre a aba Blocos já com a busca do estilo (e do dia, em Hoje e Amanhã).
 */
@Component({
  selector: 'app-estilos-do-dia',
  template: `
    <ul class="estilos">
      @for (item of estilos(); track item.estilo; let posicao = $index) {
        <li>
          <button type="button" class="estilo" [attr.data-faixa]="faixa(posicao)" (click)="abrir(item)">
            <!-- Ícones de traço: Lucide (licença ISC). -->
            <span class="figura">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                @switch (figura(item.estilo)) {
                  @case ('microfone') {
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <path d="M12 19v3" />
                  }
                  @case ('tambor') {
                    <path d="m2 2 8 8" />
                    <path d="m22 2-8 8" />
                    <ellipse cx="12" cy="9" rx="10" ry="5" />
                    <path d="M7 13.4v7.9M12 14v8M17 13.4v7.9" />
                    <path d="M2 9v8a10 5 0 0 0 20 0V9" />
                  }
                  @case ('caixa-de-som') {
                    <rect width="16" height="20" x="4" y="2" rx="2" />
                    <circle cx="12" cy="14" r="4" />
                    <path d="M12 6h.01" />
                  }
                  @case ('guarda-chuva') {
                    <path d="M22 12a10 10 0 0 0-20 0Z" />
                    <path d="M12 12v8a2 2 0 0 0 4 0" />
                    <path d="M12 2v1" />
                  }
                  @case ('disco') {
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="2" />
                  }
                  @case ('raio') {
                    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
                  }
                  @default {
                    <path d="M9 18V5l12-2v13" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="18" cy="16" r="3" />
                  }
                }
              </svg>
            </span>
            <span class="nome-do-estilo">{{ item.nome }}</span>
            <span class="quantos">{{ item.quantos }} {{ item.quantos === 1 ? 'bloco' : 'blocos' }}</span>
          </button>
        </li>
      }
    </ul>
  `,
  styles: `
    // Os quadrados deslizam para o lado, de uma borda à outra da tela.
    .estilos {
      display: flex;
      gap: 12px;
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
      flex: none;
      scroll-snap-align: start;
    }

    .estilo {
      display: flex;
      flex-direction: column;
      gap: 2px;
      align-items: flex-start;
      width: 96px;
      padding: 0;
      border: 0;
      background: none;
      color: var(--texto);
      font: inherit;
      text-align: left;
      cursor: pointer;

      &:active .figura {
        filter: brightness(0.92);
      }

      &:focus-visible {
        outline: 3px solid var(--texto);
        outline-offset: 2px;
      }
    }

    // O quadrado na cor cheia, com o desenho branco; no amarelo, no verde e no laranja, escuro.
    .figura {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 96px;
      height: 96px;
      margin-bottom: 6px;
      border-radius: 16px;
      background: var(--cor-da-faixa);
      color: var(--cartao);
    }

    [data-faixa='amarelo'] .figura,
    [data-faixa='verde'] .figura,
    [data-faixa='laranja'] .figura {
      color: var(--texto);
    }

    svg {
      width: 40px;
      height: 40px;
      fill: none;
      stroke: currentcolor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .nome-do-estilo {
      font-weight: 800;
    }

    .quantos {
      color: var(--texto-suave);
      font-size: 0.875rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EstilosDoDia {
  private readonly filtros = inject(FiltrosDaLista);
  private readonly router = inject(Router);

  readonly estilos = input.required<EstiloNaVitrine[]>();

  /** As cores se revezam, do rosa ao azul, como as faixas dos cartões. */
  protected faixa(posicao: number): string {
    return FAIXAS[posicao % FAIXAS.length];
  }

  protected figura(estilo: Estilo): Figura {
    return FIGURAS[estilo];
  }

  /** Abre a aba Blocos já buscando o estilo, sem os outros filtros. */
  protected abrir(item: EstiloNaVitrine): void {
    this.filtros.limpar();
    this.filtros.busca.set(item.busca);
    void this.router.navigate(['/']);
  }
}
