import { TestBed } from '@angular/core/testing';

import { Conexao, TESTAR_INTERNET } from './conexao';

describe('Conexao', () => {
  const original = Object.getOwnPropertyDescriptor(Navigator.prototype, 'onLine');

  function fingirQueEsta(online: boolean) {
    Object.defineProperty(navigator, 'onLine', { value: online, configurable: true });
  }

  /** O serviço com um teste de internet de mentira, que responde o que a gente mandar. */
  function montar(passa = true) {
    const testar = vi.fn(() => Promise.resolve(passa));
    TestBed.configureTestingModule({ providers: [{ provide: TESTAR_INTERNET, useValue: testar }] });
    return { conexao: TestBed.inject(Conexao), testar };
  }

  const pedidoTerminar = () => new Promise((pronto) => setTimeout(pronto));

  afterEach(() => {
    Reflect.deleteProperty(navigator, 'onLine');
    if (original) {
      Object.defineProperty(Navigator.prototype, 'onLine', original);
    }
    vi.useRealTimers();
  });

  it('começa sem aviso, antes de olhar o celular', () => {
    fingirQueEsta(false);
    const { conexao, testar } = montar();
    expect(conexao.aviso()).toBe('');
    expect(testar).not.toHaveBeenCalled();
  });

  it('ao iniciar sem sinal, avisa e não gasta um pedido à toa', () => {
    fingirQueEsta(false);
    const { conexao, testar } = montar();
    conexao.iniciar();
    expect(conexao.aviso()).toBe('Sem internet');
    expect(testar).not.toHaveBeenCalled();
  });

  it('acompanha quando o sinal cai e quando volta', async () => {
    fingirQueEsta(true);
    const { conexao } = montar();
    conexao.iniciar();
    window.dispatchEvent(new Event('offline'));
    expect(conexao.aviso()).toBe('Sem internet');
    window.dispatchEvent(new Event('online'));
    await pedidoTerminar();
    expect(conexao.aviso()).toBe('');
  });

  it('avisa quando tem sinal, mas os dados não passam', async () => {
    fingirQueEsta(true);
    const { conexao } = montar(false);
    conexao.iniciar();
    await pedidoTerminar();
    expect(conexao.aviso()).toBe('Internet fraca');
  });

  it('confere de novo quando a pessoa volta para a tela, e tira o aviso se a internet melhorou', async () => {
    fingirQueEsta(true);
    const { conexao, testar } = montar(false);
    conexao.iniciar();
    await pedidoTerminar();
    expect(conexao.aviso()).toBe('Internet fraca');
    testar.mockResolvedValue(true);
    document.dispatchEvent(new Event('visibilitychange'));
    await pedidoTerminar();
    expect(conexao.aviso()).toBe('');
  });

  it('com a internet ruim, confere a cada minuto; com ela boa, a cada três', async () => {
    vi.useFakeTimers();
    fingirQueEsta(true);
    const { conexao, testar } = montar(true);
    conexao.iniciar();
    await vi.advanceTimersByTimeAsync(0);
    expect(testar).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(120_000);
    expect(testar).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(60_000);
    expect(testar).toHaveBeenCalledTimes(2);
    testar.mockResolvedValue(false);
    await vi.advanceTimersByTimeAsync(180_000);
    expect(conexao.aviso()).toBe('Internet fraca');
    const atéAqui = testar.mock.calls.length;
    await vi.advanceTimersByTimeAsync(60_000);
    expect(testar).toHaveBeenCalledTimes(atéAqui + 1);
  });

  it('não confere com a tela escondida', async () => {
    fingirQueEsta(true);
    const { conexao, testar } = montar();
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
    conexao.iniciar();
    await pedidoTerminar();
    Reflect.deleteProperty(document, 'visibilityState');
    expect(testar).not.toHaveBeenCalled();
  });
});
