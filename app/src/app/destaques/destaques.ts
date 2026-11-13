import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AbasDoDia } from '../abas/abas-do-dia';
import { Aba } from '../dados/agenda';
import { NOMES_DAS_ZONAS } from '../dados/formato';
import { Zona } from '../dados/tipos';
import { CartaoDaFase } from '../fase-do-carnaval/cartao-da-fase';
import { Favoritos } from '../favoritos/favoritos';
import { FiltroDeDia } from '../filtro/filtro-de-dia';
import { FiltrosDaLista } from '../lista-de-blocos/filtros-da-lista';
import { Relogio } from '../relogio/relogio';
import { ZonaTag } from '../zona/zona-tag';
import { DestaqueDoDia } from './destaque-do-dia';
import { EstilosDoDia } from './estilos-do-dia';
import { FileiraDeBlocos } from './fileira-de-blocos';
import {
  blocosDaVitrine,
  destaqueDaVitrine,
  estilosDaVitrine,
  famososDaVitrine,
  lgbtDaVitrine,
  lugaresPorZona,
  naVitrine,
  proximosDaVitrine,
} from './vitrine';

const DIA_DA_ABA: Record<Aba, string> = { hoje: 'de hoje', amanha: 'de amanhã', geral: 'do carnaval' };

/**
 * O Descobrir: a vitrine para quem ainda não decidiu aonde ir. A aba Blocos é a lista por horário;
 * aqui vêm o destaque, os mais famosos, o que está rolando e começando, os blocos LGBTQIA+, os
 * estilos e, embaixo, os bairros juntos por zona (cada um abre a página dele). Tudo segue a aba Hoje / Amanhã / Geral.
 */
@Component({
  selector: 'app-destaques',
  imports: [RouterLink, ZonaTag, AbasDoDia, CartaoDaFase, DestaqueDoDia, EstilosDoDia, FileiraDeBlocos],
  templateUrl: './destaques.html',
  styleUrl: './destaques.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Destaques {
  private readonly filtro = inject(FiltroDeDia);
  private readonly relogio = inject(Relogio);
  private readonly filtros = inject(FiltrosDaLista);
  private readonly router = inject(Router);
  protected readonly favoritos = inject(Favoritos);

  protected readonly cartoes = this.filtro.cartoes;
  protected readonly mensagemVazia = this.filtro.mensagemVazia;
  protected readonly zonas = computed(() => lugaresPorZona(this.cartoes()));

  /** O destaque, os mais famosos e os estilos da aba. Nulo enquanto não se sabe o dia (na página pronta). */
  protected readonly vitrine = computed(() => {
    const agora = this.relogio.agora();
    if (!agora) {
      return null;
    }
    const aba = this.filtro.ativa();
    const blocos = blocosDaVitrine(aba, agora);
    const destaque = destaqueDaVitrine(blocos, agora);
    const noDestaque = destaque ? naVitrine(destaque, agora) : null;
    return {
      destaque: noDestaque,
      rotulo:
        aba === 'hoje' && noDestaque?.quando.tipo === 'agora' ? 'Destaque do momento' : `Destaque ${DIA_DA_ABA[aba]}`,
      famosos: famososDaVitrine(blocos, destaque).map((bloco) => naVitrine(bloco, agora)),
      tituloDosFamosos: `Os mais famosos ${DIA_DA_ABA[aba]}`,
      // Só em Hoje: em Amanhã e na Geral, "agora" não quer dizer nada.
      proximos: aba === 'hoje' ? proximosDaVitrine(blocos, destaque).map((bloco) => naVitrine(bloco, agora)) : [],
      lgbt: lgbtDaVitrine(blocos).map((bloco) => naVitrine(bloco, agora)),
      // Em Hoje, todos são do mesmo dia: a fileira dos LGBTQIA+ destaca a hora; nas outras abas, o dia.
      destaqueDoLgbt: aba === 'hoje' ? ('hora' as const) : ('dia' as const),
      estilos: estilosDaVitrine(blocos, aba),
    };
  });

  protected nomeDaZona(zona: Zona): string {
    return NOMES_DAS_ZONAS[zona];
  }

  /** Abre a aba Blocos só com os favoritos. */
  protected verFavoritos(): void {
    this.filtros.limpar();
    this.filtros.soFavoritos.set(true);
    void this.router.navigate(['/']);
  }
}
