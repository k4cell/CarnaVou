import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CopiarLink } from '../copiar-link/copiar-link';
import { acharBloco, acharLocal, faixaDoLocal } from '../dados/consultas';
import { NOMES_DOS_ESTILOS, dataPorExtenso, formatarHora, horariosDoBloco } from '../dados/formato';
import { itinerarioDoBloco } from '../dados/itinerario';
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
  imports: [CopiarLink, RouterLink],
  templateUrl: './pagina-bloco.html',
  styleUrl: './pagina-bloco.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // A página inteira leva a cor do lugar, e as atrações herdam essa cor na faixa.
  host: { '[attr.data-faixa]': 'faixa()' },
})
export class PaginaBloco {
  /** Vêm do endereço: /local/:local/:bloco */
  readonly local = input.required<string>();
  readonly bloco = input.required<string>();

  protected readonly faixa = computed(() => faixaDoLocal(this.local()));

  protected readonly lugar = computed(() => acharLocal(this.local()));
  protected readonly achado = computed(() => acharBloco(this.local(), this.bloco()));

  protected readonly resumo = computed(() => {
    const bloco = this.achado();
    if (!bloco) {
      return undefined;
    }
    return {
      dia: dataPorExtenso(bloco.data),
      horario: horariosDoBloco(bloco),
      itinerario: itinerarioDoBloco(bloco.id),
      estilo: bloco.estilo ? NOMES_DOS_ESTILOS[bloco.estilo] : undefined,
      atracoes: [...bloco.atracoes].sort(porHora).map((atracao) => ({
        nome: atracao.nome,
        hora: atracao.inicio ? formatarHora(atracao.inicio) : '',
      })),
    };
  });
}
