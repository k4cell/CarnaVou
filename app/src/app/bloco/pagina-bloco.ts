import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CopiarLink } from '../copiar-link/copiar-link';
import { diaIso } from '../dados/agenda';
import { acharBloco, acharLocal, faixaDoLocal } from '../dados/consultas';
import { NOMES_DOS_ESTILOS, dataPorExtenso, formatarHora, horariosDoBloco } from '../dados/formato';
import { itinerarioDoBloco } from '../dados/itinerario';
import { Atracao } from '../dados/tipos';
import { Relogio } from '../relogio/relogio';

/** "A, B e C" */
function juntarNomes(nomes: string[]): string {
  return nomes.length > 1 ? `${nomes.slice(0, -1).join(', ')} e ${nomes.at(-1)}` : (nomes[0] ?? '');
}

/**
 * As atrações juntas por horário, com os nomes lado a lado: "11h30 · Zé Vaqueiro, Nattan e Xand
 * Avião". Quem não tem hora divulgada vem primeiro, sem hora; depois, do mais cedo para o mais
 * tarde. Dentro de cada horário fica a ordem dos dados (do mais famoso para o menos). A fonte não
 * diz a ordem de quem canta na mesma hora, então ela não é inventada.
 */
function atracoesPorHorario(atracoes: Atracao[]): { hora: string; nomes: string }[] {
  const porHora = new Map<string, string[]>();
  for (const atracao of atracoes) {
    const hora = atracao.inicio ?? '';
    porHora.set(hora, [...(porHora.get(hora) ?? []), atracao.nome]);
  }
  return [...porHora]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([hora, nomes]) => ({ hora: hora ? formatarHora(hora) : '', nomes: juntarNomes(nomes) }));
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

  private readonly relogio = inject(Relogio);

  /**
   * O app só mostra o presente e o futuro: nenhuma lista leva a um bloco de um dia que já passou.
   * Quem chega por um link antigo vê o aviso.
   */
  protected readonly jaPassou = computed(() => {
    const agora = this.relogio.agora();
    const bloco = this.achado();
    return !!agora && !!bloco && bloco.data < diaIso(agora);
  });

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
      atracoes: atracoesPorHorario(bloco.atracoes),
    };
  });
}
