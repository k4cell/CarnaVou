import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injectable,
  InjectionToken,
  inject,
  signal,
} from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

const CHAVE = 'carnavou.pronto-sem-internet';
/** De quanto em quanto tempo olha se terminou de guardar. */
const INTERVALO = 5_000;
/** Quantas vezes olha: depois disso, tenta de novo só na próxima vez que o app abrir. */
const TENTATIVAS = 24;
/** Quanto tempo o aviso fica na tela. */
const TEMPO_DO_AVISO = 6_000;

/**
 * Compara a lista de arquivos do app com o que o service worker já guardou no celular. Ele não avisa
 * quando termina, então esta é a forma de ter certeza.
 */
async function tudoGuardado(): Promise<boolean> {
  try {
    const resposta = await fetch('ngsw.json?ngsw-bypass=1', { cache: 'no-store' });
    const lista = (await resposta.json()) as { assetGroups: { name: string; urls: string[] }[] };
    const arquivos = lista.assetGroups.find((grupo) => grupo.name === 'app')?.urls ?? [];
    const guardados = await Promise.all(arquivos.map((arquivo) => caches.match(arquivo, { ignoreVary: true })));
    return arquivos.length > 0 && guardados.every(Boolean);
  } catch {
    return false;
  }
}

/** Confere se o app já está guardado no celular. Nos testes, é trocado por um falso. */
export const CONFERIR_SE_ESTA_GUARDADO = new InjectionToken<() => Promise<boolean>>('CONFERIR_SE_ESTA_GUARDADO', {
  providedIn: 'root',
  factory: () => tudoGuardado,
});

/**
 * Avisa uma vez, em cada aparelho, quando o app terminou de ser guardado e passa a abrir sem
 * internet. O mapa não entra nessa conta: ele só guarda o que a pessoa já abriu.
 */
@Injectable({ providedIn: 'root' })
export class ProntoSemInternet {
  private readonly janela = inject(DOCUMENT).defaultView;
  private readonly sw = inject(SwUpdate, { optional: true });
  private readonly conferir = inject(CONFERIR_SE_ESTA_GUARDADO);
  private readonly destruicao = inject(DestroyRef);

  readonly avisar = signal(false);

  /** Roda uma vez, no navegador, depois da primeira pintura. */
  iniciar(): void {
    if (!this.sw?.isEnabled || this.jaAvisou()) {
      return;
    }
    let tentativas = 0;
    let aviso: ReturnType<typeof setTimeout> | undefined;
    let procura: ReturnType<typeof setTimeout> | undefined;
    const olhar = async () => {
      if (await this.conferir()) {
        this.lembrarQueAvisou();
        this.avisar.set(true);
        aviso = setTimeout(() => this.avisar.set(false), TEMPO_DO_AVISO);
      } else if (++tentativas < TENTATIVAS) {
        procura = setTimeout(() => void olhar(), INTERVALO);
      }
    };
    void olhar();
    this.destruicao.onDestroy(() => {
      clearTimeout(aviso);
      clearTimeout(procura);
    });
  }

  private jaAvisou(): boolean {
    try {
      return this.janela?.localStorage.getItem(CHAVE) === '1';
    } catch {
      return false;
    }
  }

  private lembrarQueAvisou(): void {
    try {
      this.janela?.localStorage.setItem(CHAVE, '1');
    } catch {
      // Sem acesso ao que fica guardado, o aviso pode aparecer de novo. Não atrapalha.
    }
  }
}

/** O aviso em si, logo acima do menu de baixo. */
@Component({
  selector: 'app-aviso-de-pronto',
  template: `
    @if (pronto.avisar()) {
      <div class="aviso aviso-flutuante mensagem" role="status">Pronto! A lista de blocos já abre sem internet.</div>
    }
  `,
  styles: `
    .mensagem {
      padding: 12px 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvisoDePronto {
  protected readonly pronto = inject(ProntoSemInternet);
}
