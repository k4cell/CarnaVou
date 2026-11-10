import { TestBed } from '@angular/core/testing';

import { DATA_DE_DEMONSTRACAO, Relogio, horaDeSaoPaulo, lerDataDeTeste } from './relogio';

describe('lerDataDeTeste', () => {
  it('lê dia e hora', () => {
    expect(lerDataDeTeste('2026-02-14T14:30')).toEqual(new Date(2026, 1, 14, 14, 30));
  });

  it('lê o dia sozinho e usa meio-dia', () => {
    expect(lerDataDeTeste('2026-02-14')).toEqual(new Date(2026, 1, 14, 12, 0));
  });

  it('aceita espaço no lugar do T', () => {
    expect(lerDataDeTeste('2026-02-14 09:05')).toEqual(new Date(2026, 1, 14, 9, 5));
  });

  it('recusa texto que não é data', () => {
    expect(lerDataDeTeste(null)).toBeUndefined();
    expect(lerDataDeTeste('')).toBeUndefined();
    expect(lerDataDeTeste('amanhã')).toBeUndefined();
    expect(lerDataDeTeste('14/02/2026')).toBeUndefined();
  });

  it('recusa dia ou hora que não existem', () => {
    expect(lerDataDeTeste('2026-02-31')).toBeUndefined();
    expect(lerDataDeTeste('2026-13-01')).toBeUndefined();
    expect(lerDataDeTeste('2026-02-14T25:00')).toBeUndefined();
  });
});

describe('horaDeSaoPaulo', () => {
  it('dá o dia e a hora de São Paulo, seja qual for o fuso do aparelho', () => {
    // 17h em Londres (UTC) são 14h em São Paulo.
    const sp = horaDeSaoPaulo(new Date(Date.UTC(2026, 1, 14, 17, 0)));
    expect([sp.getDate(), sp.getHours(), sp.getMinutes()]).toEqual([14, 14, 0]);
  });

  it('acerta o dia perto da meia-noite: 2h30 em Londres ainda é a noite anterior em São Paulo', () => {
    const sp = horaDeSaoPaulo(new Date(Date.UTC(2026, 1, 15, 2, 30)));
    expect([sp.getDate(), sp.getHours(), sp.getMinutes()]).toEqual([14, 23, 30]);
  });

  it('dá meia-noite como 0h, e não 24h', () => {
    const sp = horaDeSaoPaulo(new Date(Date.UTC(2026, 1, 15, 3, 0)));
    expect([sp.getDate(), sp.getHours()]).toEqual([15, 0]);
  });
});

describe('Relogio', () => {
  it('começa sem saber a data', () => {
    const relogio = TestBed.inject(Relogio);
    expect(relogio.agora()).toBeNull();
    expect(relogio.simulado()).toBe(false);
  });

  it('usa a data do endereço quando existe, e fica parado nela', () => {
    const relogio = TestBed.inject(Relogio);
    relogio.iniciar('?hoje=2026-02-14T14:00');
    expect(relogio.agora()).toEqual(new Date(2026, 1, 14, 14, 0));
    expect(relogio.simulado()).toBe(true);
  });

  it('usa o "hoje" de demonstração (14/02/2026) quando o endereço não tem data', () => {
    const relogio = TestBed.inject(Relogio);
    relogio.iniciar('');
    expect(relogio.agora()).toEqual(new Date(2026, 1, 14, 12, 0));
    expect(relogio.simulado()).toBe(true);
  });

  it('ignora uma data de teste que não existe e usa a de demonstração', () => {
    const relogio = TestBed.inject(Relogio);
    relogio.iniciar('?hoje=2026-02-31');
    expect(relogio.agora()).toEqual(new Date(2026, 1, 14, 12, 0));
  });

  it('só começa uma vez: voltar para a tela inicial não perde a data de teste', () => {
    const relogio = TestBed.inject(Relogio);
    relogio.iniciar('?hoje=2026-02-14T14:00');
    relogio.iniciar('');
    expect(relogio.agora()).toEqual(new Date(2026, 1, 14, 14, 0));
    expect(relogio.simulado()).toBe(true);
  });

  describe('sem data de demonstração', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({ providers: [{ provide: DATA_DE_DEMONSTRACAO, useValue: null }] });
    });

    afterEach(() => vi.useRealTimers());

    it('usa o relógio do celular, na hora de São Paulo, quando o endereço não tem data', () => {
      // 17h em Londres (UTC): no app, 14h, a hora de São Paulo.
      vi.useFakeTimers({ now: Date.UTC(2026, 1, 14, 17, 0) });
      const relogio = TestBed.inject(Relogio);
      relogio.iniciar('');
      expect(relogio.agora()).toEqual(new Date(2026, 1, 14, 14, 0));
      expect(relogio.simulado()).toBe(false);
    });

    it('anda um minuto por vez, sempre na hora de São Paulo', () => {
      vi.useFakeTimers({ now: Date.UTC(2026, 1, 14, 17, 0) });
      const relogio = TestBed.inject(Relogio);
      relogio.iniciar('');
      vi.advanceTimersByTime(60_000);
      expect(relogio.agora()).toEqual(new Date(2026, 1, 14, 14, 1));
    });

    it('usa o relógio do celular quando a data de teste não existe', () => {
      const relogio = TestBed.inject(Relogio);
      relogio.iniciar('?hoje=2026-02-31');
      expect(relogio.simulado()).toBe(false);
      expect(relogio.agora()).not.toBeNull();
    });
  });
});
