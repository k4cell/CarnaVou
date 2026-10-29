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
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import type { GeoJSONSource, Map as MapaDoMapLibre, Marker } from 'maplibre-gl';

import { Zona } from '../dados/tipos';
import { contornoDoCirculo } from './circulo';
import { LIMITES_DA_GRANDE_SP } from './limites';
import { BibliotecaDeMapa, CARREGAR_MAPLIBRE, enderecoNoSite } from './maplibre';

/** Um ponto do mapa: é só o que o mapa precisa saber, nada do resto do app. */
export interface PontoNoMapa {
  id: string;
  nome: string;
  lat: number;
  lng: number;
  zona: Zona;
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
 * Onde ficam, no site, o estilo do mapa e o "worker" do MapLibre (o ajudante que desenha os
 * blocos do mapa sem travar a tela). O build copia os dois, e o próprio MapLibre, de
 * `node_modules` para `mapa/` (angular.json).
 */
const ESTILO_DO_MAPA = 'mapa/estilo-carnavou.json';
const WORKER_DO_MAPA = 'mapa/maplibre-gl-worker.mjs';

/** O círculo de precisão em volta da pessoa é uma "fonte" de dados com duas camadas no mapa. */
const FONTE_DA_PRECISAO = 'voce-precisao';
const ZOOM_AO_ACHAR_A_PESSOA = 15;

type DadosGeoJson = Parameters<GeoJSONSource['setData']>[0];

/** A cor vem das variáveis do app (`styles.scss`), para o mapa e o resto do site combinarem. */
function corDoTema(variavel: string, padrao: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(variavel).trim() || padrao;
}

function areaDaPrecisao(voce: PosicaoNoMapa | null): DadosGeoJson {
  if (!voce) {
    return { type: 'FeatureCollection', features: [] };
  }
  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Polygon', coordinates: [contornoDoCirculo(voce.lat, voce.lng, voce.precisao)] },
  };
}

function criarBolinhaDaPessoa(): HTMLDivElement {
  const bolinha = document.createElement('div');
  bolinha.className = 'voce';
  bolinha.setAttribute('role', 'img');
  bolinha.setAttribute('aria-label', 'Você está aqui');
  return bolinha;
}

const PINO_SVG =
  '<svg viewBox="0 0 32 44" aria-hidden="true" focusable="false">' +
  '<path d="M16 1C8 1 2 7.2 2 15c0 10.5 14 28 14 28s14-17.5 14-28C30 7.2 24 1 16 1z"/>' +
  '<circle cx="16" cy="15" r="5.5"/></svg>';

function criarPino(ponto: PontoNoMapa, aoEscolher: (id: string) => void): HTMLButtonElement {
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = `pino pino-${ponto.zona}`;
  botao.setAttribute('aria-label', ponto.nome);
  botao.innerHTML = PINO_SVG;
  botao.addEventListener('click', (evento) => {
    evento.stopPropagation();
    aoEscolher(ponto.id);
  });
  return botao;
}

interface Pino {
  marcador: Marker;
  elemento: HTMLButtonElement;
}

/**
 * O mapa. É a única parte do app que conhece o MapLibre: o resto só entrega uma lista de pontos
 * e escuta qual foi escolhido. Para trocar de biblioteca de mapa, é só mexer neste arquivo.
 */
@Component({
  selector: 'app-mapa-base',
  imports: [RouterLink],
  template: `
    <div #mapa class="mapa" role="region" aria-label="Mapa dos lugares"></div>
    @if (erro()) {
      <p class="mapa-erro" role="alert">
        Não consegui abrir o mapa neste celular. Veja a lista em <a routerLink="/">Descobrir</a>.
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
  readonly escolher = output<string>();
  /** A pessoa tocou no mapa, fora de qualquer pino. */
  readonly fundoTocado = output<void>();

  protected readonly erro = signal(false);

  private readonly area = viewChild.required<ElementRef<HTMLElement>>('mapa');
  private readonly carregar = inject(CARREGAR_MAPLIBRE);
  private readonly pronto = signal(false);
  /** O estilo do mapa só aceita camadas novas (o círculo de precisão) depois de carregar. */
  private readonly estiloPronto = signal(false);

  private biblioteca?: BibliotecaDeMapa;
  private bolinhaDaPessoa?: Marker;
  private mapa?: MapaDoMapLibre;
  private destruido = false;
  private readonly pinos = new Map<string, Pino>();
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
      const voce = this.voce();
      const estiloPronto = this.estiloPronto();
      if (this.pronto()) {
        this.atualizarAPessoa(voce, estiloPronto);
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
      this.mapa = new biblioteca.Map({
        container: this.area().nativeElement,
        style: enderecoNoSite(ESTILO_DO_MAPA),
        center: CENTRO_DE_SAO_PAULO,
        zoom: 11,
        minZoom: 9,
        maxZoom: 18,
        maxBounds: LIMITES_DA_GRANDE_SP,
        // O mapa fica sempre com o norte para cima: sem girar e sem inclinar.
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        attributionControl: { compact: true },
      });
      this.mapa.touchZoomRotate.disableRotation();
      this.mapa.on('click', () => this.fundoTocado.emit());
      this.mapa.on('load', () => this.estiloPronto.set(true));
      this.pronto.set(true);
    } catch (erro) {
      console.warn('Não consegui abrir o mapa.', erro);
      this.erro.set(true);
    }
  }

  private atualizar(pontos: PontoNoMapa[], selecionado: string | null): void {
    const mapa = this.mapa;
    const biblioteca = this.biblioteca;
    if (!mapa || !biblioteca || this.destruido) {
      return;
    }

    const ids = new Set(pontos.map((ponto) => ponto.id));
    for (const [id, pino] of this.pinos) {
      if (!ids.has(id)) {
        pino.marcador.remove();
        this.pinos.delete(id);
      }
    }

    for (const ponto of pontos) {
      let pino = this.pinos.get(ponto.id);
      if (!pino) {
        const elemento = criarPino(ponto, (id) => this.escolher.emit(id));
        const marcador = new biblioteca.Marker({ element: elemento, anchor: 'bottom' })
          .setLngLat([ponto.lng, ponto.lat])
          .addTo(mapa);
        pino = { marcador, elemento };
        this.pinos.set(ponto.id, pino);
      }
      const ativo = ponto.id === selecionado;
      pino.elemento.classList.toggle('selecionado', ativo);
      pino.elemento.setAttribute('aria-pressed', String(ativo));
      pino.elemento.style.zIndex = ativo ? '2' : '';
    }

    const chave = pontos.map((ponto) => ponto.id).join('|');
    if (chave !== this.pontosEnquadrados) {
      const primeiraVez = this.pontosEnquadrados === '';
      this.pontosEnquadrados = chave;
      this.enquadrar(pontos, primeiraVez ? 0 : 500);
    }

    if (selecionado !== this.ultimoSelecionado) {
      this.ultimoSelecionado = selecionado;
      const ponto = pontos.find((candidato) => candidato.id === selecionado);
      if (ponto) {
        // Puxa o ponto um pouco para cima, para o cartão de baixo não cobrir o pino.
        mapa.easeTo({ center: [ponto.lng, ponto.lat], offset: [0, -70], duration: 400 });
      }
    }
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
    for (const pino of this.pinos.values()) {
      pino.marcador.remove();
    }
    this.pinos.clear();
    this.bolinhaDaPessoa?.remove();
    this.bolinhaDaPessoa = undefined;
    this.mapa?.remove();
    this.mapa = undefined;
  }
}
