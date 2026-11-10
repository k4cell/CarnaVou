import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { diasAte, diasDoCarnaval, faseDoCarnaval } from '../dados/fase-do-carnaval';
import { dataPorExtenso } from '../dados/formato';
import { Relogio } from '../relogio/relogio';

/** "no sábado, 7 de fevereiro" ou "na sexta-feira, 13 de fevereiro", para o meio da frase. */
function diaNaFrase(dia: string): string {
  const texto = dataPorExtenso(dia).toLowerCase();
  return `${/^(sábado|domingo)/.test(texto) ? 'no' : 'na'} ${texto}`;
}

/**
 * O aviso do alto das listas fora da época dos blocos. Antes do primeiro bloco: quantos dias faltam e
 * de quando a quando vão os blocos. Depois do último: que o carnaval acabou e quando volta. Durante a
 * festa (e na página pronta, que não sabe o dia de hoje), não aparece.
 */
@Component({
  selector: 'app-cartao-da-fase',
  template: `
    @if (aviso(); as texto) {
      <section class="cartao-da-fase" [attr.data-fase]="texto.fase">
        <p class="destaque">{{ texto.destaque }}</p>
        @for (linha of texto.linhas; track linha) {
          <p>{{ linha }}</p>
        }
      </section>
    }
  `,
  styles: `
    // No mesmo jeito dos cartões das listas, com a faixa roxa.
    .cartao-da-fase {
      margin: 12px 0 4px;
      padding: 12px 16px 12px 20px;
      border: var(--borda-do-cartao);
      border-radius: var(--canto-do-cartao);
      background: var(--cartao);
      box-shadow: inset 6px 0 0 var(--roxo);
    }

    p {
      margin: 0;
      line-height: 1.4;
    }

    p + p {
      margin-top: 6px;
    }

    .destaque {
      color: var(--roxo);
      font-size: 1.25rem;
      font-weight: 800;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartaoDaFase {
  private readonly relogio = inject(Relogio);

  protected readonly aviso = computed(() => {
    const agora = this.relogio.agora();
    const fase = faseDoCarnaval(agora);
    const dias = diasDoCarnaval();
    if (!agora || !dias || fase === null || fase === 'durante') {
      return null;
    }
    if (fase === 'antes') {
      const faltam = diasAte(dias.primeiro, agora);
      return {
        fase,
        destaque:
          faltam === 1 ? 'O carnaval de rua começa amanhã!' : `Faltam ${faltam} dias para o carnaval de rua`,
        linhas: [
          `O primeiro bloco sai ${diaNaFrase(dias.primeiro)}, e o último, ${diaNaFrase(dias.ultimo)}.`,
          'Enquanto isso, veja todos os blocos na aba Geral e marque os seus com a estrela.',
        ],
      };
    }
    return {
      fase,
      destaque: `O carnaval de rua de ${dias.ultimo.slice(0, 4)} acabou`,
      linhas: [
        'Valeu por ter ido com o CarnaVou! Os blocos do ano que vem aparecem aqui quando a Prefeitura publicar a lista oficial.',
        'A busca da aba Blocos ainda mostra os blocos que já aconteceram.',
      ],
    };
  });
}
