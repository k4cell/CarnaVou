import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AbasDoDia } from '../abas/abas-do-dia';
import { FiltroDeDia } from '../filtro/filtro-de-dia';
import { ZonaTag } from '../zona/zona-tag';

@Component({
  selector: 'app-destaques',
  imports: [RouterLink, ZonaTag, AbasDoDia],
  templateUrl: './destaques.html',
  styleUrl: './destaques.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Destaques {
  private readonly filtro = inject(FiltroDeDia);

  protected readonly cartoes = this.filtro.cartoes;
  protected readonly mensagemVazia = this.filtro.mensagemVazia;
}
