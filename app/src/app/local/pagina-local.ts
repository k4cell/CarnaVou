import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BannerBloco } from '../banner/banner-bloco';
import { CopiarLink } from '../copiar-link/copiar-link';
import { acharLocal, blocosDoLocal, destaquesDoLocal } from '../dados/consultas';
import { dataPorExtenso } from '../dados/formato';
import { Bloco } from '../dados/tipos';
import { ZonaTag } from '../zona/zona-tag';

/** Quantos blocos ficam no quadro de destaques do lugar. */
const DESTAQUES = 4;

@Component({
  selector: 'app-pagina-local',
  imports: [RouterLink, BannerBloco, CopiarLink, ZonaTag],
  templateUrl: './pagina-local.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginaLocal {
  /** Vem do endereço: /local/:local */
  readonly local = input.required<string>();

  protected readonly lugar = computed(() => acharLocal(this.local()));

  /** Os blocos mais famosos do lugar, em destaque no topo (só os que têm artista conhecido). */
  protected readonly destaques = computed(() => destaquesDoLocal(this.local(), DESTAQUES));

  /**
   * Os outros blocos do lugar, juntos por dia (na ordem de data e hora), para cada dia virar um
   * cartão só. Os que estão em destaque não se repetem aqui.
   */
  protected readonly dias = computed(() => {
    const emDestaque = new Set(this.destaques().map((bloco) => bloco.id));
    const dias: { data: string; nome: string; blocos: Bloco[] }[] = [];
    for (const bloco of blocosDoLocal(this.local()).filter((candidato) => !emDestaque.has(candidato.id))) {
      const ultimo = dias.at(-1);
      if (ultimo?.data === bloco.data) {
        ultimo.blocos.push(bloco);
      } else {
        dias.push({ data: bloco.data, nome: dataPorExtenso(bloco.data), blocos: [bloco] });
      }
    }
    return dias;
  });
}
