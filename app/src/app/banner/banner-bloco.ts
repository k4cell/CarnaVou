import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { acharLocal, faixaDoLocal } from '../dados/consultas';
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
  /** Mostra também onde é o bloco (na aba Blocos, que mistura blocos de todos os lugares). */
  readonly mostrarLugar = input(false);

  /** A faixa do banner tem a cor do lugar, a mesma do cartão dele na lista. */
  protected readonly faixa = computed(() => faixaDoLocal(this.bloco().localId));
  protected readonly data = computed(() => partesDaData(this.bloco().data));
  protected readonly lugar = computed(() => (this.mostrarLugar() ? acharLocal(this.bloco().localId)?.nome : undefined));
  protected readonly horario = computed(() => textoDoHorario(this.bloco()));
  protected readonly atracoes = computed(() =>
    this.bloco()
      .atracoes.map((atracao) => atracao.nome)
      .join(', '),
  );
}
