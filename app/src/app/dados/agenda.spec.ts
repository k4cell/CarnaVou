import { CartaoDoLugar, blocosDaAba, cartoesDaAba, diaIso, diaSeguinte, horaIso } from './agenda';
import { BLOCOS } from './blocos';
import { LOCAIS } from './locais';

/** Os selos de cada lugar, no formato { id: selo }, para os testes ficarem fáceis de ler. */
function selos(cartoes: CartaoDoLugar[]): Record<string, string> {
  return Object.fromEntries(cartoes.map((cartao) => [cartao.local.id, cartao.selo]));
}

/** Os lugares que têm bloco no dia (AAAA-MM-DD). */
function lugaresDoDia(dia: string): string[] {
  return [...new Set(BLOCOS.filter((bloco) => bloco.data === dia).map((bloco) => bloco.localId))];
}

const quantosNoDia = (localId: string, dia: string) =>
  BLOCOS.filter((bloco) => bloco.localId === localId && bloco.data === dia).length;

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
      expect(geral.map((cartao) => cartao.local.id)).toEqual(LOCAIS.map((local) => local.id));
      expect(selos(geral)['ipiranga-sao-joao']).toBe(
        `${BLOCOS.filter((bloco) => bloco.localId === 'ipiranga-sao-joao').length} blocos`,
      );
      expect(selos(geral)['santo-amaro']).toBe('1 bloco');
    });
  });

  describe('num dia sem bloco (sexta, 30/01/2026, antes do pré-carnaval)', () => {
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
    const cartoes = cartoesDaAba('hoje', SABADO_14H);
    const hoje = selos(cartoes);

    it('mostra só os lugares com bloco naquele dia', () => {
      expect(Object.keys(hoje).sort()).toEqual(lugaresDoDia('2026-02-14').sort());
    });

    it('põe primeiro os lugares com os artistas mais famosos do dia e, depois, os com mais blocos', () => {
      // O Ibirapuera tem a Gloria Groove; a Av. Ipiranga, a Lia Clark; Faria Lima e Paulo VI,
      // ninguém conhecido (e empatam em dois blocos cada).
      expect(cartoes.map((cartao) => cartao.local.id)).toEqual(['ibirapuera', 'ipiranga-sao-joao', 'faria-lima', 'paulo-vi']);
    });

    it('diz "Já começou" quando o bloco está rolando', () => {
      // Agrada Gregos, na Ibirapuera: 13h às 18h.
      expect(hoje['ibirapuera']).toBe('Já começou');
    });

    it('mostra os artistas só do dia', () => {
      const ibirapuera = cartoes.find((c) => c.local.id === 'ibirapuera');
      expect(ibirapuera?.rotulo).toBe('Artistas');
      expect(ibirapuera?.principal).toBe('Gloria Groove');
      expect(ibirapuera?.resto).toBe(', Gretchen');
    });

    it('sem artista conhecido, mostra os nomes dos blocos do dia', () => {
      const semArtista = cartoes.find((c) =>
        BLOCOS.every((bloco) => bloco.localId !== c.local.id || bloco.data !== '2026-02-14' || !bloco.atracoes.length),
      )!;
      const doDia = BLOCOS.filter((bloco) => bloco.localId === semArtista.local.id && bloco.data === '2026-02-14');
      expect(semArtista.rotulo).toBe('Blocos');
      expect(doDia.map((bloco) => bloco.nome)).toContain(semArtista.principal);
    });
  });

  describe('aba Hoje, no domingo', () => {
    it('diz a hora quando o bloco de hoje ainda não começou', () => {
      // Na Ibirapuera, o primeiro bloco do domingo (Sertanejinho do Teló) concentra às 11h.
      const cedo = selos(cartoesDaAba('hoje', new Date(2026, 1, 15, 8, 0)));
      expect(cedo['ibirapuera']).toBe('Hoje às 11h');
    });

    it('diz "Já acabou" depois da hora de fim', () => {
      // Na Ibirapuera, o último bloco do domingo termina às 18h.
      const noite = selos(cartoesDaAba('hoje', new Date(2026, 1, 15, 20, 0)));
      expect(noite['ibirapuera']).toBe('Já acabou');
    });
  });

  describe('um bloco que termina à meia-noite', () => {
    it('conta como rolando até o fim do dia', () => {
      // Banda do Candinho, na República, quarta 11/02: 19h até 0h.
      const noite = selos(cartoesDaAba('hoje', new Date(2026, 1, 11, 23, 0)));
      expect(noite['ipiranga-sao-joao']).toBe('Já começou');
    });
  });

  describe('aba Amanhã', () => {
    it('mostra só os lugares com bloco no dia seguinte, com a hora do primeiro bloco', () => {
      const amanha = selos(cartoesDaAba('amanha', SABADO_14H));
      expect(Object.keys(amanha).sort()).toEqual(lugaresDoDia('2026-02-15').sort());
      expect(amanha['ibirapuera']).toBe('Amanhã às 11h');
      expect(Object.values(amanha).every((selo) => selo.startsWith('Amanhã às '))).toBe(true);
    });

    it('mostra os artistas só do dia seguinte, o mais famoso primeiro', () => {
      const ibirapuera = cartoesDaAba('amanha', SABADO_14H).find((c) => c.local.id === 'ibirapuera');
      expect(ibirapuera?.principal).toBe('Pocah');
      expect(ibirapuera?.resto).toBe(', Michel Teló');
    });
  });

  describe('aba Geral', () => {
    const geral = selos(cartoesDaAba('geral', SABADO_14H));

    it('mostra todos os lugares, na ordem dos lugares, cada um com o seu selo', () => {
      expect(cartoesDaAba('geral', SABADO_14H).map((c) => c.local.id)).toEqual(LOCAIS.map((local) => local.id));
      expect(geral['ibirapuera']).toBe('Já começou');
    });

    it('conta quantos blocos faltam para quem não tem bloco hoje nem amanhã', () => {
      const semHojeNemAmanha = LOCAIS.find(
        (local) => quantosNoDia(local.id, '2026-02-14') === 0 && quantosNoDia(local.id, '2026-02-15') === 0,
      )!;
      const faltam = BLOCOS.filter((bloco) => bloco.localId === semHojeNemAmanha.id && bloco.data > '2026-02-15');
      expect(geral[semHojeNemAmanha.id]).toBe(
        faltam.length === 0 ? 'Sem mais blocos' : faltam.length === 1 ? '1 bloco' : `${faltam.length} blocos`,
      );
    });

    it('diz que não tem mais blocos quando todos já passaram', () => {
      const depois = selos(cartoesDaAba('geral', new Date(2026, 2, 1, 12, 0)));
      expect(Object.values(depois).every((selo) => selo === 'Sem mais blocos')).toBe(true);
    });

    it('mostra os artistas dos blocos de hoje em diante, o mais famoso primeiro', () => {
      const ibirapuera = cartoesDaAba('geral', SABADO_14H).find((c) => c.local.id === 'ibirapuera');
      expect(ibirapuera?.principal).toBe('Léo Santana');
      expect(ibirapuera?.resto).toMatch(/^, Pocah, Pabllo Vittar e mais \d+$/);
    });

    it('mostra os artistas de todos os blocos quando o dia ainda está longe', () => {
      const ibirapuera = cartoesDaAba('geral', new Date(2026, 0, 30, 12, 0)).find(
        (c) => c.local.id === 'ibirapuera',
      );
      expect(ibirapuera?.principal).toBe('Ivete Sangalo');
    });

    it('mostra os nomes dos blocos quando o lugar não tem artista divulgado', () => {
      const pauloVi = cartoesDaAba('geral', SABADO_14H).find((c) => c.local.id === 'paulo-vi');
      expect(pauloVi?.rotulo).toBe('Blocos');
      expect(BLOCOS.some((bloco) => bloco.localId === 'paulo-vi' && bloco.nome === pauloVi?.principal)).toBe(true);
    });
  });

  describe('faixa de cor', () => {
    it('é sempre a mesma para o mesmo lugar, em qualquer aba', () => {
      const emAmanha = cartoesDaAba('amanha', SABADO_14H).find((c) => c.local.id === 'faria-lima');
      const emGeral = cartoesDaAba('geral', SABADO_14H).find((c) => c.local.id === 'faria-lima');
      expect(emAmanha?.faixa).toBe('laranja');
      expect(emGeral?.faixa).toBe(emAmanha?.faixa);
    });

    it('vai do rosa ao azul, na ordem dos lugares', () => {
      const faixas = cartoesDaAba('geral', null).map((cartao) => cartao.faixa);
      expect(faixas).toEqual(['rosa', 'amarelo', 'verde', 'laranja', 'roxo', 'vermelho', 'azul'].slice(0, faixas.length));
    });
  });

  describe('blocosDaAba', () => {
    const daVilaMariana = BLOCOS.filter((bloco) => bloco.localId === 'ibirapuera');

    it('na aba Hoje, traz só os blocos do lugar de hoje', () => {
      const blocos = blocosDaAba('hoje', 'ibirapuera', SABADO_14H);
      expect(blocos.map((bloco) => bloco.id).sort()).toEqual(
        daVilaMariana.filter((bloco) => bloco.data === '2026-02-14').map((bloco) => bloco.id).sort(),
      );
      expect(blocos.length).toBeGreaterThan(0);
    });

    it('na aba Amanhã, traz só os de amanhã, em ordem de hora', () => {
      const blocos = blocosDaAba('amanha', 'ibirapuera', SABADO_14H);
      expect(blocos.length).toBeGreaterThan(1);
      expect(blocos.every((bloco) => bloco.data === '2026-02-15')).toBe(true);
      const horas = blocos.map((bloco) => bloco.inicio);
      expect(horas).toEqual([...horas].sort());
    });

    it('na aba Geral, traz os que ainda vão passar, a partir de hoje', () => {
      const blocos = blocosDaAba('geral', 'ibirapuera', SABADO_14H);
      expect(blocos.every((bloco) => bloco.data >= '2026-02-14')).toBe(true);
      expect(blocos.length).toBe(daVilaMariana.filter((bloco) => bloco.data >= '2026-02-14').length);
    });

    it('sem saber o dia de hoje, a Geral traz todos e as outras abas ficam vazias', () => {
      expect(blocosDaAba('geral', 'ibirapuera', null).length).toBe(daVilaMariana.length);
      expect(blocosDaAba('hoje', 'ibirapuera', null)).toEqual([]);
      expect(blocosDaAba('amanha', 'ibirapuera', null)).toEqual([]);
    });

    it('fica vazia num dia em que o lugar não tem bloco', () => {
      const semBlocoNoSabado = LOCAIS.find((local) => quantosNoDia(local.id, '2026-02-14') === 0)!;
      expect(blocosDaAba('hoje', semBlocoNoSabado.id, SABADO_14H)).toEqual([]);
    });
  });
});
