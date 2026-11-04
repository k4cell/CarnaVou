import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

/** O endereço sem a data de teste e sem o resto do que vem depois do caminho. */
export const soOCaminho = (endereco: string): string => endereco.split(/[?#]/)[0];

/**
 * Por onde a pessoa passou desde que abriu o app, na mesma ordem do histórico do navegador. É o que
 * faz a seta voltar para a tela de onde ela veio e o menu continuar marcando a aba de onde ela saiu.
 * Quem chega por um link compartilhado tem só um endereço aqui, e a seta sobe pela árvore.
 */
@Injectable({ providedIn: 'root' })
export class Trilha {
  private readonly router = inject(Router);
  private readonly pilha = signal<string[]>([]);

  /** O endereço de onde a pessoa veio, se ela veio de alguma tela do app. */
  readonly anterior = computed<string | undefined>(() => this.pilha().at(-2));

  /** A última aba do menu por onde ela passou. Os lugares e os blocos não são abas. */
  readonly ultimaAba = computed<string | undefined>(() => {
    const aba = [...this.pilha()].reverse().find((endereco) => !soOCaminho(endereco).startsWith('/local'));
    return aba === undefined ? undefined : soOCaminho(aba);
  });

  constructor() {
    const eventos = this.router.events.subscribe((evento) => {
      if (evento instanceof NavigationEnd) {
        this.chegouEm(evento.urlAfterRedirects);
      }
    });
    inject(DestroyRef).onDestroy(() => eventos.unsubscribe());
  }

  private chegouEm(endereco: string): void {
    const navegacao = this.router.lastSuccessfulNavigation();
    this.pilha.update((pilha) => {
      // Voltar ou avançar no histórico: se o endereço já está na trilha, ela volta até ele.
      if (navegacao?.trigger === 'popstate') {
        const onde = pilha.lastIndexOf(endereco);
        return onde >= 0 ? pilha.slice(0, onde + 1) : [...pilha, endereco];
      }
      if (navegacao?.extras.replaceUrl) {
        return [...pilha.slice(0, -1), endereco];
      }
      return pilha.at(-1) === endereco ? pilha : [...pilha, endereco];
    });
  }
}
