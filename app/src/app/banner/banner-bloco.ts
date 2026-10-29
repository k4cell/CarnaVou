import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { faixaDoLocal } from '../dados/consultas';
import { partesDaData, textoDoHorario } from '../dados/formato';
import { Bloco } from '../dados/tipos';

@Component({
  selector: 'app-banner-bloco',
  imports: [RouterLink],
  templateUrl: './banner-bloco.html',
  styleUrl: './banner-bloco.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BannerBloco {
  readonly bloco = input.required<Bloco>();

  /** A faixa do banner tem a cor do lugar, a mesma do cartão dele na lista. */
  protected readonly faixa = computed(() => faixaDoLocal(this.bloco().localId));
  protected readonly data = computed(() => partesDaData(this.bloco().data));
  protected readonly horario = computed(() => textoDoHorario(this.bloco()));
  protected readonly atracoes = computed(() =>
    this.bloco()
      .atracoes.map((atracao) => atracao.nome)
      .join(', '),
  );
}
