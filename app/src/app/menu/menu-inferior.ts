import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';

/** Abas que ainda estão em construção. Tudo que não for delas é o "Descobrir". */
const ABAS_EM_BREVE = ['/mapa', '/amigos', '/favoritos'];

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

  protected readonly descobrirAtivo = computed(
    () => !ABAS_EM_BREVE.some((aba) => this.endereco().startsWith(aba)),
  );

  protected ativo(aba: string): boolean {
    return this.endereco().startsWith(aba);
  }
}
