import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';

import { Trilha, soOCaminho } from '../voltar/trilha';

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

  /** A aba marcada: dentro de um lugar ou de um bloco, continua sendo a aba de onde a pessoa saiu. */
  private readonly abaAtual = computed(() => {
    const caminho = soOCaminho(this.endereco());
    return caminho.startsWith('/local') ? (this.trilha.ultimaAba() ?? ABA_DE_QUEM_VEIO_DE_FORA) : caminho;
  });

  protected ativo(aba: string): boolean {
    return this.abaAtual() === aba;
  }
}
