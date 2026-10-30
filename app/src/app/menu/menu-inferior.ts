import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';

/**
 * As abas que têm endereço próprio. Os lugares e os blocos (/local/…) são galhos do Descobrir. Tudo
 * que não for delas é a aba Blocos, a tela principal.
 */
const OUTRAS_ABAS = ['/descobrir', '/local', '/after', '/mapa'];

@Component({
  selector: 'app-menu-inferior',
  imports: [RouterLink],
  templateUrl: './menu-inferior.html',
  styleUrl: './menu-inferior.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuInferior {
  private readonly router = inject(Router);

  private readonly endereco = toSignal(
    this.router.events.pipe(
      filter((evento): evento is NavigationEnd => evento instanceof NavigationEnd),
      map((evento) => evento.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  protected readonly blocosAtivo = computed(
    () => !OUTRAS_ABAS.some((aba) => this.endereco().startsWith(aba)),
  );

  protected readonly descobrirAtivo = computed(() => this.ativo('/descobrir') || this.ativo('/local'));

  protected ativo(aba: string): boolean {
    return this.endereco().startsWith(aba);
  }
}
