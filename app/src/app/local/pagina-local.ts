import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AbasDoDia } from '../abas/abas-do-dia';
import { BannerBloco } from '../banner/banner-bloco';
import { DataDoDia } from '../banner/data-do-dia';
import { CopiarLink } from '../copiar-link/copiar-link';
import { Aba, blocosDaAba } from '../dados/agenda';
import { acharLocal, faixaDoLocal, maisFamosos } from '../dados/consultas';
import { dataPorExtenso } from '../dados/formato';
import { Bloco } from '../dados/tipos';
import { FiltroDeDia } from '../filtro/filtro-de-dia';
import { Relogio } from '../relogio/relogio';
import { ZonaTag } from '../zona/zona-tag';

/** Quantos blocos ficam no quadro de destaques do lugar. */
const DESTAQUES = 4;

/** Sem bloco no dia escolhido: a página já mostra os outros dias do lugar, sem pedir outro toque. */
const NADA_NO_DIA: Record<Exclude<Aba, 'geral'>, string> = {
  hoje: 'Nenhum bloco aqui hoje. Estes são os próximos dias:',
  amanha: 'Nenhum bloco aqui amanhã. Estes são os outros dias:',
};

const NADA_MAIS = 'Não tem mais blocos aqui.';

@Component({
  selector: 'app-pagina-local',
  imports: [RouterLink, AbasDoDia, BannerBloco, CopiarLink, DataDoDia, ZonaTag],
  templateUrl: './pagina-local.html',
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
export class PaginaLocal {
  /** Vem do endereço: /local/:local */
  readonly local = input.required<string>();

  private readonly filtro = inject(FiltroDeDia);
  private readonly relogio = inject(Relogio);

  protected readonly lugar = computed(() => acharLocal(this.local()));
  /** A cor do lugar, a mesma da lista e dos banners dele. */
  protected readonly faixa = computed(() => faixaDoLocal(this.local()));

  /**
   * A aba escolhida (Hoje, Amanhã ou Geral), a mesma da tela inicial, da aba Blocos e do mapa,
   * quando já se sabe o dia de hoje. Na página pronta (sem saber o dia), fica nula e a página
   * mostra todos os blocos.
   */
  protected readonly aba = computed<Aba | null>(() => (this.relogio.agora() ? this.filtro.ativa() : null));

  /** Os blocos da aba escolhida. Na Geral, os de hoje em diante: os dias que já passaram somem. */
  private readonly daAba = computed(() => blocosDaAba(this.aba() ?? 'geral', this.local(), this.relogio.agora()));

  /**
   * Os blocos que a página mostra: os da aba escolhida e, se nela não tiver nenhum, os de todos os
   * dias que ainda vêm, para a pessoa não ter que tocar em Geral para descobrir.
   */
  private readonly blocos = computed(() => {
    const daAba = this.daAba();
    return daAba.length > 0 || this.aba() === 'geral'
      ? daAba
      : blocosDaAba('geral', this.local(), this.relogio.agora());
  });

  protected readonly nadaNaAba = computed(() => {
    const aba = this.aba();
    if (!aba || this.daAba().length > 0) {
      return '';
    }
    return aba === 'geral' || this.blocos().length === 0 ? NADA_MAIS : NADA_NO_DIA[aba];
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
}
