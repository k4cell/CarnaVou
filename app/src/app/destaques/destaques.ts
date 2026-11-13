import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AbasDoDia } from '../abas/abas-do-dia';
import { APARELHO } from '../aparelho/aparelho';
import { Aba } from '../dados/agenda';
import { NOMES_DAS_ZONAS } from '../dados/formato';
import { Bloco, Trajeto, Zona } from '../dados/tipos';
import { CartaoDaFase } from '../fase-do-carnaval/cartao-da-fase';
import { Favoritos } from '../favoritos/favoritos';
import { FiltroDeDia } from '../filtro/filtro-de-dia';
import { FiltrosDaLista } from '../lista-de-blocos/filtros-da-lista';
import { avisoDoProblema } from '../localizacao/avisos';
import { distanciaEmMetros } from '../localizacao/distancia';
import { ExplicacaoDaLocalizacao } from '../localizacao/explicacao-da-localizacao';
import { Localizacao } from '../localizacao/localizacao';
import { Relogio } from '../relogio/relogio';
import { ZonaTag } from '../zona/zona-tag';
import { DestaqueDoDia } from './destaque-do-dia';
import { EstilosDoDia } from './estilos-do-dia';
import { FileiraDeBlocos } from './fileira-de-blocos';
import {
  DistanciaAte,
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
 *
 * Em Hoje, "Perto de mim" põe o que está rolando e começando do mais perto para o mais longe, com a
 * distância e o tempo a pé em cada bloco. A posição é lida uma vez por toque, como no mapa.
 */
@Component({
  selector: 'app-destaques',
  imports: [
    RouterLink,
    ZonaTag,
    AbasDoDia,
    CartaoDaFase,
    DestaqueDoDia,
    EstilosDoDia,
    ExplicacaoDaLocalizacao,
    FileiraDeBlocos,
  ],
  templateUrl: './destaques.html',
  styleUrl: './destaques.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Destaques {
  private readonly filtro = inject(FiltroDeDia);
  private readonly relogio = inject(Relogio);
  private readonly filtros = inject(FiltrosDaLista);
  private readonly router = inject(Router);
  private readonly localizacao = inject(Localizacao);
  private readonly aparelho = inject(APARELHO);
  protected readonly favoritos = inject(Favoritos);

  /**
   * O que está rolando e começando vai do mais perto para o mais longe? Já abre assim quando a pessoa
   * já mostrou onde está (no mapa, por exemplo).
   */
  protected readonly porPerto = signal(this.localizacao.estado() === 'ligada');
  protected readonly procurando = computed(() => this.localizacao.estado() === 'procurando');
  /** A tela que explica a localização está aberta? */
  protected readonly explicando = signal(false);
  /** A pessoa tocou em "Perto de mim" aqui: só então o aviso de que não deu para achar ela aparece. */
  private readonly tocou = signal(false);
  protected readonly aviso = computed(() => (this.tocou() ? avisoDoProblema(this.localizacao.estado(), this.aparelho) : null));
  private readonly botaoPerto = viewChild<ElementRef<HTMLButtonElement>>('botaoPerto');

  /** Onde cada bloco se concentra. Vem com os trajetos, que só são baixados quando a pessoa quer ver o que está perto. */
  private readonly trajetoDoBloco = signal<((blocoId: string) => Trajeto | undefined) | null>(null);

  /** A distância de onde a pessoa está até cada bloco, quando ela quer ver o que está perto. */
  private readonly distanciaAte = computed<DistanciaAte | null>(() => {
    const voce = this.localizacao.estado() === 'ligada' ? this.localizacao.posicao() : null;
    const trajetoDoBloco = this.trajetoDoBloco();
    if (!this.porPerto() || !voce || !trajetoDoBloco) {
      return null;
    }
    return (bloco) => {
      const ponto = trajetoDoBloco(bloco.id)?.inicio;
      return ponto && distanciaEmMetros(voce, { lng: ponto[0], lat: ponto[1] });
    };
  });

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
    // A distância só vale em Hoje: amanhã a pessoa vai estar em outro lugar.
    const perto = aba === 'hoje' ? this.distanciaAte() : null;
    const mostrar = (bloco: Bloco) => naVitrine(bloco, agora, perto);
    const noDestaque = destaque ? mostrar(destaque) : null;
    return {
      destaque: noDestaque,
      rotulo:
        aba === 'hoje' && noDestaque?.quando.tipo === 'agora' ? 'Destaque do momento' : `Destaque ${DIA_DA_ABA[aba]}`,
      famosos: famososDaVitrine(blocos, destaque).map(mostrar),
      tituloDosFamosos: `Os mais famosos ${DIA_DA_ABA[aba]}`,
      // Só em Hoje: em Amanhã e na Geral, "agora" não quer dizer nada.
      proximos: aba === 'hoje' ? proximosDaVitrine(blocos, destaque, perto).map(mostrar) : [],
      lgbt: lgbtDaVitrine(blocos).map(mostrar),
      // Em Hoje, todos são do mesmo dia: a fileira dos LGBTQIA+ destaca a hora; nas outras abas, o dia.
      destaqueDoLgbt: aba === 'hoje' ? ('hora' as const) : ('dia' as const),
      estilos: estilosDaVitrine(blocos, aba),
    };
  });

  constructor() {
    if (this.porPerto()) {
      void this.carregarOsPontos();
    }
  }

  /**
   * "Perto de mim" liga e desliga a ordem por distância. Ligando, procura a pessoa, explicando antes
   * quando o celular ainda vai perguntar.
   */
  protected async pertoDeMim(): Promise<void> {
    if (this.porPerto()) {
      this.porPerto.set(false);
      return;
    }
    if (this.procurando()) {
      return;
    }
    this.tocou.set(true);
    const passo = await this.localizacao.proximoPasso();
    if (passo === 'explicar') {
      this.explicando.set(true);
    } else if (passo === 'procurar') {
      await this.procurar();
    }
  }

  protected async continuar(): Promise<void> {
    this.fecharAExplicacao();
    await this.procurar();
  }

  protected agoraNao(): void {
    this.fecharAExplicacao();
  }

  private fecharAExplicacao(): void {
    this.explicando.set(false);
    this.botaoPerto()?.nativeElement.focus();
  }

  private async procurar(): Promise<void> {
    await Promise.all([this.localizacao.procurar(), this.carregarOsPontos()]);
    if (this.localizacao.estado() === 'ligada') {
      this.porPerto.set(true);
    }
  }

  private async carregarOsPontos(): Promise<void> {
    if (!this.trajetoDoBloco()) {
      const { trajetoDoBloco } = await import('../dados/trajetos');
      this.trajetoDoBloco.set(trajetoDoBloco);
    }
  }

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
