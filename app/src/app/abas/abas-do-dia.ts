import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { Aba } from '../dados/agenda';
import { FiltroDeDia } from '../filtro/filtro-de-dia';

const ABAS: { id: Aba; nome: string }[] = [
  { id: 'hoje', nome: 'Hoje' },
  { id: 'amanha', nome: 'Amanhã' },
  { id: 'geral', nome: 'Geral' },
];

/**
 * O filtro Hoje | Amanhã | Geral. Fica preso no alto da tela quando a lista rola, para trocar de
 * dia sem voltar lá em cima. (A data de teste fica no aviso do cabeçalho.)
 */
@Component({
  selector: 'app-abas-do-dia',
  templateUrl: './abas-do-dia.html',
  styleUrl: './abas-do-dia.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AbasDoDia {
  private readonly filtro = inject(FiltroDeDia);

  protected readonly abas = ABAS;
  protected readonly ativa = this.filtro.ativa;

  protected escolher(aba: Aba): void {
    this.filtro.escolher(aba);
  }
}
