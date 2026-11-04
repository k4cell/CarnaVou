import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, InjectionToken, computed, inject, isDevMode, signal } from '@angular/core';

/** Quanto o pedido de teste pode demorar: na multidão, mais do que isso já é internet que não serve. */
const TEMPO_LIMITE = 6_000;
/** De quanto em quanto tempo olha a internet com a tela aberta, quando ela está ruim. */
const INTERVALO = 60_000;
/** Com a internet boa, olha só uma a cada tantas vezes, para gastar menos. */
const VOLTAS_COM_INTERNET_BOA = 3;

/**
 * Pede um arquivo bem pequeno do site, sem baixar o conteúdo. O `ngsw-bypass` faz o service worker
 * deixar o pedido passar: a resposta tem que vir da internet, e não do que o celular guardou.
 */
async function pedirUmArquivoPequeno(): Promise<boolean> {
  const controle = new AbortController();
  const limite = setTimeout(() => controle.abort(), TEMPO_LIMITE);
  try {
    await fetch('favicon.ico?ngsw-bypass=1', { method: 'HEAD', cache: 'no-store', signal: controle.signal });
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(limite);
  }
}

/** Confere se os dados estão passando. Só no site publicado; nos testes, é trocado por um falso. */
export const TESTAR_INTERNET = new InjectionToken<() => Promise<boolean>>('TESTAR_INTERNET', {
  providedIn: 'root',
  factory: () => (isDevMode() ? () => Promise.resolve(true) : pedirUmArquivoPequeno),
});

/**
 * Se a internet está funcionando. O site continua funcionando sem ela, com o que já foi baixado, e
 * a tela avisa a pessoa. O celular só sabe dizer se tem sinal: na multidão, ele tem sinal e os dados
 * não passam. Por isso, além de ouvir o celular, o serviço faz um pedido pequeno de vez em quando.
 * Começa como "com internet" e só olha depois da primeira pintura (`iniciar`), para a página pronta
 * que vem do servidor e a primeira pintura saírem iguais.
 */
@Injectable({ providedIn: 'root' })
export class Conexao {
  private readonly documento = inject(DOCUMENT);
  private readonly testarInternet = inject(TESTAR_INTERNET);
  private readonly destruicao = inject(DestroyRef);

  private readonly semSinal = signal(false);
  private readonly dadosNaoPassam = signal(false);
  private iniciado = false;
  private conferindo = false;

  /** O que o cabeçalho mostra: vazio quando está tudo bem. */
  readonly aviso = computed(() => {
    if (this.semSinal()) {
      return 'Sem internet';
    }
    return this.dadosNaoPassam() ? 'Internet fraca' : '';
  });

  iniciar(): void {
    const janela = this.documento.defaultView;
    if (!janela || this.iniciado) {
      return;
    }
    this.iniciado = true;
    this.semSinal.set(!janela.navigator.onLine);

    const aoFicarOnline = () => {
      this.semSinal.set(false);
      void this.conferir();
    };
    const aoFicarOffline = () => {
      this.semSinal.set(true);
      this.dadosNaoPassam.set(false);
    };
    const aoVoltarParaATela = () => void this.conferir();
    janela.addEventListener('online', aoFicarOnline);
    janela.addEventListener('offline', aoFicarOffline);
    this.documento.addEventListener('visibilitychange', aoVoltarParaATela);

    let voltas = 0;
    const intervalo = setInterval(() => {
      voltas += 1;
      if (this.dadosNaoPassam() || voltas % VOLTAS_COM_INTERNET_BOA === 0) {
        void this.conferir();
      }
    }, INTERVALO);
    void this.conferir();

    this.destruicao.onDestroy(() => {
      janela.removeEventListener('online', aoFicarOnline);
      janela.removeEventListener('offline', aoFicarOffline);
      this.documento.removeEventListener('visibilitychange', aoVoltarParaATela);
      clearInterval(intervalo);
    });
  }

  /** Só gasta internet com a tela à vista, com sinal e sem outro pedido no meio do caminho. */
  private async conferir(): Promise<void> {
    if (this.conferindo || this.semSinal() || this.documento.visibilityState !== 'visible') {
      return;
    }
    this.conferindo = true;
    const passou = await this.testarInternet();
    this.conferindo = false;
    if (!this.semSinal()) {
      this.dadosNaoPassam.set(!passou);
    }
  }
}
