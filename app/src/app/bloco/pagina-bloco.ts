import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { acharBloco, acharLocal } from '../dados/consultas';
import { NOMES_DOS_ESTILOS, dataPorExtenso, formatarHora, textoDoHorario } from '../dados/formato';
import { Atracao } from '../dados/tipos';

/** Quem tem hora vem primeiro, do mais cedo para o mais tarde; os outros ficam na ordem da lista. */
function porHora(a: Atracao, b: Atracao): number {
  if (a.inicio && b.inicio) {
    return a.inicio.localeCompare(b.inicio);
  }
  return a.inicio ? -1 : b.inicio ? 1 : 0;
}

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
      estilo: bloco.estilo ? NOMES_DOS_ESTILOS[bloco.estilo] : undefined,
      atracoes: [...bloco.atracoes].sort(porHora).map((atracao) => ({
        nome: atracao.nome,
        hora: atracao.inicio ? formatarHora(atracao.inicio) : '',
      })),
    };
  });
}
