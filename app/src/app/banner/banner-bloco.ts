import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { momentoDoBloco } from '../dados/agenda';
import { acharLocal, faixaDoLocal } from '../dados/consultas';
import { partesDaData, textoDoHorario } from '../dados/formato';
import { Bloco } from '../dados/tipos';
import { Relogio } from '../relogio/relogio';

@Component({
  selector: 'app-banner-bloco',
  imports: [RouterLink],
  templateUrl: './banner-bloco.html',
  styleUrl: './banner-bloco.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BannerBloco {
  readonly bloco = input.required<Bloco>();
  /** Mostra também onde é o bloco (na aba Blocos, que mistura blocos de todos os lugares). */
  readonly mostrarLugar = input(false);

  private readonly relogio = inject(Relogio);

  /** A faixa do banner tem a cor do lugar, a mesma do cartão dele na lista. */
  protected readonly faixa = computed(() => faixaDoLocal(this.bloco().localId));
  protected readonly data = computed(() => partesDaData(this.bloco().data));
  protected readonly lugar = computed(() => (this.mostrarLugar() ? acharLocal(this.bloco().localId)?.nome : undefined));
  /** "Começa às 9h", ou "Começou às 9h" quando o bloco já começou (só depois de saber a hora). */
  protected readonly horario = computed(() =>
    textoDoHorario(this.bloco(), momentoDoBloco(this.bloco(), this.relogio.agora())),
  );
  protected readonly atracoes = computed(() =>
    this.bloco()
      .atracoes.map((atracao) => atracao.nome)
      .join(', '),
  );
}
