import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { AbasDoDia } from '../abas/abas-do-dia';
import { BannerBloco } from '../banner/banner-bloco';
import { Aba } from '../dados/agenda';
import { FAIXAS } from '../dados/consultas';
import { blocosDaNoite } from '../dados/lista-de-blocos';
import { LUGARES_DO_AFTER } from '../dados/lugares-do-after';
import { FiltroDeDia } from '../filtro/filtro-de-dia';
import { linkDoGoogleMaps, linkDoUber, linkDoWaze } from '../mapa/links';
import { Relogio } from '../relogio/relogio';
import { ZonaTag } from '../zona/zona-tag';

const NADA_NA_ABA: Record<Aba, string> = {
  hoje: 'Nenhum bloco da noite hoje.',
  amanha: 'Nenhum bloco da noite amanhã.',
  geral: 'Não tem mais blocos da noite.',
};

/** Os lugares do After, cada um com a sua cor de faixa (as cores se revezam) e os links de ir. */
const LUGARES = LUGARES_DO_AFTER.map((lugar, posicao) => ({
  ...lugar,
  faixa: FAIXAS[posicao % FAIXAS.length],
  links: {
    google: linkDoGoogleMaps(lugar.lat, lugar.lng),
    waze: linkDoWaze(lugar.lat, lugar.lng),
    uber: linkDoUber(lugar.lat, lugar.lng, lugar.nome),
  },
}));

/**
 * A aba After: para onde ir depois dos blocos. Os blocos da noite seguem o filtro Hoje | Amanhã |
 * Geral, o mesmo das outras abas; os bares e pontos de encontro valem para todos os dias.
 */
@Component({
  selector: 'app-pagina-after',
  imports: [AbasDoDia, BannerBloco, ZonaTag],
  template: `
    <app-abas-do-dia />
    <h2 class="titulo">After</h2>
    <p class="subtitulo">Para onde ir depois dos blocos.</p>

    <h3 class="secao">Blocos da noite</h3>
    @if (blocos().length > 0) {
      <ul class="lista">
        @for (bloco of blocos(); track bloco.id) {
          <li><app-banner-bloco [bloco]="bloco" [mostrarLugar]="true" /></li>
        }
      </ul>
    } @else {
      <p class="vazio">{{ nadaNaAba() }}</p>
    }

    <h3 class="secao">Bares e pontos de encontro</h3>
    <ul class="lista">
      @for (lugar of lugares; track lugar.id) {
        <li class="cartao lugar-do-after" [attr.data-faixa]="lugar.faixa">
          <span class="texto">
            <strong class="nome">{{ lugar.nome }}</strong>
            <app-zona-tag [zona]="lugar.zona" />
            <span class="endereco">{{ lugar.tipo }} · {{ lugar.endereco }}</span>
            <span class="acoes">
              <a class="botao botao-principal" [href]="lugar.links.google" target="_blank" rel="noopener">Ir</a>
              <a class="botao" [href]="lugar.links.waze" target="_blank" rel="noopener">Waze</a>
              <a class="botao" [href]="lugar.links.uber" target="_blank" rel="noopener">Uber</a>
            </span>
          </span>
        </li>
      }
    </ul>
  `,
  styles: `
    .titulo {
      margin-top: 16px;
    }

    .vazio {
      margin: 8px 0 0;
    }

    .lugar-do-after .texto {
      flex: 1;
      gap: 4px;
      min-width: 0;
    }

    .endereco {
      color: var(--texto-suave);
    }

    .acoes {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginaAfter {
  private readonly filtro = inject(FiltroDeDia);
  private readonly relogio = inject(Relogio);

  protected readonly lugares = LUGARES;
  protected readonly blocos = computed(() => blocosDaNoite(this.filtro.ativa(), this.relogio.agora()));
  protected readonly nadaNaAba = computed(() => NADA_NA_ABA[this.filtro.ativa()]);
}
