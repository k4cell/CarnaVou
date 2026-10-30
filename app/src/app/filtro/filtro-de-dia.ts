import { Injectable, computed, inject, signal } from '@angular/core';

import { Aba, cartoesDaAba } from '../dados/agenda';
import { Relogio } from '../relogio/relogio';

export const MENSAGENS_DA_ABA_VAZIA: Record<Aba, string> = {
  hoje: 'Nenhum bloco hoje. Veja a aba Geral.',
  amanha: 'Nenhum bloco amanhã. Veja a aba Geral.',
  geral: 'Não tem mais blocos pela frente.',
};

/**
 * O filtro Hoje / Amanhã / Geral. A tela inicial, a aba Blocos, o mapa e a página do lugar usam o
 * mesmo, então a aba que a pessoa escolheu vale em todas.
 */
@Injectable({ providedIn: 'root' })
export class FiltroDeDia {
  private readonly relogio = inject(Relogio);

  /** A aba que a pessoa tocou. Enquanto ela não toca em nenhuma, o site escolhe. */
  private readonly escolhida = signal<Aba | null>(null);

  private readonly temBlocoHoje = computed(() => cartoesDaAba('hoje', this.relogio.agora()).length > 0);

  /** Abre em Hoje quando tem bloco hoje; senão, em Geral (para não abrir numa lista vazia). */
  readonly ativa = computed<Aba>(() => this.escolhida() ?? (this.temBlocoHoje() ? 'hoje' : 'geral'));

  /** Os lugares da aba ativa, cada um com o seu selo e os seus artistas. */
  readonly cartoes = computed(() => cartoesDaAba(this.ativa(), this.relogio.agora()));

  readonly mensagemVazia = computed(() => MENSAGENS_DA_ABA_VAZIA[this.ativa()]);

  escolher(aba: Aba): void {
    this.escolhida.set(aba);
  }
}
