import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { AbasDoDia } from '../abas/abas-do-dia';
import { blocosDaAba } from '../dados/agenda';
import { formatarHora, partesDaData } from '../dados/formato';
import { circuitoDoLocal } from '../dados/trajetos';
import { FiltroDeDia } from '../filtro/filtro-de-dia';
import { distanciaEmMetros, textoDaDistancia } from '../localizacao/distancia';
import { ExplicacaoDaLocalizacao } from '../localizacao/explicacao-da-localizacao';
import { Localizacao } from '../localizacao/localizacao';
import { Relogio } from '../relogio/relogio';
import { ZonaTag } from '../zona/zona-tag';
import { estaNaGrandeSP } from './limites';
import { linkDoGoogleMaps, linkDoWaze } from './links';
import { MapaBase, PontoNoMapa, TrajetoNoMapa } from './mapa-base';

/** No cartão do ponto cabem só alguns blocos; o resto fica na página do lugar. */
const BLOCOS_NO_CARTAO = 3;

const AVISOS = {
  procurando: 'Procurando você…',
  negada:
    'O celular não deixou o CarnaVou ver onde você está. Para mudar, abra as configurações do navegador, em permissões do site. O mapa continua funcionando.',
  semSinal: 'Não consegui achar você agora. Tente de novo em um lugar aberto.',
  indisponivel: 'Este navegador não consegue dizer onde você está.',
  foraDeSaoPaulo:
    'Você parece estar fora da Grande São Paulo, então não aparece neste mapa. A distância até cada lugar aparece nos cartões.',
};

/**
 * A aba Mapa: os lugares da aba escolhida (Hoje, Amanhã ou Geral) como pontos no mapa e o botão
 * "onde estou". A localização só é pedida quando a pessoa toca nesse botão.
 */
@Component({
  selector: 'app-pagina-mapa',
  imports: [AbasDoDia, ExplicacaoDaLocalizacao, MapaBase, RouterLink, ZonaTag],
  templateUrl: './pagina-mapa.html',
  styleUrl: './pagina-mapa.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginaMapa {
  /** Vem do endereço (`/mapa?lugar=consolacao`): abre o mapa já com esse lugar escolhido. */
  readonly lugar = input<string | undefined>();

  private readonly filtro = inject(FiltroDeDia);
  private readonly localizacao = inject(Localizacao);
  private readonly relogio = inject(Relogio);

  private readonly mapa = viewChild(MapaBase);
  private readonly botaoOndeEstou = viewChild.required<ElementRef<HTMLButtonElement>>('botaoOndeEstou');

  /** O lugar em que a pessoa tocou. */
  private readonly escolhido = signal<string | null>(null);
  private readonly avisoFechado = signal(false);

  /** A tela que explica a localização está aberta? */
  protected readonly explicando = signal(false);

  protected readonly vazio = computed(() => this.filtro.cartoes().length === 0);
  protected readonly mensagemVazia = this.filtro.mensagemVazia;

  protected readonly voce = this.localizacao.posicao;
  protected readonly procurando = computed(() => this.localizacao.estado() === 'procurando');

  protected readonly pontos = computed<PontoNoMapa[]>(() =>
    this.filtro.cartoes().map(({ local }) => ({
      id: local.id,
      nome: local.nome,
      lat: local.lat,
      lng: local.lng,
      zona: local.zona,
    })),
  );

  /** Os trajetos dos megablocos dos lugares da aba, quando as fontes dizem por onde eles passam. */
  protected readonly trajetos = computed<TrajetoNoMapa[]>(() =>
    this.filtro.cartoes().flatMap(({ local }) => {
      const circuito = circuitoDoLocal(local.id);
      return circuito ? [{ id: local.id, zona: local.zona, linha: circuito.trajeto }] : [];
    }),
  );

  /** O lugar escolhido, se ele ainda está na aba de agora (trocar de aba pode tirá-lo). */
  protected readonly cartao = computed(() =>
    this.filtro.cartoes().find((cartao) => cartao.local.id === this.escolhido()),
  );

  protected readonly circuito = computed(() => {
    const local = this.cartao()?.local;
    return local ? circuitoDoLocal(local.id) : undefined;
  });

  /**
   * Os blocos do lugar escolhido que contam na aba: "13h · Agrada Gregos" em Hoje e Amanhã e,
   * na Geral, com o dia na frente ("sáb 14 fev · 13h").
   */
  protected readonly blocos = computed(() => {
    const local = this.cartao()?.local;
    if (!local) {
      return { lista: [], mais: 0 };
    }
    const aba = this.filtro.ativa();
    const todos = blocosDaAba(aba, local.id, this.relogio.agora());
    const lista = todos.slice(0, BLOCOS_NO_CARTAO).map((bloco) => {
      const hora = formatarHora(bloco.inicio);
      const { semana, dia, mes } = partesDaData(bloco.data);
      return {
        id: bloco.id,
        nome: bloco.nome,
        quando: aba === 'geral' ? `${semana} ${dia} ${mes} · ${hora}` : hora,
        caminho: ['/local', local.id, bloco.id],
      };
    });
    return { lista, mais: todos.length - lista.length };
  });

  protected readonly links = computed(() => {
    const local = this.cartao()?.local;
    return local
      ? { google: linkDoGoogleMaps(local.lat, local.lng), waze: linkDoWaze(local.lat, local.lng) }
      : undefined;
  });

  /** "1,2 km", se a pessoa já mostrou onde está. Em linha reta, sem ênfase. */
  protected readonly distancia = computed(() => {
    const voce = this.voce();
    const local = this.cartao()?.local;
    return voce && local ? textoDaDistancia(distanciaEmMetros(voce, local)) : null;
  });

  /** O que dizer sobre a localização. O aviso de "procurando" não pode ser fechado. */
  protected readonly aviso = computed<string | null>(() => {
    const estado = this.localizacao.estado();
    if (estado === 'procurando') {
      return AVISOS.procurando;
    }
    if (this.avisoFechado()) {
      return null;
    }
    switch (estado) {
      case 'negada':
        return AVISOS.negada;
      case 'sem-sinal':
        return AVISOS.semSinal;
      case 'indisponivel':
        return AVISOS.indisponivel;
      case 'ligada': {
        const voce = this.voce();
        return voce && !estaNaGrandeSP(voce.lat, voce.lng) ? AVISOS.foraDeSaoPaulo : null;
      }
      default:
        return null;
    }
  });

  constructor() {
    // Quem chega por "Ver no mapa" já vê o lugar escolhido. Se ele não está na aba de agora
    // (não tem bloco hoje, por exemplo), o mapa passa para a Geral, onde todos os lugares estão.
    // Espera saber o dia de hoje (ele só chega depois da primeira pintura) e faz isso uma vez por
    // lugar, para não brigar com a aba que a pessoa escolher depois.
    let lugarJaAberto: string | undefined;
    effect(() => {
      const lugar = this.lugar();
      if (!lugar || !this.relogio.agora() || lugar === lugarJaAberto) {
        return;
      }
      lugarJaAberto = lugar;
      untracked(() => {
        if (!this.filtro.cartoes().some((cartao) => cartao.local.id === lugar)) {
          this.filtro.escolher('geral');
        }
        this.escolhido.set(lugar);
      });
    });
  }

  protected escolher(id: string): void {
    this.escolhido.set(id);
  }

  protected fechar(): void {
    this.escolhido.set(null);
  }

  /** A pessoa tocou em "onde estou": explica antes, se o celular ainda vai perguntar. */
  protected async ondeEstou(): Promise<void> {
    if (this.procurando()) {
      return;
    }
    this.avisoFechado.set(false);
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

  protected fecharOAviso(): void {
    this.avisoFechado.set(true);
  }

  private fecharAExplicacao(): void {
    this.explicando.set(false);
    this.botaoOndeEstou().nativeElement.focus();
  }

  /** Procura a pessoa e, achando dentro da Grande São Paulo, leva o mapa até ela. */
  private async procurar(): Promise<void> {
    await this.localizacao.procurar();
    const voce = this.localizacao.posicao();
    if (this.localizacao.estado() === 'ligada' && voce && estaNaGrandeSP(voce.lat, voce.lng)) {
      this.mapa()?.irPara(voce.lat, voce.lng);
    }
  }
}
