import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BannerBloco } from '../banner/banner-bloco';
import { CopiarLink } from '../copiar-link/copiar-link';
import { Aba, blocosDaAba } from '../dados/agenda';
import { acharLocal, maisFamosos } from '../dados/consultas';
import { dataPorExtenso } from '../dados/formato';
import { Bloco } from '../dados/tipos';
import { FiltroDeDia } from '../filtro/filtro-de-dia';
import { Relogio } from '../relogio/relogio';
import { ZonaTag } from '../zona/zona-tag';

/** Quantos blocos ficam no quadro de destaques do lugar. */
const DESTAQUES = 4;

/** O que a página está mostrando, conforme a aba que a pessoa escolheu na tela inicial. */
const O_QUE_MOSTRA: Record<Aba, string> = {
  hoje: 'Mostrando os blocos de hoje.',
  amanha: 'Mostrando os blocos de amanhã.',
  geral: 'Mostrando os blocos de hoje em diante.',
};

const NADA_NA_ABA: Record<Aba, string> = {
  hoje: 'Nenhum bloco aqui hoje.',
  amanha: 'Nenhum bloco aqui amanhã.',
  geral: 'Não tem mais blocos aqui.',
};

@Component({
  selector: 'app-pagina-local',
  imports: [RouterLink, BannerBloco, CopiarLink, ZonaTag],
  templateUrl: './pagina-local.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginaLocal {
  /** Vem do endereço: /local/:local */
  readonly local = input.required<string>();

  private readonly filtro = inject(FiltroDeDia);
  private readonly relogio = inject(Relogio);

  protected readonly lugar = computed(() => acharLocal(this.local()));

  /**
   * A aba escolhida na tela inicial (Hoje, Amanhã ou Geral), quando já se sabe o dia de hoje.
   * Na página pronta (sem saber o dia), fica nula e a página mostra todos os blocos.
   */
  protected readonly aba = computed<Aba | null>(() => (this.relogio.agora() ? this.filtro.ativa() : null));

  /**
   * Os blocos que valem agora: os da aba escolhida. Na Geral, os de hoje em diante: os dias que
   * já passaram somem.
   */
  private readonly blocos = computed(() => blocosDaAba(this.aba() ?? 'geral', this.local(), this.relogio.agora()));

  protected readonly oQueMostra = computed(() => {
    const aba = this.aba();
    return aba ? O_QUE_MOSTRA[aba] : '';
  });

  protected readonly nadaNaAba = computed(() => {
    const aba = this.aba();
    return aba && this.blocos().length === 0 ? NADA_NA_ABA[aba] : '';
  });

  /** Os blocos mais famosos, em destaque no topo (só os que têm artista conhecido). */
  protected readonly destaques = computed(() => maisFamosos(this.blocos(), DESTAQUES));

  /**
   * Os outros blocos, juntos por dia (na ordem de data e hora), para cada dia virar um cartão só.
   * Os que estão em destaque não se repetem aqui.
   */
  protected readonly dias = computed(() => {
    const emDestaque = new Set(this.destaques().map((bloco) => bloco.id));
    const dias: { data: string; nome: string; blocos: Bloco[] }[] = [];
    for (const bloco of this.blocos().filter((candidato) => !emDestaque.has(candidato.id))) {
      const ultimo = dias.at(-1);
      if (ultimo?.data === bloco.data) {
        ultimo.blocos.push(bloco);
      } else {
        dias.push({ data: bloco.data, nome: dataPorExtenso(bloco.data), blocos: [bloco] });
      }
    }
    return dias;
  });

  /** "Ver todos os dias": passa para a Geral (que vale também na tela inicial e no mapa). */
  protected verTodos(): void {
    this.filtro.escolher('geral');
  }
}
