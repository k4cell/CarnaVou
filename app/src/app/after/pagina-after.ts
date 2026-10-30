import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';

import { BannerBloco } from '../banner/banner-bloco';
import { FAIXAS } from '../dados/consultas';
import { blocosDaNoite } from '../dados/lista-de-blocos';
import { LUGARES_DO_AFTER } from '../dados/lugares-do-after';
import { distanciaEmMetros, textoDaDistancia } from '../localizacao/distancia';
import { ExplicacaoDaLocalizacao } from '../localizacao/explicacao-da-localizacao';
import { Localizacao } from '../localizacao/localizacao';
import { linksDeIr } from '../mapa/links';
import { Relogio } from '../relogio/relogio';
import { ZonaTag } from '../zona/zona-tag';

/** Os lugares do After, cada um com a sua cor de faixa (as cores se revezam) e os links de ir. */
const LUGARES = LUGARES_DO_AFTER.map((lugar, posicao) => ({
  ...lugar,
  faixa: FAIXAS[posicao % FAIXAS.length],
  links: linksDeIr(lugar.lat, lugar.lng, lugar.nome),
}));

const AVISOS = {
  negada:
    'O celular não deixou o CarnaVou ver onde você está. Para mudar, abra as configurações do navegador, em permissões do site.',
  semSinal: 'Não consegui achar você agora. Tente de novo em um lugar aberto.',
  indisponivel: 'Este navegador não consegue dizer onde você está.',
};

/**
 * A aba After: para onde ir agora, depois dos blocos. Vale sempre o hoje (sem as abas de dia):
 * os blocos da noite de hoje e os bares e pontos de encontro. Tocando em "Onde estou", os lugares
 * ficam do mais perto para o mais longe; a localização segue as mesmas regras do mapa.
 */
@Component({
  selector: 'app-pagina-after',
  imports: [BannerBloco, ExplicacaoDaLocalizacao, ZonaTag],
  templateUrl: './pagina-after.html',
  styleUrl: './pagina-after.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginaAfter {
  private readonly localizacao = inject(Localizacao);
  private readonly relogio = inject(Relogio);

  private readonly botaoOndeEstou = viewChild.required<ElementRef<HTMLButtonElement>>('botaoOndeEstou');

  /** Os blocos da noite de hoje. Nulo enquanto não se sabe o dia (na página pronta). */
  protected readonly blocos = computed(() => {
    const agora = this.relogio.agora();
    return agora ? blocosDaNoite('hoje', agora) : null;
  });

  /** Os lugares, do mais perto para o mais longe quando já se sabe onde a pessoa está. */
  protected readonly lugares = computed(() => {
    const voce = this.localizacao.estado() === 'ligada' ? this.localizacao.posicao() : null;
    if (!voce) {
      return LUGARES.map((lugar) => ({ ...lugar, distancia: null as string | null }));
    }
    return LUGARES.map((lugar) => ({ lugar, metros: distanciaEmMetros(voce, lugar) }))
      .sort((a, b) => a.metros - b.metros)
      .map(({ lugar, metros }) => ({ ...lugar, distancia: textoDaDistancia(metros) }));
  });

  /** A tela que explica a localização está aberta? */
  protected readonly explicando = signal(false);
  protected readonly procurando = computed(() => this.localizacao.estado() === 'procurando');

  protected readonly aviso = computed<string | null>(() => {
    switch (this.localizacao.estado()) {
      case 'negada':
        return AVISOS.negada;
      case 'sem-sinal':
        return AVISOS.semSinal;
      case 'indisponivel':
        return AVISOS.indisponivel;
      default:
        return null;
    }
  });

  /** A pessoa tocou em "Onde estou": explica antes, se o celular ainda vai perguntar. */
  protected async ondeEstou(): Promise<void> {
    if (this.procurando()) {
      return;
    }
    const passo = await this.localizacao.proximoPasso();
    if (passo === 'explicar') {
      this.explicando.set(true);
    } else if (passo === 'procurar') {
      await this.localizacao.procurar();
    }
  }

  protected async continuar(): Promise<void> {
    this.fecharAExplicacao();
    await this.localizacao.procurar();
  }

  protected agoraNao(): void {
    this.fecharAExplicacao();
  }

  private fecharAExplicacao(): void {
    this.explicando.set(false);
    this.botaoOndeEstou().nativeElement.focus();
  }
}
