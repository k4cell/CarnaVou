import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, InjectionToken, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

/** Para navegadores sem a área de transferência moderna (ou em páginas sem https). */
function copiarPeloCaminhoAntigo(texto: string): boolean {
  const campo = document.createElement('textarea');
  campo.value = texto;
  campo.setAttribute('readonly', '');
  campo.style.position = 'fixed';
  campo.style.opacity = '0';
  document.body.appendChild(campo);
  campo.select();
  try {
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    campo.remove();
  }
}

async function copiarTexto(texto: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    return copiarPeloCaminhoAntigo(texto);
  }
}

/** Copia um texto para a área de transferência e devolve se conseguiu. Nos testes, é trocado por um falso. */
export const COPIAR_TEXTO = new InjectionToken<(texto: string) => Promise<boolean>>('COPIAR_TEXTO', {
  providedIn: 'root',
  factory: () => copiarTexto,
});

const SEGUNDOS_DO_AVISO = 3;

type Resultado = 'nenhum' | 'copiado' | 'falhou';

/** O botão que copia o link da página em que a pessoa está, para mandar para o grupo. */
@Component({
  selector: 'app-copiar-link',
  templateUrl: './copiar-link.html',
  styleUrl: './copiar-link.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CopiarLink {
  private readonly copiarTexto = inject(COPIAR_TEXTO);
  private readonly router = inject(Router);
  private readonly enderecos = inject(Location);

  private readonly resultado = signal<Resultado>('nenhum');
  private temporizador?: ReturnType<typeof setTimeout>;

  protected readonly mensagem = computed(() => {
    switch (this.resultado()) {
      case 'copiado':
        return 'Link copiado!';
      case 'falhou':
        return 'Não consegui copiar. Copie o endereço lá em cima, no navegador.';
      default:
        return '';
    }
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.temporizador));
  }

  protected async copiar(): Promise<void> {
    const copiou = await this.copiarTexto(this.endereco());
    this.resultado.set(copiou ? 'copiado' : 'falhou');
    clearTimeout(this.temporizador);
    this.temporizador = setTimeout(() => this.resultado.set('nenhum'), SEGUNDOS_DO_AVISO * 1000);
  }

  /** O endereço limpo da página: sem a data de teste (`?hoje=`) nem nada depois do "?". */
  private endereco(): string {
    const caminho = this.router.url.split(/[?#]/)[0];
    return new URL(this.enderecos.prepareExternalUrl(caminho), document.location.origin).href;
  }
}
