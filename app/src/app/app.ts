import { Location } from '@angular/common';
import { Component, afterNextRender, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';

import { Atualizacao } from './atualizacao/atualizacao';
import { AvisoDeAtualizacao } from './atualizacao/aviso-de-atualizacao';
import { AvisoDePronto, ProntoSemInternet } from './atualizacao/aviso-de-pronto';
import { AvisoDeTeste } from './aviso-de-teste/aviso-de-teste';
import { Conexao } from './conexao/conexao';
import { Favoritos } from './favoritos/favoritos';
import { MenuInferior } from './menu/menu-inferior';
import { AvisoDeNavegacao } from './navegacao/aviso-de-navegacao';
import { Relogio } from './relogio/relogio';
import { CaminhoDeVolta, caminhoDeVolta } from './voltar/caminho-de-volta';
import { Trilha } from './voltar/trilha';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, MenuInferior, AvisoDeTeste, AvisoDeAtualizacao, AvisoDeNavegacao, AvisoDePronto],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly conexao = inject(Conexao);
  private readonly router = inject(Router);
  private readonly enderecos = inject(Location);
  private readonly trilha = inject(Trilha);

  private readonly endereco = toSignal(
    this.router.events.pipe(
      filter((evento) => evento instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  /** A seta do canto do cabeçalho: para a tela de onde a pessoa veio ou, sem ela, um nível acima. */
  protected readonly voltar = computed(() => caminhoDeVolta(this.endereco(), this.trilha.anterior()));

  protected enderecoDe(volta: CaminhoDeVolta): string {
    return this.enderecos.prepareExternalUrl(volta.url);
  }

  /**
   * Volta no histórico do navegador, que devolve a lista no ponto em que ela estava. Subir pela
   * árvore troca a tela atual, para o botão de voltar do celular não cair nela de novo.
   */
  protected aoVoltar(evento: Event, volta: CaminhoDeVolta): void {
    evento.preventDefault();
    if (volta.peloHistorico) {
      this.enderecos.back();
    } else {
      void this.router.navigateByUrl(volta.url, { replaceUrl: true });
    }
  }

  constructor() {
    const relogio = inject(Relogio);
    const atualizacao = inject(Atualizacao);
    const favoritos = inject(Favoritos);
    const pronto = inject(ProntoSemInternet);
    // Só no navegador, depois da primeira pintura: assim a página pronta que vem do servidor
    // (que não sabe o dia de hoje nem se há internet) e a primeira pintura do navegador saem iguais.
    afterNextRender(() => {
      relogio.iniciar(window.location.search);
      this.conexao.iniciar();
      atualizacao.iniciar();
      favoritos.iniciar();
      pronto.iniciar();
    });
  }
}
