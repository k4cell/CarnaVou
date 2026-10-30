import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { AbasDoDia } from '../abas/abas-do-dia';
import { BannerBloco } from '../banner/banner-bloco';
import { Aba } from '../dados/agenda';
import { secoesDosBlocos } from '../dados/lista-de-blocos';
import { FiltroDeDia } from '../filtro/filtro-de-dia';
import { Relogio } from '../relogio/relogio';

const NADA_NA_ABA: Record<Aba, string> = {
  hoje: 'Nenhum bloco rolando nem mais tarde hoje. Veja a aba Amanhã ou a Geral.',
  amanha: 'Nenhum bloco amanhã. Veja a aba Geral.',
  geral: 'Não tem mais blocos pela frente.',
};

/**
 * A aba Blocos: os blocos (e não os lugares), com o filtro Hoje | Amanhã | Geral, o mesmo da tela
 * inicial e do mapa. Em Hoje, os que estão rolando agora vêm primeiro.
 */
@Component({
  selector: 'app-pagina-blocos',
  imports: [AbasDoDia, BannerBloco],
  template: `
    <app-abas-do-dia />
    <h2 class="titulo">Blocos</h2>
    @for (secao of secoes(); track secao.titulo) {
      <h3 class="secao">{{ secao.titulo }}</h3>
      <ul class="lista">
        @for (bloco of secao.blocos; track bloco.id) {
          <li><app-banner-bloco [bloco]="bloco" [mostrarLugar]="true" /></li>
        }
      </ul>
    } @empty {
      <p class="vazio">{{ nadaNaAba() }}</p>
    }
  `,
  styles: `
    .titulo {
      margin-top: 16px;
    }

    .vazio {
      margin: 24px 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginaBlocos {
  private readonly filtro = inject(FiltroDeDia);
  private readonly relogio = inject(Relogio);

  protected readonly secoes = computed(() => secoesDosBlocos(this.filtro.ativa(), this.relogio.agora()));
  protected readonly nadaNaAba = computed(() => NADA_NA_ABA[this.filtro.ativa()]);
}
