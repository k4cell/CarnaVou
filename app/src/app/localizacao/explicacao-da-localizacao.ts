import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  output,
  viewChild,
} from '@angular/core';

/**
 * A tela que explica para que serve a localização, antes de o celular fazer a pergunta dele.
 * Quem toca em "Agora não" (ou em Esc) volta para o mapa, que funciona do mesmo jeito.
 */
@Component({
  selector: 'app-explicacao-da-localizacao',
  templateUrl: './explicacao-da-localizacao.html',
  styleUrl: './explicacao-da-localizacao.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'dialog',
    'aria-modal': 'true',
    'aria-labelledby': 'titulo-da-explicacao',
    '(keydown.escape)': 'agoraNao.emit()',
    '(keydown.tab)': 'prenderOFoco($event, false)',
    '(keydown.shift.tab)': 'prenderOFoco($event, true)',
  },
})
export class ExplicacaoDaLocalizacao {
  /** A pessoa quer continuar: aí o celular faz a pergunta dele. */
  readonly continuar = output<void>();
  readonly agoraNao = output<void>();

  private readonly botaoContinuar = viewChild.required<ElementRef<HTMLButtonElement>>('continuarBotao');
  private readonly botaoAgoraNao = viewChild.required<ElementRef<HTMLButtonElement>>('agoraNaoBotao');

  constructor() {
    afterNextRender(() => this.botaoContinuar().nativeElement.focus());
  }

  /** Com a tela aberta, o Tab só anda entre os dois botões. */
  protected prenderOFoco(evento: Event, voltando: boolean): void {
    const primeiro = this.botaoContinuar().nativeElement;
    const ultimo = this.botaoAgoraNao().nativeElement;
    const focado = document.activeElement;
    if (voltando && focado === primeiro) {
      evento.preventDefault();
      ultimo.focus();
    } else if (!voltando && focado === ultimo) {
      evento.preventDefault();
      primeiro.focus();
    }
  }
}
