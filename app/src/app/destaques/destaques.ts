import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Aba, cartoesDaAba, diaIso, horaIso } from '../dados/agenda';
import { dataPorExtenso, formatarHora } from '../dados/formato';
import { Relogio } from '../relogio/relogio';
import { ZonaTag } from '../zona/zona-tag';

const ABAS: { id: Aba; nome: string }[] = [
  { id: 'hoje', nome: 'Hoje' },
  { id: 'amanha', nome: 'Amanhã' },
  { id: 'geral', nome: 'Geral' },
];

const MENSAGEM_DA_ABA_VAZIA: Record<Aba, string> = {
  hoje: 'Nenhum bloco hoje. Veja a aba Geral.',
  amanha: 'Nenhum bloco amanhã. Veja a aba Geral.',
  geral: 'Nenhum lugar por aqui ainda.',
};

@Component({
  selector: 'app-destaques',
  imports: [RouterLink, ZonaTag],
  templateUrl: './destaques.html',
  styleUrl: './destaques.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Destaques {
  private readonly relogio = inject(Relogio);

  protected readonly abas = ABAS;
  protected readonly simulado = this.relogio.simulado;

  /** A aba que a pessoa tocou. Enquanto ela não toca em nenhuma, o site escolhe. */
  private readonly escolhida = signal<Aba | null>(null);

  private readonly temBlocoHoje = computed(() => cartoesDaAba('hoje', this.relogio.agora()).length > 0);

  /** Abre em Hoje quando tem bloco hoje; senão, em Geral (para não abrir numa lista vazia). */
  protected readonly ativa = computed<Aba>(
    () => this.escolhida() ?? (this.temBlocoHoje() ? 'hoje' : 'geral'),
  );

  protected readonly cartoes = computed(() => cartoesDaAba(this.ativa(), this.relogio.agora()));
  protected readonly mensagemVazia = computed(() => MENSAGEM_DA_ABA_VAZIA[this.ativa()]);

  /** "Sábado, 6 de fevereiro, 14h": só aparece quando a data vem do endereço (?hoje=...). */
  protected readonly dataDeTeste = computed(() => {
    const agora = this.relogio.agora();
    return agora ? `${dataPorExtenso(diaIso(agora))}, ${formatarHora(horaIso(agora))}` : '';
  });

  protected escolher(aba: Aba): void {
    this.escolhida.set(aba);
  }
}
