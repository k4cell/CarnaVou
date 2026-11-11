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
import { momentoDoBloco } from '../dados/agenda';
import { concentracoesDaAba, concentracoesDaNoite } from '../dados/concentracoes';
import { artistasPorFama } from '../dados/consultas';
import { artistaEstaNoNome, formatarHora, partesDaData, textoDoHorario } from '../dados/formato';
import { itinerarioDoBloco } from '../dados/itinerario';
import { LUGARES_DO_AFTER } from '../dados/lugares-do-after';
import { Bloco, MomentoDoBloco } from '../dados/tipos';
import { FiltroDeDia } from '../filtro/filtro-de-dia';
import { Ponto, distanciaEmMetros, fraseDaDistancia, textoDaDistancia } from '../localizacao/distancia';
import { ExplicacaoDaLocalizacao } from '../localizacao/explicacao-da-localizacao';
import { Localizacao } from '../localizacao/localizacao';
import { Relogio } from '../relogio/relogio';
import { ZonaTag } from '../zona/zona-tag';
import { estaNaGrandeSP } from './limites';
import { linksDeIr } from './links';
import { MapaBase, PontoNoMapa, TrajetoNoMapa } from './mapa-base';
import { blocosPertoDeVoce } from './perto-de-voce';
import { PONTOS_DO_AFTER, pontoDoLugarDoAfter } from './pontos-do-after';

/** Até quantos blocos o cartão pequeno mostra todos; com mais, mostra só os do horário de agora. */
const TODOS_NO_CARTAO_ATE = 3;
/** Quantos blocos o cartão pequeno mostra quando o ponto tem muitos. */
const BLOCOS_EM_DESTAQUE = 2;
/** Quantos dos outros blocos aparecem ao abrir o cartão; o resto fica na página do lugar. */
const BLOCOS_NO_CARTAO = 3;

/** Quantos lugares a lista "Perto de você" mostra no mapa do After. */
const PERTO_NO_AFTER = 4;

/** Quanto puxar a alça do cartão (em pixels) para ele abrir, encolher ou fechar. */
const PUXAO = 30;
/** Um toque que mexe menos que isso é toque, não arrasto. */
const TREMIDA_DO_DEDO = 8;

/** O horário no cartão do ponto: enquanto o bloco está rolando, ele avisa, como os cartões da lista. */
function horarioNoCartao(bloco: Bloco, momento: MomentoDoBloco): string {
  const texto = textoDoHorario(bloco, momento);
  return momento === 'rolando' ? `Rolando agora · ${texto.charAt(0).toLowerCase()}${texto.slice(1)}` : texto;
}

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
 *
 * Vindo do After, o mapa mostra o After de hoje: os bares e pontos de encontro e os blocos da noite.
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
  /**
   * Vem do endereço: `/mapa?after=sim` mostra o After de hoje (os bares e os blocos da noite), e
   * `/mapa?after=beco-do-batman` abre o mapa já nesse lugar.
   */
  readonly after = input<string | undefined>();

  private readonly filtro = inject(FiltroDeDia);
  private readonly localizacao = inject(Localizacao);
  private readonly relogio = inject(Relogio);

  private readonly mapa = viewChild(MapaBase);
  private readonly botaoOndeEstou = viewChild.required<ElementRef<HTMLButtonElement>>('botaoOndeEstou');

  /** O ponto em que a pessoa tocou. */
  private readonly escolhido = signal<string | null>(null);
  private readonly avisoFechado = signal(false);

  /** O cartão do ponto está aberto (mostrando tudo) ou pequeno (o nome, o lugar e os botões)? */
  protected readonly aberto = signal(false);
  /**
   * O cartão está minimizado (só o nome e os botões de ir)? O × minimiza, para a pessoa ver o pino
   * sem perder o ponto escolhido; minimizado, o × fecha.
   */
  protected readonly minimizado = signal(false);
  /** Quanto o dedo já puxou a alça do cartão, em pixels (para baixo é positivo). */
  protected readonly arrasto = signal(0);
  private comecoDoArrasto: number | null = null;
  private acabouDeArrastar = false;

  /** A tela que explica a localização está aberta? */
  protected readonly explicando = signal(false);
  /** A lista "Perto de você" foi fechada no ×? Ela volta no próximo "onde estou". */
  private readonly pertoFechado = signal(false);

  /** O mapa está mostrando o After de hoje, e não os blocos da aba? */
  protected readonly modoAfter = computed(() => this.after() !== undefined);

  protected readonly vazio = computed(() => !this.modoAfter() && this.filtro.cartoes().length === 0);
  protected readonly mensagemVazia = this.filtro.mensagemVazia;

  protected readonly voce = this.localizacao.posicao;
  protected readonly procurando = computed(() => this.localizacao.estado() === 'procurando');

  /**
   * Onde se concentram os blocos da aba (ou, no After, os da noite de hoje): blocos que se
   * concentram no mesmo lugar dividem o ponto.
   */
  private readonly concentracoes = computed(() =>
    this.modoAfter()
      ? concentracoesDaNoite(this.relogio.agora())
      : concentracoesDaAba(this.filtro.ativa(), this.relogio.agora()),
  );

  protected readonly pontos = computed<PontoNoMapa[]>(() => [
    ...this.concentracoes().map(({ id, local, blocos, lat, lng }) => ({
      id,
      nome: blocos.length === 1 ? blocos[0].nome : `${blocos[0].nome} e mais ${blocos.length - 1}`,
      lat,
      lng,
      zona: local.zona,
      quantos: blocos.length,
    })),
    ...(this.modoAfter()
      ? PONTOS_DO_AFTER.map(({ ponto, nome, lat, lng, zona, lugares }) => ({
          id: ponto,
          nome,
          lat,
          lng,
          zona,
          after: true,
          quantos: lugares.length,
        }))
      : []),
  ]);

  /** O ponto do After escolhido: um bar ou ponto de encontro, ou alguns, pertinho um do outro. */
  protected readonly pontoDoAfter = computed(() =>
    this.modoAfter() ? PONTOS_DO_AFTER.find((ponto) => ponto.ponto === this.escolhido()) : undefined,
  );

  /** O ponto escolhido, se ele ainda está na aba de agora (trocar de aba pode tirá-lo). */
  protected readonly cartao = computed(() => {
    const ponto = this.concentracoes().find((candidato) => candidato.id === this.escolhido());
    if (!ponto) {
      return undefined;
    }
    const [primeiro] = ponto.blocos;
    return {
      ...ponto,
      // O nome que vai para o Uber: o do bloco ou, num ponto de vários blocos, o do lugar.
      titulo: ponto.blocos.length === 1 ? primeiro.nome : ponto.local.nome,
      itinerario: itinerarioDoBloco(primeiro.id),
      aproximado: ponto.trajetos.some((trajeto) => trajeto.aproximado),
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
   * Os blocos do ponto escolhido. No cartão pequeno (destaque), cada um com o nome e, embaixo, os
   * artistas ou, sem artista divulgado, o horário. Até 3 blocos, aparecem todos; com 4 ou mais, só
   * os 2 de agora ou dos próximos horários, e os outros aparecem ao abrir o cartão ("13h · Carna
   * Lau" em Hoje e Amanhã e, na Geral, com o dia na frente: "sáb 14 fev · 13h").
   */
  protected readonly blocos = computed(() => {
    const ponto = this.cartao();
    if (!ponto) {
      return { destaque: [], outros: [], escondidos: 0, mais: 0 };
    }
    const agora = this.relogio.agora();
    const aba = this.modoAfter() ? 'hoje' : this.filtro.ativa();
    const linha = (bloco: Bloco) => {
      const { semana, dia, mes } = partesDaData(bloco.data);
      const noDia = aba === 'geral' ? `${semana} ${dia} ${mes} · ` : '';
      const artistas = artistasPorFama([bloco])
        .filter((nome) => !artistaEstaNoNome(bloco, nome))
        .join(', ');
      return {
        id: bloco.id,
        nome: bloco.nome,
        sobre: artistas || noDia + horarioNoCartao(bloco, momentoDoBloco(bloco, agora)),
        quando: noDia + formatarHora(bloco.inicio),
        caminho: ['/local', bloco.localId, bloco.id],
      };
    };
    let destaque = ponto.blocos;
    if (ponto.blocos.length > TODOS_NO_CARTAO_ATE) {
      const aindaVao = ponto.blocos.filter((bloco) => momentoDoBloco(bloco, agora) !== 'acabou');
      destaque = (aindaVao.length > 0 ? aindaVao : ponto.blocos).slice(0, BLOCOS_EM_DESTAQUE);
    }
    const resto = ponto.blocos.filter((bloco) => !destaque.includes(bloco));
    const outros = resto.slice(0, BLOCOS_NO_CARTAO);
    return {
      destaque: destaque.map(linha),
      outros: outros.map(linha),
      escondidos: resto.length,
      mais: resto.length - outros.length,
    };
  });

  protected readonly links = computed(() => {
    const ponto = this.cartao();
    if (ponto) {
      return linksDeIr(ponto.lat, ponto.lng, ponto.titulo);
    }
    const doAfter = this.pontoDoAfter();
    return doAfter ? linksDeIr(doAfter.lat, doAfter.lng, doAfter.nome) : undefined;
  });

  /** "A 1,2 km de você, uns 25 min a pé.", se a pessoa já mostrou onde está. */
  protected readonly distancia = computed(() => {
    const voce = this.voce();
    const alvo = this.cartao() ?? this.pontoDoAfter();
    return voce && alvo ? fraseDaDistancia(distanciaEmMetros(voce, alvo)) : null;
  });

  /**
   * Depois do "onde estou", os blocos que o CarnaVou recomenda: os que estão rolando perto da
   * pessoa (os grandes ganham peso). No After, os lugares e os blocos da noite mais perto. A lista
   * some enquanto o cartão de um ponto está aberto.
   */
  protected readonly perto = computed(() => {
    const voce = this.voce();
    const agora = this.relogio.agora();
    const achou = this.localizacao.estado() === 'ligada' && voce && estaNaGrandeSP(voce.lat, voce.lng);
    if (!achou || !agora || this.pertoFechado() || this.cartao() || this.pontoDoAfter()) {
      return null;
    }
    if (this.modoAfter()) {
      return this.pertoNoAfter(voce, agora);
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
        // "1,2 km · Rolando agora · Gloria Groove"
        detalhe: [
          textoDaDistancia(metros),
          rolando ? 'Rolando agora' : `Hoje às ${formatarHora(bloco.inicio)}`,
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
    // Quem chega pelo After vê o lugar pedido e, se tocou em "Onde estou", é procurado aqui.
    // Espera saber o dia de hoje (ele só chega depois da primeira pintura) e faz isso uma vez por
    // pedido, para não brigar com a aba que a pessoa escolher depois.
    let pedidoJaAberto: string | undefined;
    effect(() => {
      const bloco = this.bloco();
      const lugar = this.lugar();
      const after = this.after();
      const pedido = bloco
        ? `bloco:${bloco}`
        : lugar
          ? `lugar:${lugar}`
          : after !== undefined
            ? `after:${after}`
            : undefined;
      if (!pedido || !this.relogio.agora() || pedido === pedidoJaAberto) {
        return;
      }
      pedidoJaAberto = pedido;
      untracked(() => {
        if (!bloco && !lugar) {
          this.escolhido.set(pontoDoLugarDoAfter(after ?? '')?.ponto ?? null);
          this.mostrarPequeno();
          if (this.localizacao.veioDeUmToque()) {
            void this.ondeEstou();
          }
          return;
        }
        const acharOPonto = () =>
          this.concentracoes().find((ponto) =>
            bloco ? ponto.blocos.some((candidato) => candidato.id === bloco) : ponto.local.id === lugar,
          );
        if (!acharOPonto()) {
          this.filtro.escolher('geral');
        }
        this.escolhido.set(acharOPonto()?.id ?? null);
        this.mostrarPequeno();
      });
    });
  }

  protected escolher(id: string): void {
    this.escolhido.set(id);
    this.mostrarPequeno();
  }

  protected fechar(): void {
    this.escolhido.set(null);
    this.mostrarPequeno();
  }

  /** O ×: minimiza o cartão e, se ele já está minimizado, fecha. */
  protected minimizarOuFechar(): void {
    if (this.minimizado()) {
      this.fechar();
    } else {
      this.minimizado.set(true);
      this.aberto.set(false);
    }
  }

  /** O cartão no tamanho de quando abre: nem minimizado nem aberto. */
  protected mostrarPequeno(): void {
    this.minimizado.set(false);
    this.aberto.set(false);
  }

  protected abrir(): void {
    this.minimizado.set(false);
    this.aberto.set(true);
  }

  /** Um bloco da lista "Perto de você": abre o cartão dele, na aba Hoje (a lista é de hoje). */
  protected escolherPerto(ponto: string): void {
    if (!this.modoAfter()) {
      this.filtro.escolher('hoje');
    }
    this.escolher(ponto);
  }

  protected fecharPerto(): void {
    this.pertoFechado.set(true);
  }

  /**
   * Tocar na alça abre ou encolhe o cartão; minimizado, ele volta ao tamanho de quando abre (o
   * arrasto já cuidou disso, se teve).
   */
  protected alternar(): void {
    if (this.acabouDeArrastar) {
      this.acabouDeArrastar = false;
      return;
    }
    if (this.minimizado()) {
      this.mostrarPequeno();
    } else {
      this.aberto.update((aberto) => !aberto);
    }
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

  /** Puxou para cima: cresce um passo. Para baixo: encolhe um passo e, se já estava minimizado, fecha. */
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
      if (this.minimizado()) {
        this.mostrarPequeno();
      } else {
        this.abrir();
      }
    } else if (puxado >= PUXAO) {
      if (this.aberto()) {
        this.aberto.set(false);
      } else if (!this.minimizado()) {
        this.minimizado.set(true);
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

  /** No After: os lugares e os blocos da noite mais perto da pessoa, do mais perto para o mais longe. */
  private pertoNoAfter(voce: Ponto, agora: Date) {
    const blocos = this.concentracoes().flatMap((ponto) =>
      ponto.blocos.map((bloco) => {
        const metros = distanciaEmMetros(voce, ponto);
        const rolando = momentoDoBloco(bloco, agora) === 'rolando';
        return {
          id: bloco.id,
          ponto: ponto.id,
          nome: bloco.nome,
          metros,
          // "1,2 km · Hoje às 18h · Gloria Groove"
          detalhe: [
            textoDaDistancia(metros),
            rolando ? 'Rolando agora' : `Hoje às ${formatarHora(bloco.inicio)}`,
            ...artistasPorFama([bloco]).slice(0, 1),
          ].join(' · '),
        };
      }),
    );
    const lugares = LUGARES_DO_AFTER.map((lugar) => {
      const metros = distanciaEmMetros(voce, lugar);
      return {
        id: `after:${lugar.id}`,
        ponto: pontoDoLugarDoAfter(lugar.id)?.ponto ?? '',
        nome: lugar.nome,
        metros,
        detalhe: `${textoDaDistancia(metros)} · ${lugar.tipo}`,
      };
    });
    return {
      titulo: 'Perto de você',
      blocos: [...blocos, ...lugares].sort((a, b) => a.metros - b.metros).slice(0, PERTO_NO_AFTER),
    };
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
