import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { BannerBloco } from '../banner/banner-bloco';
import { FAIXAS } from '../dados/cores';
import { blocosDaNoite } from '../dados/lista-de-blocos';
import { LUGARES_DO_AFTER } from '../dados/lugares-do-after';
import { distanciaEmMetros, fraseDaDistancia } from '../localizacao/distancia';
import { Localizacao } from '../localizacao/localizacao';
import { Relogio } from '../relogio/relogio';
import { ZonaTag } from '../zona/zona-tag';

/** Os lugares do After, cada um com a sua cor de faixa (as cores se revezam). */
const LUGARES = LUGARES_DO_AFTER.map((lugar, posicao) => ({
  ...lugar,
  faixa: FAIXAS[posicao % FAIXAS.length],
}));

/**
 * A aba After: para onde ir agora, depois dos blocos. Vale sempre o hoje (sem as abas de dia):
 * os blocos da noite de hoje e os bares e pontos de encontro. "Onde estou" leva ao mapa do After,
 * que procura a pessoa lá, e cada lugar tem o botão Mapa, que abre o lugar no mapa. Se a
 * pessoa já mostrou onde está, os lugares ficam do mais perto para o mais longe.
 */
@Component({
  selector: 'app-pagina-after',
  imports: [BannerBloco, RouterLink, ZonaTag],
  templateUrl: './pagina-after.html',
  styleUrl: './pagina-after.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginaAfter {
  private readonly localizacao = inject(Localizacao);
  private readonly relogio = inject(Relogio);
  private readonly router = inject(Router);

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
      .map(({ lugar, metros }) => ({ ...lugar, distancia: fraseDaDistancia(metros) }));
  });

  /** "Onde estou": abre o mapa do After, que procura a pessoa por causa deste toque. */
  protected ondeEstou(): void {
    this.localizacao.procurarAoAbrirOMapa();
    void this.router.navigate(['/mapa'], { queryParams: { after: 'sim' } });
  }
}
