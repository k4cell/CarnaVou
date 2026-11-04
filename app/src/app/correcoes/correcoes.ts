import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, InjectionToken, inject, isDevMode, signal } from '@angular/core';

import { definirCorrecoes, lerCorrecoes } from '../dados/correcoes';

const CHAVE = 'carnavou.correcoes';
/** De quanto em quanto tempo olha se tem correção nova, com a tela à vista. */
const INTERVALO = 5 * 60_000;
/** Na multidão, um pedido que demora mais do que isso não vai chegar. */
const TEMPO_LIMITE = 10_000;

/**
 * Baixa o arquivo de correções. O `no-cache` só confere se ele mudou: quando não mudou, o servidor
 * responde sem mandar o arquivo de novo. O `ngsw-bypass` faz o service worker deixar o pedido passar.
 */
async function baixarDoSite(): Promise<string | null> {
  const controle = new AbortController();
  const limite = setTimeout(() => controle.abort(), TEMPO_LIMITE);
  try {
    const resposta = await fetch('correcoes.json?ngsw-bypass=1', { cache: 'no-cache', signal: controle.signal });
    return resposta.ok ? await resposta.text() : null;
  } catch {
    return null;
  } finally {
    clearTimeout(limite);
  }
}

/** Baixa as correções. Só no site publicado; nos testes, é trocado por um falso. */
export const BAIXAR_CORRECOES = new InjectionToken<() => Promise<string | null>>('BAIXAR_CORRECOES', {
  providedIn: 'root',
  factory: () => (isDevMode() ? () => Promise.resolve(null) : baixarDoSite),
});

/**
 * Faz as correções chegarem sozinhas, sem depender do toque em "Atualizar": olha o arquivo ao abrir,
 * ao voltar para a tela, quando a internet volta e de tempos em tempos. As últimas ficam guardadas no
 * aparelho, para valerem também sem internet. Só começa depois da primeira pintura (`iniciar`), para
 * a página pronta que vem do servidor e a primeira pintura saírem iguais.
 */
@Injectable({ providedIn: 'root' })
export class Correcoes {
  private readonly documento = inject(DOCUMENT);
  private readonly baixar = inject(BAIXAR_CORRECOES);
  private readonly destruicao = inject(DestroyRef);

  private readonly dataDosDados = signal<string | null>(null);
  private textoAtual: string | null = null;
  private iniciado = false;
  private baixando = false;

  /** Quando os dados mudaram pela última vez. A publicação grava essa data no arquivo. */
  readonly atualizadoEm = this.dataDosDados.asReadonly();

  iniciar(): void {
    const janela = this.documento.defaultView;
    if (!janela || this.iniciado) {
      return;
    }
    this.iniciado = true;

    this.usar(this.lerDoAparelho());
    const procurar = () => void this.procurar();
    janela.addEventListener('online', procurar);
    this.documento.addEventListener('visibilitychange', procurar);
    const intervalo = setInterval(procurar, INTERVALO);
    procurar();

    this.destruicao.onDestroy(() => {
      janela.removeEventListener('online', procurar);
      this.documento.removeEventListener('visibilitychange', procurar);
      clearInterval(intervalo);
    });
  }

  /** Só gasta internet com a tela à vista e sem outro pedido no meio do caminho. */
  private async procurar(): Promise<void> {
    if (this.baixando || this.documento.visibilityState !== 'visible') {
      return;
    }
    this.baixando = true;
    const texto = await this.baixar();
    this.baixando = false;
    if (texto !== null && texto !== this.textoAtual && this.usar(texto)) {
      this.guardarNoAparelho(texto);
    }
  }

  /** Passa a valer o que está no texto. Volta falso quando o texto não serve: fica o que estava. */
  private usar(texto: string | null): boolean {
    if (texto === null) {
      return false;
    }
    let arquivo: { atualizadoEm?: unknown } | null;
    try {
      arquivo = JSON.parse(texto) as { atualizadoEm?: unknown } | null;
    } catch {
      return false;
    }
    if (!Array.isArray((arquivo as { blocos?: unknown } | null)?.blocos)) {
      return false;
    }
    definirCorrecoes(lerCorrecoes(arquivo));
    const data = arquivo?.atualizadoEm;
    this.dataDosDados.set(typeof data === 'string' && !Number.isNaN(Date.parse(data)) ? data : null);
    this.textoAtual = texto;
    return true;
  }

  private lerDoAparelho(): string | null {
    try {
      return this.documento.defaultView?.localStorage.getItem(CHAVE) ?? null;
    } catch {
      // Sem acesso ao que fica guardado (navegação privada, por exemplo), vale só o que vier da internet.
      return null;
    }
  }

  private guardarNoAparelho(texto: string): void {
    try {
      this.documento.defaultView?.localStorage.setItem(CHAVE, texto);
    } catch {
      // Sem espaço ou sem acesso: a correção vale enquanto o app estiver aberto.
    }
  }
}
