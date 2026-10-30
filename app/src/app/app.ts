import { Component, afterNextRender, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';

import { AvisoDeTeste } from './aviso-de-teste/aviso-de-teste';
import { Conexao } from './conexao/conexao';
import { MenuInferior } from './menu/menu-inferior';
import { Relogio } from './relogio/relogio';
import { caminhoDeVolta } from './voltar/caminho-de-volta';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, MenuInferior, AvisoDeTeste],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly conexao = inject(Conexao);
  private readonly router = inject(Router);

  private readonly endereco = toSignal(
    this.router.events.pipe(
      filter((evento) => evento instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  /** A seta do canto do cabeçalho: um nível acima (bloco → lugar → Em alta), quando tem. */
  protected readonly voltar = computed(() => caminhoDeVolta(this.endereco()));

  constructor() {
    const relogio = inject(Relogio);
    // Só no navegador, depois da primeira pintura: assim a página pronta que vem do servidor
    // (que não sabe o dia de hoje nem se há internet) e a primeira pintura do navegador saem iguais.
    afterNextRender(() => {
      relogio.iniciar(window.location.search);
      this.conexao.iniciar();
    });
  }
}
