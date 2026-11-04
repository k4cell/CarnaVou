import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, InjectionToken, inject, signal } from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationSkipped,
  NavigationStart,
  Router,
} from '@angular/router';

/** Quanto a tela pode demorar antes de aparecer o "Carregando": nas rápidas, ele nem pisca. */
const ESPERA_DO_CARREGANDO = 300;

/** Abre um endereço do zero. Nos testes, é trocado por um falso. */
export const ABRIR_ENDERECO = new InjectionToken<(endereco: string) => void>('ABRIR_ENDERECO', {
  providedIn: 'root',
  factory: () => (endereco) => document.location.assign(endereco),
});

/**
 * Avisa quando uma tela demora ou não abre (internet ruim, ou uma versão nova tirou do ar o pedaço
 * que o app ia baixar). Sem isso, o toque não faz nada e a pessoa acha que o app travou.
 */
@Component({
  selector: 'app-aviso-de-navegacao',
  template: `
    @if (falhou(); as endereco) {
      <div class="aviso aviso-flutuante" role="alert">
        <span>Não consegui abrir essa tela. Confira a internet.</span>
        <button type="button" (click)="tentarDeNovo(endereco)">Tentar de novo</button>
      </div>
    } @else if (carregando()) {
      <div class="aviso aviso-flutuante carregando" role="status">Carregando…</div>
    }
  `,
  styles: `
    .carregando {
      padding: 12px 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvisoDeNavegacao {
  private readonly enderecos = inject(Location);
  private readonly abrirEndereco = inject(ABRIR_ENDERECO);

  protected readonly carregando = signal(false);
  protected readonly falhou = signal<string | null>(null);

  constructor() {
    let espera: ReturnType<typeof setTimeout> | undefined;
    const pararDeEsperar = () => {
      clearTimeout(espera);
      this.carregando.set(false);
    };
    const eventos = inject(Router).events.subscribe((evento) => {
      if (evento instanceof NavigationStart) {
        this.falhou.set(null);
        clearTimeout(espera);
        espera = setTimeout(() => this.carregando.set(true), ESPERA_DO_CARREGANDO);
      } else if (evento instanceof NavigationError) {
        pararDeEsperar();
        this.falhou.set(evento.url);
      } else if (
        evento instanceof NavigationEnd ||
        evento instanceof NavigationCancel ||
        evento instanceof NavigationSkipped
      ) {
        pararDeEsperar();
      }
    });
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(espera);
      eventos.unsubscribe();
    });
  }

  /**
   * Abre o endereço do zero, em vez de pedir de novo pelo roteador: o navegador costuma guardar a
   * falha do pedaço que não baixou, e o endereço novo também acerta depois de uma versão nova.
   */
  protected tentarDeNovo(endereco: string): void {
    this.abrirEndereco(this.enderecos.prepareExternalUrl(endereco));
  }
}
