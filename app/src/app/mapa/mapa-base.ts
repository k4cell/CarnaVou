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
import type { Map as MapaDoMapLibre, Marker } from 'maplibre-gl';

import { Zona } from '../dados/tipos';
import { BibliotecaDeMapa, CARREGAR_MAPLIBRE } from './maplibre';

/** Um ponto do mapa: é só o que o mapa precisa saber, nada do resto do app. */
export interface PontoNoMapa {
  id: string;
  nome: string;
  lat: number;
  lng: number;
  zona: Zona;
}

const CENTRO_DE_SAO_PAULO: [number, number] = [-46.655, -23.57];
const LIMITES_DA_GRANDE_SP: [[number, number], [number, number]] = [
  [-47.2, -23.95],
  [-46.2, -23.2],
];
/**
 * Espaço livre em volta dos pontos. Em cima ficam as abas e a ponta do pino é que marca o lugar,
 * então o espaço de cima também tem que dar a altura do pino (50 px) para ele não ficar escondido.
 */
const ESPACO_NAS_BORDAS = { top: 190, bottom: 70, left: 50, right: 50 };

/**
 * Onde ficam, no site, o estilo do mapa e o "worker" do MapLibre (o ajudante que desenha os
 * blocos do mapa sem travar a tela). O worker é copiado de `node_modules` no build (angular.json).
 */
const ESTILO_DO_MAPA = 'mapa/estilo-carnavou.json';
const WORKER_DO_MAPA = 'mapa/maplibre-gl-worker.mjs';

function enderecoNoSite(caminho: string): string {
  return new URL(caminho, document.baseURI).href;
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
  readonly escolher = output<string>();
  /** A pessoa tocou no mapa, fora de qualquer pino. */
  readonly fundoTocado = output<void>();

  protected readonly erro = signal(false);

  private readonly area = viewChild.required<ElementRef<HTMLElement>>('mapa');
  private readonly carregar = inject(CARREGAR_MAPLIBRE);
  private readonly pronto = signal(false);

  private biblioteca?: BibliotecaDeMapa;
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
    this.mapa?.remove();
    this.mapa = undefined;
  }
}
