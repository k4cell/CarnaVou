import { Injectable, InjectionToken, inject, signal } from '@angular/core';

/** Onde a pessoa está, do jeito que o celular informou. */
export interface Posicao {
  lat: number;
  lng: number;
  /** O erro provável da posição, em metros. */
  precisao: number;
}

/**
 * - `desligada`: a pessoa ainda não pediu.
 * - `procurando`: esperando o celular responder.
 * - `ligada`: temos uma posição.
 * - `negada`: o celular não deixou (a pessoa disse não, ou já tinha dito antes).
 * - `sem-sinal`: o celular deixou, mas não achou a posição agora.
 * - `indisponivel`: este navegador não sabe dizer onde a pessoa está.
 */
export type EstadoDaLocalizacao = 'desligada' | 'procurando' | 'ligada' | 'negada' | 'sem-sinal' | 'indisponivel';

/** O que fazer quando a pessoa toca em "onde estou". */
export type PassoDaLocalizacao = 'explicar' | 'procurar' | 'negada' | 'indisponivel';

export type PermissaoDoCelular = 'granted' | 'denied' | 'prompt';

type Geolocalizacao = Pick<Geolocation, 'getCurrentPosition'>;

const PERMISSAO_NEGADA = 1;

/** A localização do navegador. Fica nulo onde ela não existe (no servidor que gera as páginas, por exemplo). */
export const GEOLOCALIZACAO = new InjectionToken<Geolocalizacao | null>('GEOLOCALIZACAO', {
  providedIn: 'root',
  factory: () => (typeof navigator !== 'undefined' && navigator.geolocation) || null,
});

/**
 * Pergunta ao navegador se a pessoa já deixou, sem abrir o aviso do celular. Devolve `null`
 * quando o navegador não sabe responder.
 */
export const CONSULTAR_PERMISSAO = new InjectionToken<() => Promise<PermissaoDoCelular | null>>(
  'CONSULTAR_PERMISSAO',
  {
    providedIn: 'root',
    factory: () => async () => {
      try {
        const permissao = await navigator.permissions.query({ name: 'geolocation' });
        return permissao.state;
      } catch {
        return null;
      }
    },
  },
);

/**
 * Onde a pessoa está. Só procura quando ela toca em "onde estou" (uma leitura por toque): nada
 * de acompanhar o caminho nem de segundo plano, por causa da bateria e da privacidade. A posição
 * fica só na memória, enquanto o site está aberto: não é guardada nem enviada para lugar nenhum.
 */
@Injectable({ providedIn: 'root' })
export class Localizacao {
  private readonly api = inject(GEOLOCALIZACAO);
  private readonly consultarPermissao = inject(CONSULTAR_PERMISSAO);

  readonly estado = signal<EstadoDaLocalizacao>('desligada');
  readonly posicao = signal<Posicao | null>(null);

  /**
   * Decide o que fazer ao tocar em "onde estou": explicar para que serve (quando o celular
   * ainda vai perguntar), ir direto procurar (quando a pessoa já deixou) ou avisar.
   */
  async proximoPasso(): Promise<PassoDaLocalizacao> {
    if (!this.api) {
      this.estado.set('indisponivel');
      return 'indisponivel';
    }
    if (this.estado() === 'ligada') {
      return 'procurar';
    }
    const permissao = await this.consultarPermissao();
    if (permissao === 'denied') {
      this.estado.set('negada');
      return 'negada';
    }
    // O aviso de uma tentativa anterior (um "não" que a pessoa já desfez, ou um "sem sinal") não vale mais.
    this.estado.set('desligada');
    return permissao === 'granted' ? 'procurar' : 'explicar';
  }

  /** Pede a posição ao celular, uma vez. É aqui que o aviso do celular aparece, na primeira vez. */
  procurar(): Promise<void> {
    const api = this.api;
    if (!api) {
      this.estado.set('indisponivel');
      return Promise.resolve();
    }
    if (this.estado() === 'procurando') {
      return Promise.resolve();
    }
    this.estado.set('procurando');
    return new Promise((resolver) => {
      api.getCurrentPosition(
        ({ coords }) => {
          this.posicao.set({ lat: coords.latitude, lng: coords.longitude, precisao: coords.accuracy });
          this.estado.set('ligada');
          resolver();
        },
        (erro) => {
          this.estado.set(erro.code === PERMISSAO_NEGADA ? 'negada' : 'sem-sinal');
          resolver();
        },
        { enableHighAccuracy: true, timeout: 15_000, maximumAge: 10_000 },
      );
    });
  }
}
