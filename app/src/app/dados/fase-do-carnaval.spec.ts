import { diasAte, diasDoCarnaval, faseDoCarnaval } from './fase-do-carnaval';

describe('a fase do carnaval', () => {
  it('vai do primeiro ao último dia com bloco', () => {
    // Nos dados de teste de 2026: do sábado, 07/02, ao domingo, 22/02.
    expect(diasDoCarnaval()).toEqual({ primeiro: '2026-02-07', ultimo: '2026-02-22' });
  });

  it('é "antes" até a véspera do primeiro bloco', () => {
    expect(faseDoCarnaval(new Date(2026, 0, 20, 12, 0))).toBe('antes');
    expect(faseDoCarnaval(new Date(2026, 1, 6, 23, 59))).toBe('antes');
  });

  it('é "durante" do primeiro dia até o último bloco acabar, mesmo nos dias sem bloco no meio', () => {
    expect(faseDoCarnaval(new Date(2026, 1, 7, 0, 0))).toBe('durante');
    expect(faseDoCarnaval(new Date(2026, 1, 19, 12, 0))).toBe('durante');
    expect(faseDoCarnaval(new Date(2026, 1, 22, 17, 59))).toBe('durante');
  });

  it('é "depois" assim que o último bloco do último dia acaba', () => {
    expect(faseDoCarnaval(new Date(2026, 1, 22, 18, 0))).toBe('depois');
    expect(faseDoCarnaval(new Date(2026, 2, 10, 12, 0))).toBe('depois');
  });

  it('não sabe a fase na página pronta, que não sabe o dia de hoje', () => {
    expect(faseDoCarnaval(null)).toBeNull();
  });

  it('conta os dias no calendário: amanhã é 1, mesmo tarde da noite', () => {
    expect(diasAte('2026-02-07', new Date(2026, 1, 6, 23, 30))).toBe(1);
    expect(diasAte('2026-02-07', new Date(2026, 0, 28, 8, 0))).toBe(10);
  });
});
