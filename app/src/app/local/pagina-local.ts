import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BannerBloco } from '../banner/banner-bloco';
import { acharLocal, blocosDoLocal } from '../dados/consultas';

@Component({
  selector: 'app-pagina-local',
  imports: [RouterLink, BannerBloco],
  templateUrl: './pagina-local.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginaLocal {
  /** Vem do endereço: /local/:local */
  readonly local = input.required<string>();

  protected readonly lugar = computed(() => acharLocal(this.local()));
  protected readonly blocos = computed(() => blocosDoLocal(this.local()));
}
