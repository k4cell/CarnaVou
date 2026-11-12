import { quandoComeca } from './quando';
import { Bloco } from './tipos';

const bloco = (data: string, inicio: string, fim?: string): Bloco => ({
  id: 'teste',
  nome: 'Teste',
  data,
  inicio,
  fim,
  localId: 'ibirapuera',
  atracoes: [],
});

// Sábado, 14/02/2026, duas da tarde.
const AGORA = new Date(2026, 1, 14, 14, 0);

describe('quandoComeca', () => {
  it('rolando: "Rolando agora"', () => {
    expect(quandoComeca(bloco('2026-02-14', '13:00', '18:00'), AGORA)).toEqual({
      texto: 'Rolando agora',
      dia: 'Agora',
      hora: '13h',
      tipo: 'agora',
    });
  });

  it('começando em até uma hora: conta os minutos', () => {
    expect(quandoComeca(bloco('2026-02-14', '14:35'), AGORA)).toEqual({
      texto: 'Começa em 35 min',
      dia: 'Hoje',
      hora: '35 min',
      tipo: 'hoje',
    });
    expect(quandoComeca(bloco('2026-02-14', '15:00'), AGORA).texto).toBe('Começa em 60 min');
  });

  it('mais tarde hoje: a hora', () => {
    expect(quandoComeca(bloco('2026-02-14', '16:30'), AGORA)).toEqual({
      texto: 'Hoje às 16h30',
      dia: 'Hoje',
      hora: '16h30',
      tipo: 'hoje',
    });
  });

  it('amanhã e nos outros dias: o dia e a hora', () => {
    expect(quandoComeca(bloco('2026-02-15', '10:00'), AGORA)).toEqual({
      texto: 'Amanhã às 10h',
      dia: 'Amanhã',
      hora: '10h',
      tipo: 'outro-dia',
    });
    expect(quandoComeca(bloco('2026-02-21', '13:00'), AGORA)).toEqual({
      texto: 'sáb 21 fev · 13h',
      dia: 'sáb 21',
      hora: '13h',
      tipo: 'outro-dia',
    });
  });
});
