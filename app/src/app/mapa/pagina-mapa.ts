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
import { concentracoesDaAba } from '../dados/concentracoes';
import { artistasPorFama } from '../dados/consultas';
import { formatarHora, partesDaData } from '../dados/formato';
import { itinerarioDoBloco } from '../dados/itinerario';
import { FiltroDeDia } from '../filtro/filtro-de-dia';
import { distanciaEmMetros, textoDaDistancia } from '../localizacao/distancia';
import { ExplicacaoDaLocalizacao } from '../localizacao/explicacao-da-localizacao';
import { Localizacao } from '../localizacao/localizacao';
import { Relogio } from '../relogio/relogio';
import { ZonaTag } from '../zona/zona-tag';
import { estaNaGrandeSP } from './limites';
import { linkDoGoogleMaps, linkDoUber, linkDoWaze } from './links';
import { MapaBase, PontoNoMapa, TrajetoNoMapa } from './mapa-base';
import { blocosPertoDeVoce } from './perto-de-voce';

/** No cartão do ponto cabem só alguns blocos; o resto fica na página do lugar. */
const BLOCOS_NO_CARTAO = 3;
/** Os nomes dos blocos de um ponto, já no cartão pequeno: "A, B e C" ou "A, B, C e mais 2". */
function nomesDoPonto(nomes: string[]): string {
  const mostrados = nomes.slice(0, 3);
  const resto = nomes.length - mostrados.length;
  if (resto > 0) {
    return `${mostrados.join(', ')} e mais ${resto}`;
  }
  return mostrados.length > 1 ? `${mostrados.slice(0, -1).join(', ')} e ${mostrados.at(-1)}` : mostrados.join('');
}

/** Quanto puxar a alça do cartão (em pixels) para ele abrir, encolher ou fechar. */
const PUXAO = 30;
/** Um toque que mexe menos que isso é toque, não arrasto. */
const TREMIDA_DO_DEDO = 8;

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
 * A aba Mapa: onde se concentram os blocos da aba escolhida (Hoje, Amanhã ou Geral), como pontos
 * no mapa, e o botão "onde estou". Tocando num ponto, aparece a linha por onde o bloco passa e
 * um cartão com os blocos dali. A localização só é pedida quando a pessoa toca em "onde estou";
 * achando a pessoa, aparecem os blocos rolando perto dela.
 */
@Component({
  selector: 'app-pagina-mapa',
  imports: [AbasDoDia, ExplicacaoDaLocalizacao, MapaBase, RouterLink, ZonaTag],
  templateUrl: './pagina-mapa.html',
  styleUrl: './pagina-mapa.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginaMapa {
  /** Vem do endereço (`/mapa?lugar=ibirapuera`): abre o mapa no próximo bloco desse lugar. */
  readonly lugar = input<string | undefined>();
  /** Vem do endereço (`/mapa?bloco=pipoca-da-rainha`): abre o mapa já nesse bloco. */
  readonly bloco = input<string | undefined>();

  private readonly filtro = inject(FiltroDeDia);
  private readonly localizacao = inject(Localizacao);
  private readonly relogio = inject(Relogio);

  private readonly mapa = viewChild(MapaBase);
  private readonly botaoOndeEstou = viewChild.required<ElementRef<HTMLButtonElement>>('botaoOndeEstou');

  /** O ponto em que a pessoa tocou. */
  private readonly escolhido = signal<string | null>(null);
  private readonly avisoFechado = signal(false);

  /** O cartão do ponto está aberto (mostrando tudo) ou pequeno (só o nome e os botões)? */
  protected readonly aberto = signal(false);
  /** Quanto o dedo já puxou a alça do cartão, em pixels (para baixo é positivo). */
  protected readonly arrasto = signal(0);
  private comecoDoArrasto: number | null = null;
  private acabouDeArrastar = false;

  /** A tela que explica a localização está aberta? */
  protected readonly explicando = signal(false);
  /** A lista "Perto de você" foi fechada no ×? Ela volta no próximo "onde estou". */
  private readonly pertoFechado = signal(false);

  protected readonly vazio = computed(() => this.filtro.cartoes().length === 0);
  protected readonly mensagemVazia = this.filtro.mensagemVazia;

  protected readonly voce = this.localizacao.posicao;
  protected readonly procurando = computed(() => this.localizacao.estado() === 'procurando');

  /** Onde se concentram os blocos da aba: blocos que se concentram no mesmo lugar dividem o ponto. */
  private readonly concentracoes = computed(() => concentracoesDaAba(this.filtro.ativa(), this.relogio.agora()));

  protected readonly pontos = computed<PontoNoMapa[]>(() =>
    this.concentracoes().map(({ id, local, blocos, lat, lng }) => ({
      id,
      nome: blocos.length === 1 ? blocos[0].nome : `${blocos[0].nome} e mais ${blocos.length - 1}`,
      lat,
      lng,
      zona: local.zona,
    })),
  );

  /** O ponto escolhido, se ele ainda está na aba de agora (trocar de aba pode tirá-lo). */
  protected readonly cartao = computed(() => {
    const ponto = this.concentracoes().find((candidato) => candidato.id === this.escolhido());
    if (!ponto) {
      return undefined;
    }
    const [primeiro] = ponto.blocos;
    const artistas = [...new Set(ponto.blocos.flatMap((bloco) => bloco.atracoes.map((atracao) => atracao.nome)))];
    return {
      ...ponto,
      titulo: ponto.blocos.length === 1 ? primeiro.nome : `${ponto.blocos.length} blocos neste ponto`,
      nomes: ponto.blocos.length > 1 ? nomesDoPonto(ponto.blocos.map((bloco) => bloco.nome)) : '',
      itinerario: itinerarioDoBloco(primeiro.id),
      aproximado: ponto.trajetos.some((trajeto) => trajeto.aproximado),
      artistas: artistas.join(', '),
    };
  });

  /** Só aparece a linha do ponto escolhido: com todas juntas, o mapa vira um emaranhado. */
  protected readonly trajetos = computed<TrajetoNoMapa[]>(() => {
    const ponto = this.cartao();
    if (!ponto) {
      return [];
    }
    return ponto.trajetos.flatMap(({ linha }) => (linha ? [{ id: ponto.id, zona: ponto.local.zona, linha }] : []));
  });

  /**
   * Os blocos do ponto escolhido: "13h · Agrada Gregos" em Hoje e Amanhã e, na Geral, com o dia
   * na frente ("sáb 14 fev · 13h").
   */
  protected readonly blocos = computed(() => {
    const ponto = this.cartao();
    if (!ponto) {
      return { lista: [], mais: 0 };
    }
    const aba = this.filtro.ativa();
    const lista = ponto.blocos.slice(0, BLOCOS_NO_CARTAO).map((bloco) => {
      const hora = formatarHora(bloco.inicio);
      const { semana, dia, mes } = partesDaData(bloco.data);
      return {
        id: bloco.id,
        nome: bloco.nome,
        quando: aba === 'geral' ? `${semana} ${dia} ${mes} · ${hora}` : hora,
        caminho: ['/local', bloco.localId, bloco.id],
      };
    });
    return { lista, mais: ponto.blocos.length - lista.length };
  });

  protected readonly links = computed(() => {
    const ponto = this.cartao();
    if (!ponto) {
      return undefined;
    }
    return {
      google: linkDoGoogleMaps(ponto.lat, ponto.lng),
      waze: linkDoWaze(ponto.lat, ponto.lng),
      uber: linkDoUber(ponto.lat, ponto.lng, ponto.titulo),
    };
  });

  /** "1,2 km", se a pessoa já mostrou onde está. Em linha reta, sem ênfase. */
  protected readonly distancia = computed(() => {
    const voce = this.voce();
    const ponto = this.cartao();
    return voce && ponto ? textoDaDistancia(distanciaEmMetros(voce, ponto)) : null;
  });

  /**
   * Depois do "onde estou", os blocos que o CarnaVou recomenda: os que estão rolando perto da
   * pessoa (os grandes ganham peso). A lista some enquanto o cartão de um ponto está aberto.
   */
  protected readonly perto = computed(() => {
    const voce = this.voce();
    const agora = this.relogio.agora();
    const achou = this.localizacao.estado() === 'ligada' && voce && estaNaGrandeSP(voce.lat, voce.lng);
    if (!achou || !agora || this.pertoFechado() || this.cartao()) {
      return null;
    }
    const blocos = blocosPertoDeVoce(voce, agora);
    const titulo =
      blocos.length === 0 ? 'Perto de você' : blocos[0].rolando ? 'Rolando perto de você' : 'Mais tarde hoje, perto de você';
    return {
      titulo,
      blocos: blocos.map(({ bloco, ponto, metros, rolando }) => ({
        id: bloco.id,
        ponto,
        nome: bloco.nome,
        // "1,2 km · Já começou · Gloria Groove"
        detalhe: [
          textoDaDistancia(metros),
          rolando ? 'Já começou' : `Hoje às ${formatarHora(bloco.inicio)}`,
          ...artistasPorFama([bloco]).slice(0, 1),
        ].join(' · '),
      })),
    };
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
    // Quem chega por "Ver no mapa" já vê o ponto do bloco (ou o do próximo bloco do lugar). Se ele
    // não está na aba de agora (não tem bloco hoje, por exemplo), o mapa passa para a Geral.
    // Espera saber o dia de hoje (ele só chega depois da primeira pintura) e faz isso uma vez por
    // pedido, para não brigar com a aba que a pessoa escolher depois.
    let pedidoJaAberto: string | undefined;
    effect(() => {
      const bloco = this.bloco();
      const lugar = this.lugar();
      const pedido = bloco ? `bloco:${bloco}` : lugar ? `lugar:${lugar}` : undefined;
      if (!pedido || !this.relogio.agora() || pedido === pedidoJaAberto) {
        return;
      }
      pedidoJaAberto = pedido;
      untracked(() => {
        const acharOPonto = () =>
          this.concentracoes().find((ponto) =>
            bloco ? ponto.blocos.some((candidato) => candidato.id === bloco) : ponto.local.id === lugar,
          );
        if (!acharOPonto()) {
          this.filtro.escolher('geral');
        }
        this.escolhido.set(acharOPonto()?.id ?? null);
        this.aberto.set(false);
      });
    });
  }

  protected escolher(id: string): void {
    this.escolhido.set(id);
    this.aberto.set(false);
  }

  protected fechar(): void {
    this.escolhido.set(null);
    this.aberto.set(false);
  }

  /** Um bloco da lista "Perto de você": abre o cartão dele, na aba Hoje (a lista é de hoje). */
  protected escolherPerto(ponto: string): void {
    this.filtro.escolher('hoje');
    this.escolher(ponto);
  }

  protected fecharPerto(): void {
    this.pertoFechado.set(true);
  }

  /** Tocar na alça abre ou encolhe o cartão (o arrasto já cuidou disso, se teve). */
  protected alternar(): void {
    if (this.acabouDeArrastar) {
      this.acabouDeArrastar = false;
      return;
    }
    this.aberto.update((aberto) => !aberto);
  }

  protected comecarArrasto(evento: PointerEvent): void {
    // Depois de um arrasto, alguns celulares não mandam o "clique": o aviso não pode sobrar.
    this.acabouDeArrastar = false;
    this.comecoDoArrasto = evento.clientY;
    (evento.currentTarget as Element | null)?.setPointerCapture?.(evento.pointerId);
  }

  /** O cartão acompanha o dedo: para baixo, inteiro; para cima, só um pouco (ele vai abrir). */
  protected arrastar(evento: PointerEvent): void {
    if (this.comecoDoArrasto === null) {
      return;
    }
    const puxado = evento.clientY - this.comecoDoArrasto;
    this.arrasto.set(puxado > 0 ? puxado : puxado / 3);
  }

  /** Puxou para cima: abre. Para baixo: encolhe e, se já estava pequeno, fecha. */
  protected soltar(): void {
    if (this.comecoDoArrasto === null) {
      return;
    }
    const puxado = this.arrasto() >= 0 ? this.arrasto() : this.arrasto() * 3;
    this.cancelarArrasto();
    if (Math.abs(puxado) < TREMIDA_DO_DEDO) {
      return;
    }
    this.acabouDeArrastar = true;
    if (puxado <= -PUXAO) {
      this.aberto.set(true);
    } else if (puxado >= PUXAO) {
      if (this.aberto()) {
        this.aberto.set(false);
      } else {
        this.fechar();
      }
    }
  }

  protected cancelarArrasto(): void {
    this.comecoDoArrasto = null;
    this.arrasto.set(0);
  }

  /** A pessoa tocou em "onde estou": explica antes, se o celular ainda vai perguntar. */
  protected async ondeEstou(): Promise<void> {
    if (this.procurando()) {
      return;
    }
    this.avisoFechado.set(false);
    this.pertoFechado.set(false);
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
