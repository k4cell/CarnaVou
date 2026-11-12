import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, inject, signal } from '@angular/core';

import { APARELHO } from '../aparelho/aparelho';

/** Onde fica guardado quando a pessoa tocou em "Agora não" (a data, em milissegundos). */
const CHAVE = 'carnavou.instalar-depois';
/** Depois de "Agora não", o aviso só volta depois destes dias. */
const DIAS_SEM_AVISAR = 7;
/** O aviso aparece 10 segundos depois de o app carregar. */
const ESPERA = 10_000;

/** O jeito de instalar: o botão do próprio navegador (Android) ou o passo a passo do iPhone. */
export type JeitoDeInstalar = 'botao' | 'iphone';

/** O pedido de instalar que o Chrome do Android entrega ao site (o `beforeinstallprompt`). */
interface PedidoDeInstalar extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * O convite para instalar o app na tela de início. No Android, guarda o pedido do navegador e mostra
 * o botão "Instalar"; no iPhone, que não tem esse pedido, explica o caminho pelo Compartilhar. Não
 * aparece para quem já instalou nem, por uns dias, para quem tocou em "Agora não".
 */
@Injectable({ providedIn: 'root' })
export class Instalacao {
  private readonly janela = inject(DOCUMENT).defaultView;
  private readonly aparelho = inject(APARELHO);
  private readonly destruicao = inject(DestroyRef);
  private pedido: PedidoDeInstalar | null = null;
  private esperou = false;

  /** O aviso que está na tela agora (ou nulo). */
  readonly aviso = signal<JeitoDeInstalar | null>(null);

  /** Roda uma vez, no navegador, depois da primeira pintura. */
  iniciar(): void {
    const janela = this.janela;
    if (!janela || this.aparelho.instalado || this.adiado()) {
      return;
    }
    const aoReceberOPedido = (evento: Event) => {
      // Sem isto, o Chrome mostra a barra dele na hora; o app mostra o aviso dele, no momento certo.
      evento.preventDefault();
      this.pedido = evento as PedidoDeInstalar;
      this.mostrarSePuder();
    };
    // O pedido que chegou antes de o app carregar fica guardado pelo index.html.
    const guardada = janela as Window & { pedidoDeInstalar?: PedidoDeInstalar };
    if (guardada.pedidoDeInstalar) {
      this.pedido = guardada.pedidoDeInstalar;
      guardada.pedidoDeInstalar = undefined;
    }
    const aoInstalar = () => {
      this.pedido = null;
      this.aviso.set(null);
    };
    janela.addEventListener('beforeinstallprompt', aoReceberOPedido);
    janela.addEventListener('appinstalled', aoInstalar);
    const espera = setTimeout(() => {
      this.esperou = true;
      this.mostrarSePuder();
    }, ESPERA);
    this.destruicao.onDestroy(() => {
      clearTimeout(espera);
      janela.removeEventListener('beforeinstallprompt', aoReceberOPedido);
      janela.removeEventListener('appinstalled', aoInstalar);
    });
  }

  /** "Instalar": abre a pergunta do próprio navegador. */
  async instalar(): Promise<void> {
    const pedido = this.pedido;
    this.aviso.set(null);
    if (!pedido) {
      return;
    }
    this.pedido = null;
    await pedido.prompt();
    const { outcome } = await pedido.userChoice;
    if (outcome === 'dismissed') {
      this.lembrarDeEsperar();
    }
  }

  /** "Agora não" (ou "Entendi", no iPhone): o aviso some e só volta daqui a uns dias. */
  agoraNao(): void {
    this.aviso.set(null);
    this.lembrarDeEsperar();
  }

  private mostrarSePuder(): void {
    if (!this.esperou) {
      return;
    }
    if (this.pedido) {
      this.aviso.set('botao');
    } else if (this.aparelho.ehIphone) {
      this.aviso.set('iphone');
    }
  }

  private adiado(): boolean {
    try {
      const quando = Number(this.janela?.localStorage.getItem(CHAVE));
      return quando > 0 && Date.now() - quando < DIAS_SEM_AVISAR * 24 * 60 * 60 * 1000;
    } catch {
      return false;
    }
  }

  private lembrarDeEsperar(): void {
    try {
      this.janela?.localStorage.setItem(CHAVE, String(Date.now()));
    } catch {
      // Sem acesso ao que fica guardado, o aviso pode voltar na próxima vez. Não atrapalha.
    }
  }
}
