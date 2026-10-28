import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { NOMES_DAS_ZONAS } from '../dados/formato';
import { Zona } from '../dados/tipos';

/** A etiqueta colorida da zona: Centro roxo, Sul verde, Leste amarelo, Oeste vermelho, Norte azul. */
@Component({
  selector: 'app-zona-tag',
  templateUrl: './zona-tag.html',
  styleUrl: './zona-tag.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZonaTag {
  readonly zona = input.required<Zona>();

  protected readonly nome = computed(() => NOMES_DAS_ZONAS[this.zona()]);
}
