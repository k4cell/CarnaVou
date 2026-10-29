import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { Aba, diaIso, horaIso } from '../dados/agenda';
import { dataPorExtenso, formatarHora } from '../dados/formato';
import { FiltroDeDia } from '../filtro/filtro-de-dia';
import { Relogio } from '../relogio/relogio';

const ABAS: { id: Aba; nome: string }[] = [
  { id: 'hoje', nome: 'Hoje' },
  { id: 'amanha', nome: 'Amanhã' },
  { id: 'geral', nome: 'Geral' },
];

/** O filtro Hoje | Amanhã | Geral, com o aviso de data de teste quando "hoje" não é o de verdade. */
@Component({
  selector: 'app-abas-do-dia',
  templateUrl: './abas-do-dia.html',
  styleUrl: './abas-do-dia.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AbasDoDia {
  private readonly filtro = inject(FiltroDeDia);
  private readonly relogio = inject(Relogio);

  protected readonly abas = ABAS;
  protected readonly ativa = this.filtro.ativa;
  protected readonly simulado = this.relogio.simulado;

  /** "Sábado, 7 de fevereiro, 12h": só aparece quando a data não vem do relógio do celular. */
  protected readonly dataDeTeste = computed(() => {
    const agora = this.relogio.agora();
    return agora ? `${dataPorExtenso(diaIso(agora))}, ${formatarHora(horaIso(agora))}` : '';
  });

  protected escolher(aba: Aba): void {
    this.filtro.escolher(aba);
  }
}
