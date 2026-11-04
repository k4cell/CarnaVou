import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { AbasDoDia } from '../abas/abas-do-dia';
import { BannerBloco } from '../banner/banner-bloco';
import { Aba } from '../dados/agenda';
import { acharLocal, faixaDoLocal } from '../dados/consultas';
import { NOMES_DAS_ZONAS } from '../dados/formato';
import { secoesDosBlocos } from '../dados/lista-de-blocos';
import { LOCAIS } from '../dados/locais';
import { Bloco, Zona } from '../dados/tipos';
import { Favoritos } from '../favoritos/favoritos';
import { FiltroDeDia } from '../filtro/filtro-de-dia';
import { Relogio } from '../relogio/relogio';
import { FiltrosDaLista } from './filtros-da-lista';

const NADA_NA_ABA: Record<Aba, string> = {
  hoje: 'Nenhum bloco rolando nem mais tarde hoje. Veja a aba Amanhã ou a Geral.',
  amanha: 'Nenhum bloco amanhã. Veja a aba Geral.',
  geral: 'Não tem mais blocos pela frente.',
};

const ORDEM_DAS_ZONAS: Zona[] = ['centro', 'sul', 'oeste', 'leste', 'norte'];

/** Os lugares do filtro, juntos por zona. */
const LUGARES_POR_ZONA = ORDEM_DAS_ZONAS.map((zona) => ({
  nome: NOMES_DAS_ZONAS[zona],
  lugares: LOCAIS.filter((local) => local.zona === zona),
})).filter((zona) => zona.lugares.length > 0);

/**
 * A aba Blocos, a tela principal: os blocos (e não os lugares), com o filtro Hoje | Amanhã | Geral,
 * o mesmo do Descobrir e do mapa. Em Hoje, os que estão rolando agora vêm primeiro. Os blocos do
 * mesmo dia no mesmo lugar ficam juntos, um embaixo do outro. A busca olha todos os dias que ainda
 * vão acontecer, então as abas de dia somem enquanto a pessoa busca.
 */
@Component({
  selector: 'app-pagina-blocos',
  imports: [AbasDoDia, BannerBloco],
  template: `
    <h2 class="titulo">Blocos</h2>
    <input
      class="busca"
      type="search"
      placeholder="Buscar bloco, artista ou lugar"
      aria-label="Buscar bloco, artista ou lugar"
      autocomplete="off"
      enterkeyhint="search"
      [value]="filtros.busca()"
      (input)="aoBuscar($event)"
    />
    @if (!filtros.buscando()) {
      <app-abas-do-dia />
    }
    <div class="filtros">
      <select class="lugar" aria-label="Filtrar por lugar" (change)="aoEscolherLugar($event)">
        <option value="" [selected]="filtros.lugar() === ''">Todos os lugares</option>
        @for (zona of zonas; track zona.nome) {
          <optgroup [label]="zona.nome">
            @for (lugar of zona.lugares; track lugar.id) {
              <option [value]="lugar.id" [selected]="filtros.lugar() === lugar.id">{{ lugar.nome }}</option>
            }
          </optgroup>
        }
      </select>
      <button
        type="button"
        class="so-favoritos"
        [class.ligado]="filtros.soFavoritos()"
        [attr.aria-pressed]="filtros.soFavoritos()"
        (click)="filtros.soFavoritos.set(!filtros.soFavoritos())"
      >
        Favoritos ({{ favoritos.quantos() }})
      </button>
    </div>
    @for (secao of secoes(); track secao.titulo) {
      <h3 class="secao">{{ secao.titulo }}</h3>
      <ul class="lista">
        <!-- Os blocos do mesmo dia no mesmo lugar ficam num cartão só, com o nome do lugar no alto. -->
        @for (grupo of secao.grupos; track grupo[0].id) {
          <li class="dia" [attr.data-faixa]="faixaDo(grupo[0])">
            <span class="lugar-do-grupo">{{ lugarDo(grupo[0]) }}</span>
            @for (bloco of grupo; track bloco.id; let primeiro = $first) {
              <app-banner-bloco [bloco]="bloco" [mostrarData]="primeiro" />
            }
          </li>
        }
      </ul>
    } @empty {
      <p class="vazio">{{ mensagemVazia() }}</p>
      @if (filtros.algumFiltro()) {
        <button type="button" class="botao-claro limpar" (click)="filtros.limpar()">Limpar a busca e os filtros</button>
      }
    }
  `,
  styles: `
    // O título fica só para o leitor de tela: o menu de baixo já diz em que aba a pessoa está.
    .titulo {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }

    .busca,
    .lugar,
    .so-favoritos {
      min-height: 44px;
      border: 1px solid var(--borda);
      border-radius: 8px;
      background: var(--cartao);
      color: var(--texto);
      font: inherit;
    }

    .busca {
      display: block;
      width: 100%;
      margin-top: 12px;
      padding: 0 12px;
    }

    .filtros {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }

    .lugar {
      flex: 1;
      min-width: 0;
      padding: 0 8px;
    }

    .so-favoritos {
      flex: none;
      padding: 0 12px;
      font-weight: 700;
      cursor: pointer;
    }

    // Amarelo só como fundo, com texto escuro.
    .ligado {
      border-color: var(--amarelo);
      background: var(--amarelo);
    }

    .vazio {
      margin: 24px 0 12px;
    }

    .limpar {
      font: inherit;
      font-weight: 700;
      cursor: pointer;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginaBlocos {
  private readonly filtro = inject(FiltroDeDia);
  private readonly relogio = inject(Relogio);
  protected readonly filtros = inject(FiltrosDaLista);
  protected readonly favoritos = inject(Favoritos);

  protected readonly zonas = LUGARES_POR_ZONA;

  protected readonly secoes = computed(() =>
    secoesDosBlocos(
      this.filtros.buscando() ? 'geral' : this.filtro.ativa(),
      this.relogio.agora(),
      this.filtros.incluir(),
    ),
  );

  protected readonly mensagemVazia = computed(() => {
    if (this.filtros.buscando()) {
      return 'Não achei nenhum bloco com essa busca.';
    }
    if (this.filtros.soFavoritos() && this.favoritos.quantos() === 0) {
      return 'Você ainda não tem favoritos. Toque na estrela de um bloco para ele aparecer aqui.';
    }
    return this.filtros.algumFiltro()
      ? 'Nenhum bloco com esses filtros neste dia. Veja a aba Geral.'
      : NADA_NA_ABA[this.filtro.ativa()];
  });

  protected aoBuscar(evento: Event): void {
    this.filtros.busca.set((evento.target as HTMLInputElement).value);
  }

  protected aoEscolherLugar(evento: Event): void {
    this.filtros.lugar.set((evento.target as HTMLSelectElement).value);
  }

  protected lugarDo(bloco: Bloco): string {
    return acharLocal(bloco.localId)?.nome ?? '';
  }

  protected faixaDo(bloco: Bloco): string {
    return faixaDoLocal(bloco.localId);
  }
}
