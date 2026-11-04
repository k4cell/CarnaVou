import { TestBed } from '@angular/core/testing';

import { BLOCOS } from '../dados/blocos';
import { acharBlocoPeloId } from '../dados/consultas';
import { definirCorrecoes } from '../dados/correcoes';
import { BAIXAR_CORRECOES, Correcoes } from './correcoes';
import { DadosAtualizados } from './dados-atualizados';

const CHAVE = 'carnavou.correcoes';

describe('Correcoes', () => {
  const id = BLOCOS[0].id;
  const arquivo = (cancelado = true, atualizadoEm = '2027-02-06T17:30:00Z') =>
    JSON.stringify({ atualizadoEm, blocos: cancelado ? [{ id, cancelado: true }] : [] });

  function montar(baixar: () => Promise<string | null>) {
    const falso = vi.fn(baixar);
    TestBed.configureTestingModule({ providers: [{ provide: BAIXAR_CORRECOES, useValue: falso }] });
    return { correcoes: TestBed.inject(Correcoes), baixar: falso };
  }

  const pedidoTerminar = () => new Promise((pronto) => setTimeout(pronto));

  beforeEach(() => {
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
    localStorage.removeItem(CHAVE);
  });

  afterEach(() => {
    Reflect.deleteProperty(document, 'visibilityState');
    localStorage.removeItem(CHAVE);
    definirCorrecoes([]);
    vi.useRealTimers();
  });

  it('não faz nada antes de iniciar, para a primeira pintura sair igual à página pronta', () => {
    localStorage.setItem(CHAVE, arquivo());
    const { baixar, correcoes } = montar(() => Promise.resolve(null));
    expect(baixar).not.toHaveBeenCalled();
    expect(correcoes.atualizadoEm()).toBeNull();
    expect(acharBlocoPeloId(id)?.cancelado).toBeUndefined();
  });

  it('a correção chega sozinha, sem recarregar a página, e fica guardada no aparelho', async () => {
    const { correcoes } = montar(() => Promise.resolve(arquivo()));
    correcoes.iniciar();
    await pedidoTerminar();
    expect(acharBlocoPeloId(id)?.cancelado).toBe(true);
    expect(correcoes.atualizadoEm()).toBe('2027-02-06T17:30:00Z');
    expect(localStorage.getItem(CHAVE)).toBe(arquivo());
  });

  it('sem internet, vale a última correção guardada', async () => {
    localStorage.setItem(CHAVE, arquivo());
    const { correcoes } = montar(() => Promise.resolve(null));
    correcoes.iniciar();
    expect(acharBlocoPeloId(id)?.cancelado).toBe(true);
    await pedidoTerminar();
    expect(acharBlocoPeloId(id)?.cancelado).toBe(true);
  });

  it('um arquivo quebrado não apaga o que já valia', async () => {
    localStorage.setItem(CHAVE, arquivo());
    const { correcoes } = montar(() => Promise.resolve('{ isto não é um arquivo'));
    correcoes.iniciar();
    await pedidoTerminar();
    expect(acharBlocoPeloId(id)?.cancelado).toBe(true);
    expect(localStorage.getItem(CHAVE)).toBe(arquivo());
  });

  it('um arquivo guardado quebrado não atrapalha o app', async () => {
    localStorage.setItem(CHAVE, 'bagunça');
    const { correcoes } = montar(() => Promise.resolve(null));
    correcoes.iniciar();
    await pedidoTerminar();
    expect(acharBlocoPeloId(id)?.cancelado).toBeUndefined();
  });

  it('quando a correção é retirada do arquivo, o bloco volta ao normal', async () => {
    localStorage.setItem(CHAVE, arquivo());
    const { correcoes } = montar(() => Promise.resolve(arquivo(false)));
    correcoes.iniciar();
    await pedidoTerminar();
    expect(acharBlocoPeloId(id)?.cancelado).toBeUndefined();
  });

  it('olha de novo ao voltar para a tela, e não com a tela apagada', async () => {
    const { correcoes, baixar } = montar(() => Promise.resolve(null));
    correcoes.iniciar();
    await pedidoTerminar();
    expect(baixar).toHaveBeenCalledTimes(1);

    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
    await pedidoTerminar();
    expect(baixar).toHaveBeenCalledTimes(1);

    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
    await pedidoTerminar();
    expect(baixar).toHaveBeenCalledTimes(2);
  });

  it('olha de tempos em tempos, com o app aberto', () => {
    vi.useFakeTimers();
    const { correcoes, baixar } = montar(() => new Promise(() => undefined));
    correcoes.iniciar();
    expect(baixar).toHaveBeenCalledTimes(1);
    // O primeiro pedido ainda não terminou: não faz outro por cima.
    vi.advanceTimersByTime(5 * 60_000);
    expect(baixar).toHaveBeenCalledTimes(1);
  });

  it('olha quando a internet volta', async () => {
    const { correcoes, baixar } = montar(() => Promise.resolve(null));
    correcoes.iniciar();
    await pedidoTerminar();
    window.dispatchEvent(new Event('online'));
    await pedidoTerminar();
    expect(baixar).toHaveBeenCalledTimes(2);
  });

  describe('a linha "Dados atualizados"', () => {
    async function tela(texto: string | null) {
      const { correcoes } = montar(() => Promise.resolve(texto));
      const fixture = TestBed.createComponent(DadosAtualizados);
      correcoes.iniciar();
      await pedidoTerminar();
      await fixture.whenStable();
      return (fixture.nativeElement as HTMLElement).textContent?.trim();
    }

    it('mostra a data na hora de São Paulo', async () => {
      expect(await tela(arquivo())).toBe('Dados atualizados em 06/02/2027 às 14h30');
    });

    it('não aparece enquanto o app não sabe a data', async () => {
      expect(await tela(null)).toBe('');
    });

    it('não aparece com uma data que não existe', async () => {
      expect(await tela(arquivo(true, 'ontem'))).toBe('');
    });
  });
});
