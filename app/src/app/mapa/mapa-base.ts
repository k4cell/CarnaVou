import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import type {
  AddLayerObject,
  ExpressionSpecification,
  FilterSpecification,
  GeoJSONSource,
  Map as MapaDoMapLibre,
  Marker,
} from 'maplibre-gl';

import { Zona } from '../dados/tipos';
import {
  areaDaPrecisao,
  bolinhasDosPontos,
  corDoTema,
  criarBolinhaDaPessoa,
  criarPino,
  linhasDosTrajetos,
} from './desenhos';
import { LIMITES_DA_GRANDE_SP } from './limites';
import { BibliotecaDeMapa, CARREGAR_MAPLIBRE, enderecoNoSite } from './maplibre';
import { PROTOCOLO_DOS_PEDACOS, baixarPedaco } from './pedacos-do-mapa';

/** Um ponto do mapa (onde um ou mais blocos se concentram): é só o que o mapa precisa saber. */
export interface PontoNoMapa {
  id: string;
  /** O nome que o leitor de tela fala quando o ponto está escolhido. */
  nome: string;
  lat: number;
  lng: number;
  zona: Zona;
  /** Um bar ou ponto de encontro do After: tem o desenho próprio, para não se confundir com os blocos. */
  after?: boolean;
  /** Quantos blocos (ou bares) o ponto junta. Com dois ou mais, o número aparece no ponto. */
  quantos?: number;
}

/** Por onde um bloco passa: a linha, na cor da zona, da concentração (o ponto) até o fim. */
export interface TrajetoNoMapa {
  /** O mesmo id do ponto onde a linha começa. */
  id: string;
  zona: Zona;
  /** A linha, como [longitude, latitude]. */
  linha: [number, number][];
}

/** Onde a pessoa está: um ponto e o erro provável da posição, em metros. */
export interface PosicaoNoMapa {
  lat: number;
  lng: number;
  precisao: number;
}

const CENTRO_DE_SAO_PAULO: [number, number] = [-46.655, -23.57];
/**
 * Espaço livre em volta dos pontos. Em cima ficam as abas e a ponta do pino é que marca o lugar,
 * então o espaço de cima também tem que dar a altura do pino (50 px) para ele não ficar escondido.
 */
const ESPACO_NAS_BORDAS = { top: 190, bottom: 70, left: 50, right: 50 };
/**
 * Ao escolher um lugar com trajeto, o trajeto inteiro aparece entre as abas (em cima) e o cartão do
 * ponto (embaixo). O cartão ocupa mais ou menos 60% da altura do mapa no celular, então o espaço de
 * baixo acompanha a altura, sem nunca deixar menos de 80 px para o trajeto.
 */
const ESPACO_EM_CIMA_DO_TRAJETO = 170;
const ESPACO_MINIMO_EMBAIXO_DO_TRAJETO = 330;
const PARTE_DO_MAPA_EMBAIXO_DO_CARTAO = 0.6;

function espacoParaOTrajeto(alturaDoMapa: number) {
  const desejado = Math.max(ESPACO_MINIMO_EMBAIXO_DO_TRAJETO, alturaDoMapa * PARTE_DO_MAPA_EMBAIXO_DO_CARTAO);
  // Sem saber a altura do mapa (nos testes, por exemplo), fica o desejado.
  const cabe = alturaDoMapa > 0 ? alturaDoMapa - ESPACO_EM_CIMA_DO_TRAJETO - 80 : desejado;
  return { top: ESPACO_EM_CIMA_DO_TRAJETO, bottom: Math.max(0, Math.min(desejado, cabe)), left: 40, right: 40 };
}

/**
 * Onde ficam, no site, o estilo do mapa e o "worker" do MapLibre (o ajudante que desenha os
 * blocos do mapa sem travar a tela). O build copia os dois, e o próprio MapLibre, de
 * `node_modules` para `mapa/` (angular.json).
 */
const ESTILO_DO_MAPA = 'mapa/estilo-carnavou.json';
const WORKER_DO_MAPA = 'mapa/maplibre-gl-worker.mjs';

/** O círculo de precisão em volta da pessoa é uma "fonte" de dados com duas camadas no mapa. */
const FONTE_DA_PRECISAO = 'voce-precisao';
/**
 * Os trajetos também: uma borda branca, para a linha aparecer no lilás, a linha na cor da zona e
 * uma bolinha onde ela termina.
 */
const FONTE_DOS_TRAJETOS = 'trajetos';
/**
 * Os pontos são bolinhas desenhadas pelo próprio mapa, e não botões na tela: assim cabem centenas
 * sem pesar no celular. Só o ponto escolhido ganha o pino de verdade (um botão, com nome).
 */
const FONTE_DOS_PONTOS = 'pontos';
const CAMADA_DOS_PONTOS = 'pontos-bolinhas';
/** O número de blocos, dentro da bolinha do ponto que junta dois ou mais. */
const CAMADA_DOS_NUMEROS = 'pontos-numeros';
/** As letras guardadas no site (a mesma do estilo do mapa, em `public/mapa/letras`). */
const LETRA_DO_MAPA = 'noto-sans';
/** Quanto em volta do dedo conta como tocar num ponto, em pixels. */
const RAIO_DO_TOQUE = 14;
/** O mais perto que o mapa chega. */
const ZOOM_MAXIMO = 18;
/**
 * Pontos a menos disto, em pixels na tela, viram um grupo: é um pouco mais que o tamanho de duas
 * bolinhas lado a lado, para elas nunca se cobrirem.
 */
const RAIO_DO_GRUPO = 28;
/** No mapa, um grupo de pontos tem o `point_count` (quantos pontos ele junta). */
const E_GRUPO: ExpressionSpecification = ['has', 'point_count'];
const ZOOM_AO_ACHAR_A_PESSOA = 15;

interface Pino {
  id: string;
  marcador: Marker;
}

/**
 * O mapa. É a única parte do app que conhece o MapLibre: o resto só entrega uma lista de pontos
 * e escuta qual foi escolhido. Para trocar de biblioteca de mapa, é só mexer neste arquivo.
 */
@Component({
  selector: 'app-mapa-base',
  imports: [RouterLink],
  template: `
    <div #mapa class="mapa" role="region" aria-label="Mapa dos blocos"></div>
    @if (erro() === 'sem-internet') {
      <p class="mapa-erro" role="alert">
        Sem internet, e o mapa ainda não está guardado neste celular. Ele fica guardado depois que você
        abre o mapa uma vez com internet. Enquanto isso, veja a lista em <a routerLink="/">Blocos</a>.
      </p>
    } @else if (erro() === 'falhou') {
      <p class="mapa-erro" role="alert">
        Não consegui abrir o mapa neste celular. Veja a lista em <a routerLink="/">Blocos</a>.
      </p>
    }
  `,
  styleUrl: './mapa-base.scss',
  // Os pinos e os controles do MapLibre nascem fora do Angular, então o estilo precisa ser global.
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapaBase {
  readonly pontos = input.required<PontoNoMapa[]>();
  readonly selecionado = input<string | null>(null);
  /** Onde a pessoa está, quando ela pediu. Aparece como uma bolinha com um círculo de precisão. */
  readonly voce = input<PosicaoNoMapa | null>(null);
  /** Os trajetos, como linhas. Os do ponto selecionado ficam mais grossos. */
  readonly trajetos = input<TrajetoNoMapa[]>([]);
  readonly escolher = output<string>();
  /** A pessoa tocou no mapa, fora de qualquer pino. */
  readonly fundoTocado = output<void>();

  /** Por que o mapa não abriu: sem internet (e sem o MapLibre guardado) ou outro problema. */
  protected readonly erro = signal<'nenhum' | 'sem-internet' | 'falhou'>('nenhum');

  private readonly area = viewChild.required<ElementRef<HTMLElement>>('mapa');
  private readonly carregar = inject(CARREGAR_MAPLIBRE);
  private readonly pronto = signal(false);
  /** O estilo do mapa só aceita camadas novas (o círculo de precisão) depois de carregar. */
  private readonly estiloPronto = signal(false);

  private biblioteca?: BibliotecaDeMapa;
  private bolinhaDaPessoa?: Marker;
  private mapa?: MapaDoMapLibre;
  private destruido = false;
  /** O pino do ponto escolhido. Os outros pontos são bolinhas da camada do mapa. */
  private pino?: Pino;
  private pontosEnquadrados = '';
  private ultimoSelecionado: string | null = null;

  constructor() {
    afterNextRender(() => void this.iniciar());
    effect(() => {
      const pontos = this.pontos();
      const selecionado = this.selecionado();
      if (this.pronto()) {
        this.atualizar(pontos, selecionado);
      }
    });
    effect(() => {
      const pontos = this.pontos();
      const selecionado = this.selecionado();
      if (this.pronto() && this.estiloPronto()) {
        this.desenharOsPontos(pontos, selecionado);
      }
    });
    effect(() => {
      const voce = this.voce();
      const estiloPronto = this.estiloPronto();
      if (this.pronto()) {
        this.atualizarAPessoa(voce, estiloPronto);
      }
    });
    effect(() => {
      const trajetos = this.trajetos();
      const selecionado = this.selecionado();
      if (this.pronto() && this.estiloPronto()) {
        this.desenharOsTrajetos(trajetos, selecionado);
      }
    });
    inject(DestroyRef).onDestroy(() => this.destruir());
  }

  private async iniciar(): Promise<void> {
    try {
      const biblioteca = await this.carregar();
      if (this.destruido) {
        return;
      }
      this.biblioteca = biblioteca;
      biblioteca.setWorkerUrl(enderecoNoSite(WORKER_DO_MAPA));
      biblioteca.addProtocol(PROTOCOLO_DOS_PEDACOS, baixarPedaco);
      this.mapa = new biblioteca.Map({
        container: this.area().nativeElement,
        style: enderecoNoSite(ESTILO_DO_MAPA),
        center: CENTRO_DE_SAO_PAULO,
        zoom: 11,
        minZoom: 9,
        maxZoom: ZOOM_MAXIMO,
        maxBounds: LIMITES_DA_GRANDE_SP,
        // O mapa fica sempre com o norte para cima: sem girar e sem inclinar.
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        attributionControl: { compact: true },
      });
      this.mapa.touchZoomRotate.disableRotation();
      this.mapa.on('click', (evento) => this.tocou(evento.point));
      this.mapa.on('load', () => this.estiloPronto.set(true));
      this.pronto.set(true);
    } catch (erro) {
      console.warn('Não consegui abrir o mapa.', erro);
      this.erro.set(navigator.onLine === false ? 'sem-internet' : 'falhou');
    }
  }

  private atualizar(pontos: PontoNoMapa[], selecionado: string | null): void {
    const mapa = this.mapa;
    const biblioteca = this.biblioteca;
    if (!mapa || !biblioteca || this.destruido) {
      return;
    }

    // Só o ponto escolhido ganha o pino (um botão, com o nome para o leitor de tela).
    const escolhido = pontos.find((ponto) => ponto.id === selecionado);
    if (this.pino && this.pino.id !== escolhido?.id) {
      this.pino.marcador.remove();
      this.pino = undefined;
    }
    if (escolhido && !this.pino) {
      const elemento = criarPino(escolhido, (id) => this.escolher.emit(id));
      const marcador = new biblioteca.Marker({ element: elemento, anchor: 'bottom' })
        .setLngLat([escolhido.lng, escolhido.lat])
        .addTo(mapa);
      this.pino = { id: escolhido.id, marcador };
    }

    const chave = pontos.map((ponto) => ponto.id).join('|');
    if (chave !== this.pontosEnquadrados) {
      const primeiraVez = this.pontosEnquadrados === '';
      this.pontosEnquadrados = chave;
      this.enquadrar(pontos, primeiraVez ? 0 : 500);
    }

    if (selecionado !== this.ultimoSelecionado) {
      this.ultimoSelecionado = selecionado;
      const ponto = escolhido;
      const trajetos = untracked(() => this.trajetos()).filter((candidato) => candidato.id === selecionado);
      if (ponto && trajetos.length > 0) {
        // Chega perto o bastante para ver o trajeto inteiro, com o pino, acima do cartão.
        const limites = new biblioteca.LngLatBounds();
        limites.extend([ponto.lng, ponto.lat]);
        for (const passo of trajetos.flatMap((trajeto) => trajeto.linha)) {
          limites.extend(passo);
        }
        const padding = espacoParaOTrajeto(this.area().nativeElement.clientHeight);
        mapa.fitBounds(limites, { padding, maxZoom: 16, duration: 500 });
      } else if (ponto) {
        // Puxa o ponto um pouco para cima, para o cartão de baixo não cobrir o pino.
        mapa.easeTo({ center: [ponto.lng, ponto.lat], offset: [0, -70], duration: 400 });
      }
    }
  }

  /** A pessoa tocou no mapa: num ponto (escolhe o ponto) ou fora (o resto da tela decide). */
  private tocou(onde: { x: number; y: number }): void {
    const mapa = this.mapa;
    if (!mapa || this.destruido) {
      return;
    }
    const tocados = mapa.getLayer(CAMADA_DOS_PONTOS)
      ? mapa.queryRenderedFeatures(
          [
            [onde.x - RAIO_DO_TOQUE, onde.y - RAIO_DO_TOQUE],
            [onde.x + RAIO_DO_TOQUE, onde.y + RAIO_DO_TOQUE],
          ],
          { layers: [CAMADA_DOS_PONTOS] },
        )
      : [];
    const [tocado] = tocados;
    const grupo = tocado?.properties?.['cluster_id'];
    if (typeof grupo === 'number' && tocado.geometry.type === 'Point') {
      void this.abrirOGrupo(grupo, tocado.geometry.coordinates as [number, number]);
      return;
    }
    const id = tocado?.properties?.['id'];
    if (typeof id === 'string') {
      this.escolher.emit(id);
    } else {
      this.fundoTocado.emit();
    }
  }

  /** Tocar num grupo aproxima o mapa, em volta dele, até os pontos se separarem. */
  private async abrirOGrupo(grupo: number, centro: [number, number]): Promise<void> {
    const fonte = this.mapa?.getSource(FONTE_DOS_PONTOS) as GeoJSONSource | undefined;
    if (!fonte) {
      return;
    }
    try {
      const zoom = await fonte.getClusterExpansionZoom(grupo);
      if (this.mapa && !this.destruido) {
        this.mapa.easeTo({ center: centro, zoom: Math.min(zoom, ZOOM_MAXIMO), duration: 500 });
      }
    } catch {
      // Os pontos mudaram (outra aba) entre o toque e a resposta, e o grupo não existe mais.
    }
  }

  private desenharOsPontos(pontos: PontoNoMapa[], selecionado: string | null): void {
    const mapa = this.mapa;
    if (!mapa || this.destruido) {
      return;
    }
    const dados = bolinhasDosPontos(pontos, selecionado);
    const fonte = mapa.getSource(FONTE_DOS_PONTOS) as GeoJSONSource | undefined;
    if (fonte) {
      fonte.setData(dados);
      return;
    }
    // Os pontos que ficariam um em cima do outro viram um grupo, que se separa quando o mapa chega
    // perto. O número do grupo é a soma dos blocos (ou bares) dos pontos dele. No zoom máximo, nenhum
    // ponto fica em grupo.
    mapa.addSource(FONTE_DOS_PONTOS, {
      type: 'geojson',
      data: dados,
      cluster: true,
      clusterRadius: RAIO_DO_GRUPO,
      clusterMaxZoom: ZOOM_MAXIMO - 1,
      clusterProperties: { quantos: ['+', ['get', 'quantos']] },
    });
    // O grupo é uma bolinha branca, com a borda e o número na cor da noite: não se confunde com a cor
    // de nenhuma zona, e um grupo pode juntar pontos de duas zonas.
    const branco = corDoTema('--cartao', '#fff');
    const noite = corDoTema('--noite', '#130a29');
    const temNumero: ExpressionSpecification = ['!=', ['get', 'numero'], ''];
    // As bolinhas ficam por cima das linhas dos trajetos (a bolinha do fim de um trajeto não cobre
    // outro ponto) e embaixo do círculo da pessoa, se ele já estiver no mapa.
    const embaixoDe = mapa.getLayer(`${FONTE_DA_PRECISAO}-area`) ? `${FONTE_DA_PRECISAO}-area` : undefined;
    mapa.addLayer(
      {
        id: CAMADA_DOS_PONTOS,
        type: 'circle',
        source: FONTE_DOS_PONTOS,
        paint: {
          'circle-color': ['case', E_GRUPO, branco, ['get', 'cor']],
          // De longe ficam pequenas, para a cidade toda caber sem virar uma mancha. A que tem número
          // fica maior, para ele caber dentro, e a do grupo, maior ainda.
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10,
            ['case', E_GRUPO, 11, temNumero, 8, 4],
            14,
            ['case', E_GRUPO, 14, temNumero, 11, 8],
            17,
            ['case', E_GRUPO, 16, temNumero, 13, 11],
          ],
          'circle-stroke-color': ['case', E_GRUPO, noite, ['get', 'borda']],
          'circle-stroke-width': ['case', E_GRUPO, 3, ['==', ['get', 'after'], true], 3, 2],
        },
      },
      embaixoDe,
    );
    // O número fica sempre à vista, mesmo quando as bolinhas se encostam.
    mapa.addLayer(
      {
        id: CAMADA_DOS_NUMEROS,
        type: 'symbol',
        source: FONTE_DOS_PONTOS,
        filter: ['any', E_GRUPO, temNumero],
        layout: {
          'text-field': ['case', E_GRUPO, ['to-string', ['get', 'quantos']], ['get', 'numero']],
          'text-font': [LETRA_DO_MAPA],
          'text-size': ['interpolate', ['linear'], ['zoom'], 10, 10, 14, 12, 17, 13],
          'text-allow-overlap': true,
          'text-ignore-placement': true,
        },
        paint: { 'text-color': ['case', E_GRUPO, noite, ['get', 'corDoNumero']] },
      },
      embaixoDe,
    );
  }

  /** Leva o mapa até a pessoa, chegando mais perto se ele estiver afastado. */
  irPara(lat: number, lng: number): void {
    const mapa = this.mapa;
    if (!mapa || this.destruido) {
      return;
    }
    mapa.easeTo({ center: [lng, lat], zoom: Math.max(mapa.getZoom(), ZOOM_AO_ACHAR_A_PESSOA), duration: 600 });
  }

  private atualizarAPessoa(voce: PosicaoNoMapa | null, estiloPronto: boolean): void {
    const mapa = this.mapa;
    const biblioteca = this.biblioteca;
    if (!mapa || !biblioteca || this.destruido) {
      return;
    }

    if (!voce) {
      this.bolinhaDaPessoa?.remove();
      this.bolinhaDaPessoa = undefined;
    } else if (this.bolinhaDaPessoa) {
      this.bolinhaDaPessoa.setLngLat([voce.lng, voce.lat]);
    } else {
      this.bolinhaDaPessoa = new biblioteca.Marker({ element: criarBolinhaDaPessoa(), anchor: 'center' })
        .setLngLat([voce.lng, voce.lat])
        .addTo(mapa);
    }

    if (estiloPronto) {
      this.desenharAPrecisao(voce);
    }
  }

  private desenharAPrecisao(voce: PosicaoNoMapa | null): void {
    const mapa = this.mapa;
    if (!mapa) {
      return;
    }
    const dados = areaDaPrecisao(voce);
    const fonte = mapa.getSource(FONTE_DA_PRECISAO) as GeoJSONSource | undefined;
    if (fonte) {
      fonte.setData(dados);
      return;
    }
    if (!voce) {
      return;
    }
    const cor = corDoTema('--rosa', '#e21d89');
    mapa.addSource(FONTE_DA_PRECISAO, { type: 'geojson', data: dados });
    mapa.addLayer({
      id: `${FONTE_DA_PRECISAO}-area`,
      type: 'fill',
      source: FONTE_DA_PRECISAO,
      paint: { 'fill-color': cor, 'fill-opacity': 0.15 },
    });
    mapa.addLayer({
      id: `${FONTE_DA_PRECISAO}-borda`,
      type: 'line',
      source: FONTE_DA_PRECISAO,
      paint: { 'line-color': cor, 'line-opacity': 0.5, 'line-width': 1 },
    });
  }

  private desenharOsTrajetos(trajetos: TrajetoNoMapa[], selecionado: string | null): void {
    const mapa = this.mapa;
    if (!mapa || this.destruido) {
      return;
    }
    const dados = linhasDosTrajetos(trajetos, selecionado);
    const fonte = mapa.getSource(FONTE_DOS_TRAJETOS) as GeoJSONSource | undefined;
    if (fonte) {
      fonte.setData(dados);
      return;
    }
    if (trajetos.length === 0) {
      return;
    }
    mapa.addSource(FONTE_DOS_TRAJETOS, { type: 'geojson', data: dados });
    // Os trajetos ficam embaixo das bolinhas dos pontos e do círculo de precisão da pessoa, se eles já
    // estiverem no mapa.
    const embaixoDe = [CAMADA_DOS_PONTOS, `${FONTE_DA_PRECISAO}-area`].find((id) => mapa.getLayer(id));
    const soLinhas: FilterSpecification = ['==', ['geometry-type'], 'LineString'];
    const borda: AddLayerObject = {
      id: `${FONTE_DOS_TRAJETOS}-borda`,
      type: 'line',
      source: FONTE_DOS_TRAJETOS,
      filter: soLinhas,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': corDoTema('--cartao', '#fff'),
        'line-width': ['case', ['get', 'selecionado'], 12, 8],
        'line-opacity': 0.9,
      },
    };
    const linha: AddLayerObject = {
      id: `${FONTE_DOS_TRAJETOS}-linha`,
      type: 'line',
      source: FONTE_DOS_TRAJETOS,
      filter: soLinhas,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': ['get', 'cor'], 'line-width': ['case', ['get', 'selecionado'], 7, 4] },
    };
    // O fim: uma bolinha branca com a borda na cor da linha (o começo é o pino).
    const fim: AddLayerObject = {
      id: `${FONTE_DOS_TRAJETOS}-fim`,
      type: 'circle',
      source: FONTE_DOS_TRAJETOS,
      filter: ['==', ['geometry-type'], 'Point'],
      paint: {
        'circle-color': corDoTema('--cartao', '#fff'),
        'circle-radius': 6,
        'circle-stroke-color': ['get', 'cor'],
        'circle-stroke-width': 4,
      },
    };
    mapa.addLayer(borda, embaixoDe);
    mapa.addLayer(linha, embaixoDe);
    mapa.addLayer(fim, embaixoDe);
  }

  /** Mostra todos os pontos de uma vez. Com um só, chega perto dele. */
  private enquadrar(pontos: PontoNoMapa[], duracao: number): void {
    const mapa = this.mapa;
    const biblioteca = this.biblioteca;
    if (!mapa || !biblioteca || pontos.length === 0) {
      return;
    }
    if (pontos.length === 1) {
      mapa.easeTo({ center: [pontos[0].lng, pontos[0].lat], zoom: 14, duration: duracao });
      return;
    }
    const limites = new biblioteca.LngLatBounds();
    for (const ponto of pontos) {
      limites.extend([ponto.lng, ponto.lat]);
    }
    mapa.fitBounds(limites, { padding: ESPACO_NAS_BORDAS, maxZoom: 14, duration: duracao });
  }

  private destruir(): void {
    this.destruido = true;
    this.pino?.marcador.remove();
    this.pino = undefined;
    this.bolinhaDaPessoa?.remove();
    this.bolinhaDaPessoa = undefined;
    this.mapa?.remove();
    this.mapa = undefined;
  }
}
