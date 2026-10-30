import { TestBed } from '@angular/core/testing';
import { SwUpdate, VersionEvent } from '@angular/service-worker';
import { Subject } from 'rxjs';

import { Atualizacao, RECARREGAR } from './atualizacao';
import { AvisoDeAtualizacao } from './aviso-de-atualizacao';

/** Um service worker de mentirinha: avisa de versão nova quando o teste manda. */
function criarSwFalso(ligado = true) {
  const versoes = new Subject<VersionEvent>();
  const irrecuperavel = new Subject<{ type: 'UNRECOVERABLE_STATE'; reason: string }>();
  return {
    versoes,
    irrecuperavel,
    sw: {
      isEnabled: ligado,
      versionUpdates: versoes.asObservable(),
      unrecoverable: irrecuperavel.asObservable(),
      checkForUpdate: vi.fn(() => Promise.resolve(false)),
      activateUpdate: vi.fn(() => Promise.resolve(true)),
    },
  };
}

describe('Atualizacao', () => {
  async function montar(ligado = true) {
    const falso = criarSwFalso(ligado);
    const recarregar = vi.fn();
    await TestBed.configureTestingModule({
      imports: [AvisoDeAtualizacao],
      providers: [
        { provide: SwUpdate, useValue: falso.sw },
        { provide: RECARREGAR, useValue: recarregar },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(AvisoDeAtualizacao);
    const atualizacao = TestBed.inject(Atualizacao);
    atualizacao.iniciar();
    await fixture.whenStable();
    const tela = fixture.nativeElement as HTMLElement;
    return { fixture, tela, falso, recarregar, atualizacao };
  }

  const versaoPronta = { type: 'VERSION_READY', currentVersion: { hash: 'a' }, latestVersion: { hash: 'b' } } as VersionEvent;

  it('procura versão nova assim que o app abre', async () => {
    const { falso } = await montar();
    expect(falso.sw.checkForUpdate).toHaveBeenCalledTimes(1);
  });

  it('procura de novo quando o app volta para a frente da tela', async () => {
    const { falso } = await montar();
    document.dispatchEvent(new Event('visibilitychange'));
    expect(falso.sw.checkForUpdate).toHaveBeenCalledTimes(2);
  });

  it('não mostra aviso enquanto não tem versão nova', async () => {
    const { tela } = await montar();
    expect(tela.querySelector('.aviso')).toBeNull();
  });

  it('avisa quando a versão nova terminou de baixar', async () => {
    const { fixture, tela, falso } = await montar();
    falso.versoes.next(versaoPronta);
    await fixture.whenStable();
    expect(tela.querySelector('.aviso')?.textContent).toContain('Tem versão nova do CarnaVou.');
  });

  it('"Atualizar" passa para a versão nova e recarrega a página', async () => {
    const { fixture, tela, falso, recarregar } = await montar();
    falso.versoes.next(versaoPronta);
    await fixture.whenStable();
    tela.querySelector<HTMLButtonElement>('.aviso button')!.click();
    await fixture.whenStable();
    expect(falso.sw.activateUpdate).toHaveBeenCalled();
    expect(recarregar).toHaveBeenCalled();
  });

  it('recarrega sozinho quando o que o app guardou se perdeu', async () => {
    const { falso, recarregar } = await montar();
    falso.irrecuperavel.next({ type: 'UNRECOVERABLE_STATE', reason: 'cache apagado' });
    expect(recarregar).toHaveBeenCalled();
  });

  it('não faz nada sem o service worker (no ng serve)', async () => {
    const { falso, tela } = await montar(false);
    expect(falso.sw.checkForUpdate).not.toHaveBeenCalled();
    expect(tela.querySelector('.aviso')).toBeNull();
  });
});
