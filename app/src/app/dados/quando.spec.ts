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
  it('rolando: até quando vai', () => {
    expect(quandoComeca(bloco('2026-02-14', '13:00', '18:00'), AGORA)).toEqual({
      texto: 'Rolando agora, até 18h',
      rotulo: 'Até',
      hora: '18h',
      tipo: 'agora',
    });
  });

  it('rolando sem a hora do fim: desde quando', () => {
    expect(quandoComeca(bloco('2026-02-14', '13:30'), AGORA)).toEqual({
      texto: 'Rolando agora, desde as 13h30',
      rotulo: 'Desde',
      hora: '13h30',
      tipo: 'agora',
    });
  });

  it('mais tarde hoje: a hora, sem contar os minutos que faltam', () => {
    expect(quandoComeca(bloco('2026-02-14', '14:35'), AGORA)).toEqual({
      texto: 'Hoje às 14h35',
      rotulo: 'Hoje',
      hora: '14h35',
      tipo: 'hoje',
    });
    expect(quandoComeca(bloco('2026-02-14', '16:30'), AGORA).texto).toBe('Hoje às 16h30');
  });

  it('amanhã e nos outros dias: o dia e a hora', () => {
    expect(quandoComeca(bloco('2026-02-15', '10:00'), AGORA)).toEqual({
      texto: 'Amanhã às 10h',
      rotulo: 'Amanhã',
      hora: '10h',
      tipo: 'outro-dia',
    });
    expect(quandoComeca(bloco('2026-02-21', '13:00'), AGORA)).toEqual({
      texto: 'sáb 21 fev · 13h',
      rotulo: 'sáb 21',
      hora: '13h',
      tipo: 'outro-dia',
    });
  });
});
