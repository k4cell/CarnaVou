import { TestBed } from '@angular/core/testing';

import { Relogio, lerDataDeTeste } from './relogio';

describe('lerDataDeTeste', () => {
  it('lê dia e hora', () => {
    expect(lerDataDeTeste('2027-02-06T14:30')).toEqual(new Date(2027, 1, 6, 14, 30));
  });

  it('lê o dia sozinho e usa meio-dia', () => {
    expect(lerDataDeTeste('2027-02-06')).toEqual(new Date(2027, 1, 6, 12, 0));
  });

  it('aceita espaço no lugar do T', () => {
    expect(lerDataDeTeste('2027-02-06 09:05')).toEqual(new Date(2027, 1, 6, 9, 5));
  });

  it('recusa texto que não é data', () => {
    expect(lerDataDeTeste(null)).toBeUndefined();
    expect(lerDataDeTeste('')).toBeUndefined();
    expect(lerDataDeTeste('amanhã')).toBeUndefined();
    expect(lerDataDeTeste('06/02/2027')).toBeUndefined();
  });

  it('recusa dia ou hora que não existem', () => {
    expect(lerDataDeTeste('2027-02-31')).toBeUndefined();
    expect(lerDataDeTeste('2027-13-01')).toBeUndefined();
    expect(lerDataDeTeste('2027-02-06T25:00')).toBeUndefined();
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
    relogio.iniciar('?hoje=2027-02-06T14:00');
    expect(relogio.agora()).toEqual(new Date(2027, 1, 6, 14, 0));
    expect(relogio.simulado()).toBe(true);
  });

  it('usa o relógio do celular quando o endereço não tem data', () => {
    const relogio = TestBed.inject(Relogio);
    const antes = Date.now();
    relogio.iniciar('');
    const agora = relogio.agora();
    expect(agora).not.toBeNull();
    expect((agora as Date).getTime()).toBeGreaterThanOrEqual(antes);
    expect(relogio.simulado()).toBe(false);
  });

  it('ignora uma data de teste que não existe', () => {
    const relogio = TestBed.inject(Relogio);
    relogio.iniciar('?hoje=2027-02-31');
    expect(relogio.simulado()).toBe(false);
    expect(relogio.agora()).not.toBeNull();
  });

  it('só começa uma vez: voltar para a tela inicial não perde a data de teste', () => {
    const relogio = TestBed.inject(Relogio);
    relogio.iniciar('?hoje=2027-02-06T14:00');
    relogio.iniciar('');
    expect(relogio.agora()).toEqual(new Date(2027, 1, 6, 14, 0));
    expect(relogio.simulado()).toBe(true);
  });
});
