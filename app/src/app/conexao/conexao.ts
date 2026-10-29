import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

/**
 * Se o celular está com internet. O site continua funcionando sem ela, com o que já foi baixado,
 * e a tela avisa a pessoa. Começa como "com internet" e só olha o celular depois da primeira
 * pintura (`iniciar`), para a página pronta que vem do servidor e a primeira pintura saírem iguais.
 */
@Injectable({ providedIn: 'root' })
export class Conexao {
  private readonly janela = inject(DOCUMENT).defaultView;

  readonly online = signal(true);

  iniciar(): void {
    const janela = this.janela;
    if (!janela) {
      return;
    }
    this.online.set(janela.navigator.onLine);
    janela.addEventListener('online', () => this.online.set(true));
    janela.addEventListener('offline', () => this.online.set(false));
  }
}
