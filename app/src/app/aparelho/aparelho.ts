import { DOCUMENT } from '@angular/common';
import { InjectionToken, inject } from '@angular/core';

/** O que importa saber do aparelho. Nos testes, é trocado por um falso. */
export interface Aparelho {
  /** O app já está instalado e foi aberto pelo ícone? */
  instalado: boolean;
  /**
   * iPhone ou iPad: lá o navegador não tem botão de instalar (só o "Adicionar à Tela de Início"), e a
   * localização se libera por caminhos próprios.
   */
  ehIphone: boolean;
}

export const APARELHO = new InjectionToken<Aparelho>('APARELHO', {
  providedIn: 'root',
  factory: () => {
    const janela = inject(DOCUMENT).defaultView;
    const navegador = janela?.navigator as (Navigator & { standalone?: boolean }) | undefined;
    const agente = navegador?.userAgent ?? '';
    return {
      instalado: !!janela?.matchMedia?.('(display-mode: standalone)').matches || navegador?.standalone === true,
      // O iPad novo diz que é um Mac; o toque entrega.
      ehIphone: /iphone|ipad|ipod/i.test(agente) || (/macintosh/i.test(agente) && (navegador?.maxTouchPoints ?? 0) > 1),
    };
  },
});
