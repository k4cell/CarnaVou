import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { AbasDoDia } from '../abas/abas-do-dia';
import { BannerBloco } from '../banner/banner-bloco';
import { DataDoDia } from '../banner/data-do-dia';
import { DadosAtualizados } from '../correcoes/dados-atualizados';
import { faseDoCarnaval } from '../dados/fase-do-carnaval';
import { Aba } from '../dados/agenda';
import { acharLocal, faixaDoLocal } from '../dados/consultas';
import { NOMES_DAS_ZONAS } from '../dados/formato';
import { SecaoDeBlocos, secaoDoQueJaAconteceu, secoesDosBlocos } from '../dados/lista-de-blocos';
import { LOCAIS } from '../dados/locais';
import { Bloco, Local, Zona } from '../dados/tipos';
import { CartaoDaFase } from '../fase-do-carnaval/cartao-da-fase';
import { Favoritos } from '../favoritos/favoritos';
import { FiltroDeDia } from '../filtro/filtro-de-dia';
import { Relogio } from '../relogio/relogio';
import { ZonaTag } from '../zona/zona-tag';
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
  imports: [AbasDoDia, BannerBloco, CartaoDaFase, DadosAtualizados, DataDoDia, ZonaTag],
  template: `
    <h2 class="titulo">Blocos</h2>
    <!-- A busca e os filtros numa linha só: o campo e dois botões redondos, o do lugar e o da estrela. -->
    <div class="busca-e-filtros">
      <label class="campo">
        <!-- Lupa: Lucide (licença ISC). -->
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
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
      </label>
      <!-- A lista de lugares fica invisível por cima do botão: tocar nele abre a lista do celular. -->
      <label class="redondo" [class.ligado]="filtros.lugar() !== ''">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M12 21s-6-5.6-6-10a6 6 0 1112 0c0 4.4-6 10-6 10z" />
          <circle cx="12" cy="11" r="2" />
        </svg>
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
      </label>
      <button
        type="button"
        class="redondo so-favoritos"
        [class.ligado]="filtros.soFavoritos()"
        [attr.aria-pressed]="filtros.soFavoritos()"
        [attr.aria-label]="'Só os favoritos (' + favoritos.quantos() + ')'"
        (click)="filtros.soFavoritos.set(!filtros.soFavoritos())"
      >
        <!-- Estrela: Lucide (licença ISC). -->
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
        </svg>
        @if (favoritos.quantos() > 0) {
          <span class="conta" aria-hidden="true">{{ favoritos.quantos() }}</span>
        }
      </button>
    </div>
    <!-- O lugar escolhido e o dia que a busca entendeu ("samba hoje"), cada um numa etiqueta: o "×" tira. -->
    @if (lugarEscolhido() || filtros.quando()) {
      <div class="etiquetas">
        @if (lugarEscolhido(); as nome) {
          <button type="button" class="etiqueta" [attr.aria-label]="'Tirar o filtro: ' + nome" (click)="filtros.lugar.set('')">
            {{ nome }} <span aria-hidden="true">×</span>
          </button>
        }
        @if (filtros.quando(); as quando) {
          <button type="button" class="etiqueta quando" [attr.aria-label]="'Tirar o filtro: ' + quando" (click)="filtros.tirarOQuando()">
            {{ quando }} <span aria-hidden="true">×</span>
          </button>
        }
      </div>
    }
    @if (!filtros.buscando()) {
      <app-abas-do-dia />
      <!-- Antes do primeiro bloco e depois do último: quantos dias faltam, ou que o carnaval acabou. -->
      <app-cartao-da-fase />
    }
    @for (secao of secoes(); track secao.titulo) {
      <h3 class="secao">{{ secao.titulo }}</h3>
      <ul class="lista">
        <!-- Os blocos do mesmo dia no mesmo lugar ficam num cartão só, com o nome do lugar no alto. -->
        @for (grupo of secao.grupos; track grupo[0].id) {
          <li class="grupo" [attr.data-faixa]="faixaDo(grupo[0])">
            <span class="lugar-do-grupo">
              @if (localDo(grupo[0]); as local) {
                <span class="nome-do-lugar">{{ local.nome }}</span>
                <app-zona-tag [zona]="local.zona" />
              }
            </span>
            <app-data-do-dia class="data-do-grupo" [data]="grupo[0].data" />
            <div class="blocos-do-grupo">
              @for (bloco of grupo; track bloco.id) {
                <app-banner-bloco [bloco]="bloco" [mostrarData]="false" />
              }
            </div>
          </li>
        }
      </ul>
    } @empty {
      @if (mensagemVazia(); as mensagem) {
        <p class="vazio caixa-vazia">{{ mensagem }}</p>
      }
      @if (filtros.algumFiltro()) {
        <button type="button" class="botao-claro limpar" (click)="filtros.limpar()">Limpar a busca e os filtros</button>
      }
    }
    <app-dados-atualizados />
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

    .busca-e-filtros {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }

    .campo,
    .redondo {
      display: flex;
      align-items: center;
      min-height: 44px;
      border: 1px solid var(--borda);
      border-radius: 999px;
      background: var(--cartao);
      color: var(--texto);
    }

    // Nos botões redondos, o contorno de foco só aparece com o teclado (:focus-visible): depois de um
    // toque, o botão continua com o foco, e um :focus-within deixaria o contorno preso nele. No campo
    // de busca, aparece sempre, porque ali o foco é a pessoa digitando.
    .campo:focus-within,
    .redondo:focus-visible {
      outline: 3px solid var(--texto);
      outline-offset: 2px;
    }

    // Separado: um navegador que não entende o :has ignora só esta regra.
    .redondo:has(:focus-visible) {
      outline: 3px solid var(--texto);
      outline-offset: 2px;
    }

    svg {
      flex: none;
      width: 20px;
      height: 20px;
      fill: none;
      stroke: currentcolor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .campo {
      flex: 1;
      gap: 8px;
      min-width: 0;
      padding-left: 14px;

      svg {
        color: var(--texto-suave);
      }
    }

    .busca {
      flex: 1;
      min-width: 0;
      height: 42px;
      padding: 0 14px 0 0;
      border: 0;
      border-radius: 0 999px 999px 0;
      background: none;
      color: inherit;
      font: inherit;
      outline: none;
    }

    .redondo {
      position: relative;
      flex: none;
      justify-content: center;
      width: 44px;
      padding: 0;
      cursor: pointer;
    }

    // A lista do celular abre ao tocar no botão; a lista em si não aparece.
    .lugar {
      position: absolute;
      inset: 0;
      width: 100%;
      opacity: 0;
      cursor: pointer;
    }

    button.redondo {
      font: inherit;
    }

    // Enquanto o dedo está em cima, o botão escurece um pouco, como os outros botões do app.
    .redondo:active,
    .etiqueta:active {
      filter: brightness(0.92);
    }

    // Ligado: fundo amarelo e texto escuro (amarelo só como fundo). A estrela fica cheia.
    .ligado {
      border-color: var(--amarelo);
      background: var(--amarelo);

      &.so-favoritos svg {
        fill: currentcolor;
      }
    }

    // Quantos favoritos a pessoa tem, num número pequeno no canto da estrela.
    .conta {
      position: absolute;
      top: -4px;
      right: -4px;
      min-width: 20px;
      padding: 0 5px;
      border-radius: 999px;
      background: var(--roxo);
      color: var(--cartao);
      font-size: 0.75rem;
      font-weight: 800;
      line-height: 20px;
      text-align: center;
    }

    // O lugar escolhido e o dia da busca, em etiquetas: o "×" tira o filtro.
    .etiquetas {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }

    .etiqueta {
      display: inline-flex;
      gap: 6px;
      align-items: center;
      min-height: 44px;
      padding: 0 12px;
      border: 0;
      border-radius: 999px;
      background: var(--amarelo);
      color: var(--texto);
      font: inherit;
      font-weight: 700;
      cursor: pointer;

      span {
        font-size: 1.25rem;
        line-height: 1;
      }

      &:focus-visible {
        outline: 3px solid var(--texto);
        outline-offset: 2px;
      }
    }

    // Embaixo da caixa da lista vazia, no meio, como ela.
    .limpar {
      display: flex;
      width: fit-content;
      margin: 0 auto;
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

  /** O nome do lugar escolhido no filtro, para a etiqueta que tira o filtro. */
  protected readonly lugarEscolhido = computed(() => acharLocal(this.filtros.lugar())?.nome ?? null);

  protected readonly secoes = computed<SecaoDeBlocos[]>(() => {
    const agora = this.relogio.agora();
    const incluir = this.filtros.incluir();
    if (!this.filtros.buscando()) {
      return secoesDosBlocos(this.filtro.ativa(), agora, incluir);
    }
    // A busca olha tudo: o que ainda vai acontecer e, no fim, o que já aconteceu.
    const jaAconteceu = secaoDoQueJaAconteceu(agora, incluir);
    return [...secoesDosBlocos('geral', agora, incluir), ...(jaAconteceu ? [jaAconteceu] : [])];
  });

  protected readonly mensagemVazia = computed(() => {
    if (this.filtros.buscando()) {
      return 'Não achei nenhum bloco com essa busca.';
    }
    if (this.filtros.soFavoritos() && this.favoritos.quantos() === 0) {
      return 'Você ainda não tem favoritos. Toque na estrela de um bloco para ele aparecer aqui.';
    }
    if (this.filtros.algumFiltro()) {
      return 'Nenhum bloco com esses filtros neste dia. Veja a aba Geral.';
    }
    // Depois do carnaval, o aviso do alto já diz que acabou: não manda a pessoa para outra aba vazia.
    return faseDoCarnaval(this.relogio.agora()) === 'depois' ? '' : NADA_NA_ABA[this.filtro.ativa()];
  });

  protected aoBuscar(evento: Event): void {
    this.filtros.busca.set((evento.target as HTMLInputElement).value);
  }

  protected aoEscolherLugar(evento: Event): void {
    this.filtros.lugar.set((evento.target as HTMLSelectElement).value);
  }

  protected localDo(bloco: Bloco): Local | undefined {
    return acharLocal(bloco.localId);
  }

  protected faixaDo(bloco: Bloco): string {
    return faixaDoLocal(bloco.localId);
  }
}
