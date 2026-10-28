import { CartaoDoLugar, cartoesDaAba, diaIso, diaSeguinte, horaIso } from './agenda';
import { BLOCOS } from './blocos';
import { LOCAIS } from './locais';

/** Os selos de cada lugar, no formato { id: selo }, para os testes ficarem fáceis de ler. */
function selos(cartoes: CartaoDoLugar[]): Record<string, string> {
  return Object.fromEntries(cartoes.map((cartao) => [cartao.local.id, cartao.selo]));
}

// Sábado de carnaval de 2027, duas da tarde.
const SABADO_14H = new Date(2027, 1, 6, 14, 0);

describe('agenda', () => {
  describe('datas', () => {
    it('escreve o dia e a hora do jeito dos dados', () => {
      expect(diaIso(new Date(2027, 1, 6, 9, 5))).toBe('2027-02-06');
      expect(horaIso(new Date(2027, 1, 6, 9, 5))).toBe('09:05');
    });

    it('passa para o dia seguinte, inclusive na virada do mês', () => {
      expect(diaIso(diaSeguinte(new Date(2027, 0, 31)))).toBe('2027-02-01');
    });
  });

  describe('sem saber a data (servidor e primeira pintura)', () => {
    it('mostra só a aba Geral, com todos os lugares e a conta dos blocos', () => {
      expect(cartoesDaAba('hoje', null)).toEqual([]);
      expect(cartoesDaAba('amanha', null)).toEqual([]);

      const geral = cartoesDaAba('geral', null);
      expect(geral.length).toBe(LOCAIS.length);
      expect(selos(geral)['ibirapuera']).toBe('4 blocos');
      expect(selos(geral)['ipiranga-sao-joao']).toBe('2 blocos');
    });
  });

  describe('aba Hoje, num sábado de carnaval às 14h', () => {
    const hoje = selos(cartoesDaAba('hoje', SABADO_14H));

    it('mostra só os lugares com bloco naquele dia', () => {
      const comBlocoNoDia = new Set(
        BLOCOS.filter((bloco) => bloco.data === '2027-02-06').map((bloco) => bloco.localId),
      );
      expect(Object.keys(hoje).sort()).toEqual([...comBlocoNoDia].sort());
      expect(Object.keys(hoje).length).toBe(5);
    });

    it('diz "Já começou" quando o bloco está rolando', () => {
      // Megabloco do Ibira: 13h às 20h.
      expect(hoje['ibirapuera']).toBe('Já começou');
    });

    it('conta como rolando o bloco que começou e não tem hora de fim', () => {
      // Samba do Escritório começa às 11h e não tem fim.
      expect(hoje['berrini']).toBe('Já começou');
    });

    it('diz a hora quando o bloco de hoje ainda não começou', () => {
      // Marchinha Sem Juízo: 16h.
      expect(hoje['faria-lima']).toBe('Hoje às 16h');
    });

    it('diz "Já acabou" depois da hora de fim', () => {
      // Megabloco do Ibira acaba às 20h; às 21h já passou.
      const noite = selos(cartoesDaAba('hoje', new Date(2027, 1, 6, 21, 0)));
      expect(noite['ibirapuera']).toBe('Já acabou');
    });

    it('mostra os artistas só do dia', () => {
      const ibirapuera = cartoesDaAba('hoje', SABADO_14H).find((c) => c.local.id === 'ibirapuera');
      expect(ibirapuera?.principal).toBe('Banda Serpentina');
      expect(ibirapuera?.resto).toBe(', Mariana Tamborim, DJ Purpurina');
    });
  });

  describe('aba Amanhã', () => {
    it('mostra só os lugares com bloco no dia seguinte, com a hora do primeiro bloco', () => {
      const amanha = selos(cartoesDaAba('amanha', SABADO_14H));
      expect(Object.keys(amanha).sort()).toEqual(
        ['berrini', 'consolacao', 'ibirapuera', 'minhocao', 'paulo-vi', 'republica'].sort(),
      );
      expect(amanha).toEqual({
        ibirapuera: 'Amanhã às 12h',
        consolacao: 'Amanhã às 14h',
        berrini: 'Amanhã às 14h',
        republica: 'Amanhã às 18h',
        minhocao: 'Amanhã às 15h',
        'paulo-vi': 'Amanhã às 14h',
      });
    });

    it('mostra os artistas só do dia seguinte', () => {
      const consolacao = cartoesDaAba('amanha', SABADO_14H).find((c) => c.local.id === 'consolacao');
      expect(consolacao?.principal).toBe('Banda Serpentina');
      expect(consolacao?.resto).toBe(', Zeca Tamborim');
    });
  });

  describe('aba Geral', () => {
    const geral = selos(cartoesDaAba('geral', SABADO_14H));

    it('mostra todos os lugares, cada um com o seu selo', () => {
      expect(Object.keys(geral).length).toBe(LOCAIS.length);
      expect(geral['ibirapuera']).toBe('Já começou');
      expect(geral['faria-lima']).toBe('Hoje às 16h');
      expect(geral['consolacao']).toBe('Amanhã às 14h');
    });

    it('conta quantos blocos faltam para quem não tem bloco hoje nem amanhã', () => {
      // Henrique Schaumann tem blocos em 30/01 (já passou) e 08/02 (falta 1).
      expect(geral['henrique-schaumann']).toBe('1 bloco');
    });

    it('diz que não tem mais blocos quando todos já passaram', () => {
      const depois = selos(cartoesDaAba('geral', new Date(2027, 1, 20, 12, 0)));
      expect(depois['ibirapuera']).toBe('Sem mais blocos');
    });

    it('conta todos os blocos quando a data ainda está longe', () => {
      const longe = selos(cartoesDaAba('geral', new Date(2026, 9, 28, 12, 0)));
      expect(longe['ibirapuera']).toBe('4 blocos');
      expect(longe['republica']).toBe('2 blocos');
    });

    it('mostra os artistas da semana do carnaval', () => {
      const ibirapuera = cartoesDaAba('geral', SABADO_14H).find((c) => c.local.id === 'ibirapuera');
      expect(ibirapuera?.resto).toBe(', Mariana Tamborim, DJ Purpurina e mais 4');
    });
  });

  describe('faixa de cor', () => {
    it('é sempre a mesma para o mesmo lugar, em qualquer aba', () => {
      const emHoje = cartoesDaAba('hoje', SABADO_14H).find((c) => c.local.id === 'berrini');
      const emGeral = cartoesDaAba('geral', SABADO_14H).find((c) => c.local.id === 'berrini');
      expect(emHoje?.faixa).toBe('laranja');
      expect(emGeral?.faixa).toBe(emHoje?.faixa);
    });

    it('vai do rosa ao azul e recomeça no oitavo lugar', () => {
      const faixas = cartoesDaAba('geral', null).map((cartao) => cartao.faixa);
      expect(faixas.slice(0, 7)).toEqual(['rosa', 'amarelo', 'verde', 'laranja', 'roxo', 'vermelho', 'azul']);
      expect(faixas[7]).toBe('rosa');
    });
  });
});
