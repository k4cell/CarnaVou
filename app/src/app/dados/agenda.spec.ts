import { CartaoDoLugar, cartoesDaAba, diaIso, diaSeguinte, horaIso } from './agenda';
import { BLOCOS } from './blocos';
import { LOCAIS } from './locais';

/** Os selos de cada lugar, no formato { id: selo }, para os testes ficarem fáceis de ler. */
function selos(cartoes: CartaoDoLugar[]): Record<string, string> {
  return Object.fromEntries(cartoes.map((cartao) => [cartao.local.id, cartao.selo]));
}

// Sábado de carnaval de 2026, duas da tarde. O dia seguinte é o domingo, 15/02.
const SABADO_14H = new Date(2026, 1, 14, 14, 0);

describe('agenda', () => {
  describe('datas', () => {
    it('escreve o dia e a hora do jeito dos dados', () => {
      expect(diaIso(new Date(2026, 1, 14, 9, 5))).toBe('2026-02-14');
      expect(horaIso(new Date(2026, 1, 14, 9, 5))).toBe('09:05');
    });

    it('passa para o dia seguinte, inclusive na virada do mês', () => {
      expect(diaIso(diaSeguinte(new Date(2026, 0, 31)))).toBe('2026-02-01');
    });
  });

  describe('sem saber a data (servidor e primeira pintura)', () => {
    it('mostra só a aba Geral, com todos os lugares e a conta dos blocos', () => {
      expect(cartoesDaAba('hoje', null)).toEqual([]);
      expect(cartoesDaAba('amanha', null)).toEqual([]);

      const geral = cartoesDaAba('geral', null);
      expect(geral.length).toBe(LOCAIS.length);
      expect(selos(geral)['ibirapuera']).toBe('15 blocos');
      expect(selos(geral)['santo-amaro']).toBe('1 bloco');
    });
  });

  describe('na data de demonstração (sexta, 30/01/2026, antes do pré-carnaval)', () => {
    const sexta = new Date(2026, 0, 30, 12, 0);

    it('não tem bloco hoje nem amanhã', () => {
      expect(cartoesDaAba('hoje', sexta)).toEqual([]);
      expect(cartoesDaAba('amanha', sexta)).toEqual([]);
    });

    it('mostra em Geral a conta dos blocos de cada lugar', () => {
      const geral = selos(cartoesDaAba('geral', sexta));
      for (const local of LOCAIS) {
        const total = BLOCOS.filter((bloco) => bloco.localId === local.id).length;
        expect(geral[local.id]).toBe(total === 1 ? '1 bloco' : `${total} blocos`);
      }
    });
  });

  describe('aba Hoje, num sábado de carnaval às 14h', () => {
    const hoje = selos(cartoesDaAba('hoje', SABADO_14H));

    it('mostra só os lugares com bloco naquele dia', () => {
      const comBlocoNoDia = new Set(
        BLOCOS.filter((bloco) => bloco.data === '2026-02-14').map((bloco) => bloco.localId),
      );
      expect(Object.keys(hoje).sort()).toEqual([...comBlocoNoDia].sort());
      expect(Object.keys(hoje).length).toBe(6);
    });

    it('diz "Já começou" quando o bloco está rolando', () => {
      // Agrada Gregos: 13h às 18h.
      expect(hoje['ibirapuera']).toBe('Já começou');
    });

    it('conta como rolando o bloco que começou e não tem hora de fim', () => {
      // Megabloco Emo começa às 13h e não tem fim.
      expect(hoje['paulo-vi']).toBe('Já começou');
    });

    it('mostra os artistas só do dia', () => {
      const ibirapuera = cartoesDaAba('hoje', SABADO_14H).find((c) => c.local.id === 'ibirapuera');
      expect(ibirapuera?.principal).toBe('Gloria Groove');
      expect(ibirapuera?.resto).toBe(', Gretchen');
    });
  });

  describe('aba Hoje, no domingo', () => {
    it('diz a hora quando o bloco de hoje ainda não começou', () => {
      // Bloco 89 (Supla) começa às 13h; ao meio-dia ainda não começou.
      const meioDia = selos(cartoesDaAba('hoje', new Date(2026, 1, 15, 12, 0)));
      expect(meioDia['faria-lima']).toBe('Hoje às 13h');
      expect(meioDia['ibirapuera']).toBe('Já começou');
    });

    it('diz "Já acabou" depois da hora de fim', () => {
      // Teló acaba às 16h e a Pocah às 18h; às 20h já passou tudo no Ibirapuera.
      const noite = selos(cartoesDaAba('hoje', new Date(2026, 1, 15, 20, 0)));
      expect(noite['ibirapuera']).toBe('Já acabou');
      expect(noite['faria-lima']).toBe('Já acabou');
    });
  });

  describe('aba Amanhã', () => {
    it('mostra só os lugares com bloco no dia seguinte, com a hora do primeiro bloco', () => {
      const amanha = selos(cartoesDaAba('amanha', SABADO_14H));
      expect(amanha).toEqual({
        ibirapuera: 'Amanhã às 11h',
        'faria-lima': 'Amanhã às 13h',
        republica: 'Amanhã às 12h',
        pinheiros: 'Amanhã às 10h',
        'centro-historico': 'Amanhã às 14h',
      });
    });

    it('mostra os artistas só do dia seguinte', () => {
      const ibirapuera = cartoesDaAba('amanha', SABADO_14H).find((c) => c.local.id === 'ibirapuera');
      expect(ibirapuera?.principal).toBe('Michel Teló');
      expect(ibirapuera?.resto).toBe(', Pocah');
    });
  });

  describe('aba Geral', () => {
    const geral = selos(cartoesDaAba('geral', SABADO_14H));

    it('mostra todos os lugares, cada um com o seu selo', () => {
      expect(Object.keys(geral).length).toBe(LOCAIS.length);
      expect(geral['ibirapuera']).toBe('Já começou');
      expect(geral['faria-lima']).toBe('Amanhã às 13h');
    });

    it('conta quantos blocos faltam para quem não tem bloco hoje nem amanhã', () => {
      // Consolação ainda tem o Eu Sou do Axé (16/02), a Salete Campari (17/02) e a Pipoca da Rainha (22/02).
      expect(geral['consolacao']).toBe('3 blocos');
      // Henrique Schaumann só tem o Me Lembra Que Eu Vou (16/02) pela frente.
      expect(geral['henrique-schaumann']).toBe('1 bloco');
    });

    it('diz que não tem mais blocos quando todos já passaram', () => {
      expect(geral['santo-amaro']).toBe('Sem mais blocos');
      const depois = selos(cartoesDaAba('geral', new Date(2026, 2, 1, 12, 0)));
      expect(Object.values(depois).every((selo) => selo === 'Sem mais blocos')).toBe(true);
    });

    it('mostra os artistas dos blocos de hoje em diante', () => {
      const ibirapuera = cartoesDaAba('geral', SABADO_14H).find((c) => c.local.id === 'ibirapuera');
      expect(ibirapuera?.principal).toBe('Gloria Groove');
      expect(ibirapuera?.resto).toBe(', Gretchen, Michel Teló e mais 7');
    });

    it('mostra os artistas de todos os blocos quando o dia ainda está longe', () => {
      const ibirapuera = cartoesDaAba('geral', new Date(2026, 0, 30, 12, 0)).find(
        (c) => c.local.id === 'ibirapuera',
      );
      expect(ibirapuera?.principal).toBe('Ivete Sangalo');
      expect(ibirapuera?.resto).toBe(', Mariana Aydar, Alceu Valença e mais 13');
    });

    it('deixa o artista em branco quando o lugar não tem artista divulgado', () => {
      const pauloVi = cartoesDaAba('geral', SABADO_14H).find((c) => c.local.id === 'paulo-vi');
      expect(pauloVi?.principal).toBe('');
      expect(pauloVi?.resto).toBe('');
    });
  });

  describe('faixa de cor', () => {
    it('é sempre a mesma para o mesmo lugar, em qualquer aba', () => {
      const emAmanha = cartoesDaAba('amanha', SABADO_14H).find((c) => c.local.id === 'faria-lima');
      const emGeral = cartoesDaAba('geral', SABADO_14H).find((c) => c.local.id === 'faria-lima');
      expect(emAmanha?.faixa).toBe('verde');
      expect(emGeral?.faixa).toBe(emAmanha?.faixa);
    });

    it('vai do rosa ao azul e recomeça no oitavo lugar', () => {
      const faixas = cartoesDaAba('geral', null).map((cartao) => cartao.faixa);
      expect(faixas.slice(0, 7)).toEqual(['rosa', 'amarelo', 'verde', 'laranja', 'roxo', 'vermelho', 'azul']);
      expect(faixas[7]).toBe('rosa');
    });
  });
});
