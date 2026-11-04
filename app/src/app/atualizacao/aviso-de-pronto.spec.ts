import { TestBed } from '@angular/core/testing';
import { SwUpdate } from '@angular/service-worker';

import { AvisoDePronto, CONFERIR_SE_ESTA_GUARDADO, ProntoSemInternet } from './aviso-de-pronto';

describe('ProntoSemInternet', () => {
  const CHAVE = 'carnavou.pronto-sem-internet';

  async function montar(respostas: boolean[], ligado = true) {
    const conferir = vi.fn(() => Promise.resolve(respostas.shift() ?? false));
    await TestBed.configureTestingModule({
      imports: [AvisoDePronto],
      providers: [
        { provide: SwUpdate, useValue: { isEnabled: ligado } },
        { provide: CONFERIR_SE_ESTA_GUARDADO, useValue: conferir },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(AvisoDePronto);
    const pronto = TestBed.inject(ProntoSemInternet);
    return { fixture, pronto, conferir, tela: fixture.nativeElement as HTMLElement };
  }

  beforeEach(() => {
    localStorage.removeItem(CHAVE);
    vi.useFakeTimers();
  });

  afterEach(() => {
    localStorage.removeItem(CHAVE);
    vi.useRealTimers();
  });

  it('avisa quando terminou de guardar, e o aviso some sozinho', async () => {
    const { fixture, pronto, tela } = await montar([true]);
    pronto.iniciar();
    await vi.advanceTimersByTimeAsync(0);
    fixture.detectChanges();
    expect(tela.querySelector('.aviso')?.textContent).toContain('já abre sem internet');
    await vi.advanceTimersByTimeAsync(6_000);
    fixture.detectChanges();
    expect(tela.querySelector('.aviso')).toBeNull();
  });

  it('continua olhando enquanto não terminou', async () => {
    const { pronto, conferir } = await montar([false, false, true]);
    pronto.iniciar();
    await vi.advanceTimersByTimeAsync(0);
    expect(pronto.avisar()).toBe(false);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(conferir).toHaveBeenCalledTimes(3);
    expect(pronto.avisar()).toBe(true);
  });

  it('desiste depois de um tempo, para não gastar internet', async () => {
    const { pronto, conferir } = await montar([]);
    pronto.iniciar();
    await vi.advanceTimersByTimeAsync(600_000);
    expect(conferir).toHaveBeenCalledTimes(24);
    expect(pronto.avisar()).toBe(false);
  });

  it('avisa uma vez só em cada aparelho', async () => {
    localStorage.setItem(CHAVE, '1');
    const { pronto, conferir } = await montar([true]);
    pronto.iniciar();
    await vi.advanceTimersByTimeAsync(0);
    expect(conferir).not.toHaveBeenCalled();
  });

  it('lembra que já avisou', async () => {
    const { pronto } = await montar([true]);
    pronto.iniciar();
    await vi.advanceTimersByTimeAsync(0);
    expect(localStorage.getItem(CHAVE)).toBe('1');
  });

  it('não faz nada sem o service worker', async () => {
    const { pronto, conferir } = await montar([true], false);
    pronto.iniciar();
    await vi.advanceTimersByTimeAsync(0);
    expect(conferir).not.toHaveBeenCalled();
  });
});
