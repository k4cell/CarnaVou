import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TipoDoSelo, diaIso, momentoDoBloco } from '../dados/agenda';
import { acharLocal, faixaDoLocal } from '../dados/consultas';
import { artistaEstaNoNome, partesDaData, textoDoHorario } from '../dados/formato';
import { Bloco } from '../dados/tipos';
import { BotaoFavorito } from '../favoritos/botao-favorito';
import { Relogio } from '../relogio/relogio';

@Component({
  selector: 'app-banner-bloco',
  imports: [RouterLink, BotaoFavorito],
  templateUrl: './banner-bloco.html',
  styleUrl: './banner-bloco.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BannerBloco {
  readonly bloco = input.required<Bloco>();
  /** Mostra também onde é o bloco (na aba Blocos, que mistura blocos de todos os lugares). */
  readonly mostrarLugar = input(false);
  /** Num cartão com vários blocos do mesmo dia, a data aparece só no primeiro. */
  readonly mostrarData = input(true);

  private readonly relogio = inject(Relogio);

  /** A faixa do banner tem a cor do lugar, a mesma do cartão dele na lista. */
  protected readonly faixa = computed(() => faixaDoLocal(this.bloco().localId));
  protected readonly data = computed(() => partesDaData(this.bloco().data));
  protected readonly lugar = computed(() => (this.mostrarLugar() ? acharLocal(this.bloco().localId)?.nome : undefined));
  /** "Começa às 9h", ou "Começou às 9h" quando o bloco já começou (só depois de saber a hora). */
  protected readonly horario = computed(() =>
    textoDoHorario(this.bloco(), momentoDoBloco(this.bloco(), this.relogio.agora())),
  );
  /**
   * A cor do horário diz em que pé o bloco está, sem ocupar mais uma linha: verde já começou, amarelo
   * ainda vai começar hoje e cinza já acabou. Em outro dia (ou sem saber a hora), fica sem cor.
   */
  protected readonly selo = computed<TipoDoSelo | null>(() => {
    const agora = this.relogio.agora();
    if (agora === null || this.bloco().data !== diaIso(agora)) {
      return null;
    }
    const momento = momentoDoBloco(this.bloco(), agora);
    return momento === 'rolando' ? 'agora' : momento === 'antes' ? 'em-breve' : 'acabou';
  });
  /** Os artistas, sem quem já está no nome do bloco. */
  protected readonly atracoes = computed(() =>
    this.bloco()
      .atracoes.map((atracao) => atracao.nome)
      .filter((nome) => !artistaEstaNoNome(this.bloco(), nome))
      .join(', '),
  );
}
