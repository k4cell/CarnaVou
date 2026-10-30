import { DestroyRef, Injectable, InjectionToken, inject, signal } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { filter } from 'rxjs';

/** Recarrega a página. Nos testes, é trocado por um falso. */
export const RECARREGAR = new InjectionToken<() => void>('RECARREGAR', {
  providedIn: 'root',
  factory: () => () => document.location.reload(),
});

/** De quanto em quanto tempo o app aberto procura versão nova. */
const INTERVALO_DE_PROCURA = 15 * 60_000;

/**
 * Cuida de trocar o app instalado pela versão nova do site. O celular quase nunca fecha o app de
 * verdade, então ele procura versão nova ao abrir, quando volta para a frente da tela e a cada
 * 15 minutos. Quando a versão nova termina de baixar, avisa (`temVersaoNova`); a pessoa toca em
 * "Atualizar" e a página recarrega já com ela.
 */
@Injectable({ providedIn: 'root' })
export class Atualizacao {
  // Só existe com o service worker ligado (no site publicado); no `ng serve` e nos testes, não.
  private readonly sw = inject(SwUpdate, { optional: true });
  private readonly recarregar = inject(RECARREGAR);
  private readonly destruicao = inject(DestroyRef);
  private iniciado = false;

  private readonly versaoNova = signal(false);
  readonly temVersaoNova = this.versaoNova.asReadonly();

  /** Roda uma vez, no navegador, depois da primeira pintura. */
  iniciar(): void {
    const sw = this.sw;
    if (this.iniciado || !sw?.isEnabled) {
      return;
    }
    this.iniciado = true;

    sw.versionUpdates
      .pipe(filter((evento) => evento.type === 'VERSION_READY'))
      .subscribe(() => this.versaoNova.set(true));
    // O que o app guardou se perdeu (o celular apagou parte do cache): só recarregando.
    sw.unrecoverable.subscribe(() => this.recarregar());

    const procurar = () => void sw.checkForUpdate().catch(() => undefined);
    const aoVoltar = () => {
      if (document.visibilityState === 'visible') {
        procurar();
      }
    };
    procurar();
    document.addEventListener('visibilitychange', aoVoltar);
    const intervalo = setInterval(procurar, INTERVALO_DE_PROCURA);
    this.destruicao.onDestroy(() => {
      document.removeEventListener('visibilitychange', aoVoltar);
      clearInterval(intervalo);
    });
  }

  /** Passa para a versão nova e recarrega a página. */
  async atualizar(): Promise<void> {
    await this.sw?.activateUpdate().catch(() => undefined);
    this.recarregar();
  }
}
