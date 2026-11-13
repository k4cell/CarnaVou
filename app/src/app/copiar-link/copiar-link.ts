import { Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  InjectionToken,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
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

/**
 * O menu de compartilhar do celular (Web Share), quando o navegador tem: abre o WhatsApp, o
 * Instagram e os outros apps. Sem ele (no computador, quase sempre), fica `null` e o botão copia o
 * link. Nos testes, é trocado por um falso.
 */
export const COMPARTILHAR = new InjectionToken<((dados: ShareData) => Promise<void>) | null>('COMPARTILHAR', {
  providedIn: 'root',
  factory: () =>
    typeof navigator !== 'undefined' && typeof navigator.share === 'function'
      ? (dados: ShareData) => navigator.share(dados)
      : null,
});

const SEGUNDOS_DO_AVISO = 3;

type Resultado = 'nenhum' | 'copiado' | 'falhou';

/**
 * O botão de mandar a página para o grupo: no celular, abre o menu de compartilhar; onde não tem
 * esse menu, copia o link. A página pronta sai com o "Copiar link", e o botão vira "Compartilhar"
 * depois que o app entra no navegador.
 */
@Component({
  selector: 'app-copiar-link',
  templateUrl: './copiar-link.html',
  styleUrl: './copiar-link.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CopiarLink {
  private readonly copiarTexto = inject(COPIAR_TEXTO);
  private readonly compartilhar = inject(COMPARTILHAR);
  private readonly router = inject(Router);
  private readonly enderecos = inject(Location);
  private readonly titulo = inject(Title);

  /** O celular tem o menu de compartilhar. Só se sabe no navegador, depois da primeira pintura. */
  protected readonly podeCompartilhar = signal(false);
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
    afterNextRender(() => this.podeCompartilhar.set(this.compartilhar !== null));
  }

  protected async tocar(): Promise<void> {
    if (this.compartilhar && this.podeCompartilhar()) {
      try {
        await this.compartilhar({ title: this.titulo.getTitle(), url: this.endereco() });
        return;
      } catch (erro) {
        // Fechar o menu sem escolher um app não é erro. Outro problema cai no copiar o link.
        if (erro instanceof DOMException && erro.name === 'AbortError') {
          return;
        }
      }
    }
    await this.copiar();
  }

  private async copiar(): Promise<void> {
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
