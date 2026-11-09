import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';

import { Trilha, eAbaDoMenu, soOCaminho } from '../voltar/trilha';

/** Abrir um lugar ou um bloco por um link compartilhado cai na árvore do Descobrir. */
const ABA_DE_QUEM_VEIO_DE_FORA = '/descobrir';

@Component({
  selector: 'app-menu-inferior',
  imports: [RouterLink],
  templateUrl: './menu-inferior.html',
  styleUrl: './menu-inferior.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuInferior {
  private readonly router = inject(Router);
  private readonly trilha = inject(Trilha);

  private readonly endereco = toSignal(
    this.router.events.pipe(
      filter((evento): evento is NavigationEnd => evento instanceof NavigationEnd),
      map((evento) => evento.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  /**
   * A aba marcada: dentro de um lugar, de um bloco ou das páginas Sobre, Privacidade e Termos,
   * continua sendo a aba de onde a pessoa saiu. Quem chega por um link num lugar ou num bloco vê o
   * Descobrir marcado; nas outras páginas, nenhuma.
   */
  private readonly abaAtual = computed(() => {
    const caminho = soOCaminho(this.endereco());
    if (eAbaDoMenu(caminho)) {
      return caminho;
    }
    return this.trilha.ultimaAba() ?? (caminho.startsWith('/local') ? ABA_DE_QUEM_VEIO_DE_FORA : '');
  });

  protected ativo(aba: string): boolean {
    return this.abaAtual() === aba;
  }
}
