import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BannerBloco } from '../banner/banner-bloco';
import { CopiarLink } from '../copiar-link/copiar-link';
import { acharLocal, blocosDoLocal } from '../dados/consultas';
import { ZonaTag } from '../zona/zona-tag';

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
  protected readonly blocos = computed(() => blocosDoLocal(this.local()));
}
