import { Component, afterNextRender, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

import { AvisoDeTeste } from './aviso-de-teste/aviso-de-teste';
import { Conexao } from './conexao/conexao';
import { MenuInferior } from './menu/menu-inferior';
import { Relogio } from './relogio/relogio';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, MenuInferior, AvisoDeTeste],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly conexao = inject(Conexao);

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
