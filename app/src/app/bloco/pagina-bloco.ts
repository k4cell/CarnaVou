import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { acharBloco, acharLocal } from '../dados/consultas';
import { NOMES_DOS_ESTILOS, dataPorExtenso, formatarHora, textoDoHorario } from '../dados/formato';

@Component({
  selector: 'app-pagina-bloco',
  imports: [RouterLink],
  templateUrl: './pagina-bloco.html',
  styleUrl: './pagina-bloco.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginaBloco {
  /** Vêm do endereço: /local/:local/:bloco */
  readonly local = input.required<string>();
  readonly bloco = input.required<string>();

  protected readonly lugar = computed(() => acharLocal(this.local()));
  protected readonly achado = computed(() => acharBloco(this.local(), this.bloco()));

  protected readonly resumo = computed(() => {
    const bloco = this.achado();
    if (!bloco) {
      return undefined;
    }
    return {
      dia: dataPorExtenso(bloco.data),
      horario: textoDoHorario(bloco),
      estilo: NOMES_DOS_ESTILOS[bloco.estilo],
      atracoes: bloco.atracoes.map((atracao) => ({
        nome: atracao.nome,
        hora: atracao.inicio ? formatarHora(atracao.inicio) : '',
      })),
    };
  });
}
