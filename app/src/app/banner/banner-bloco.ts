import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TipoDoSelo, diaIso, momentoDoBloco } from '../dados/agenda';
import { acharLocal } from '../dados/consultas';
import { faixaDoBloco } from '../dados/cores-dos-cartoes';
import { artistaEstaNoNome, textoDoHorario } from '../dados/formato';
import { Bloco } from '../dados/tipos';
import { BotaoFavorito } from '../favoritos/botao-favorito';
import { Relogio } from '../relogio/relogio';
import { DataDoDia } from './data-do-dia';

@Component({
  selector: 'app-banner-bloco',
  imports: [RouterLink, BotaoFavorito, DataDoDia],
  templateUrl: './banner-bloco.html',
  styleUrl: './banner-bloco.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BannerBloco {
  readonly bloco = input.required<Bloco>();
  /** Mostra também onde é o bloco (na aba Blocos, que mistura blocos de todos os lugares). */
  readonly mostrarLugar = input(false);
  /** Num cartão com os blocos de um dia, a data fica no cartão, e não em cada bloco. */
  readonly mostrarData = input(true);

  private readonly relogio = inject(Relogio);

  /** A faixa do banner tem a cor do bloco, a mesma do cartão dele na aba Blocos. */
  protected readonly faixa = computed(() => faixaDoBloco(this.bloco()));
  protected readonly lugar = computed(() => (this.mostrarLugar() ? acharLocal(this.bloco().localId)?.nome : undefined));
  /**
   * "Começa às 9h", ou só "Das 9h às 14h" quando o bloco está rolando (só depois de saber a hora: o
   * aviso "Rolando agora" fica ao lado do nome). Um bloco corrigido diz o que mudou: "Cancelado" ou
   * "Novo horário: começa às 9h".
   */
  protected readonly horario = computed(() => {
    const bloco = this.bloco();
    if (bloco.cancelado) {
      return 'Cancelado';
    }
    const texto = textoDoHorario(bloco, momentoDoBloco(bloco, this.relogio.agora()));
    return bloco.horarioMudou ? `Novo horário: ${texto.charAt(0).toLowerCase()}${texto.slice(1)}` : texto;
  });
  /**
   * A cor do horário diz em que pé o bloco está, sem ocupar mais uma linha: verde já começou, amarelo
   * ainda vai começar hoje, cinza já acabou e vermelho cancelado. Num dia que ainda vem (ou sem saber a
   * hora), fica sem cor.
   */
  protected readonly selo = computed<TipoDoSelo | null>(() => {
    if (this.bloco().cancelado) {
      return 'cancelado';
    }
    const agora = this.relogio.agora();
    if (agora === null) {
      return null;
    }
    const momento = momentoDoBloco(this.bloco(), agora);
    if (momento === 'antes') {
      return this.bloco().data === diaIso(agora) ? 'em-breve' : null;
    }
    return momento === 'rolando' ? 'agora' : 'acabou';
  });
  /** Os artistas, sem quem já está no nome do bloco. */
  protected readonly atracoes = computed(() =>
    this.bloco()
      .atracoes.map((atracao) => atracao.nome)
      .filter((nome) => !artistaEstaNoNome(this.bloco(), nome))
      .join(', '),
  );
}
