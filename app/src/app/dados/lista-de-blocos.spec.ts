import { BLOCOS } from './blocos';
import { famaDoBloco } from './consultas';
import { blocosDaNoite, eDaNoite, secoesDosBlocos } from './lista-de-blocos';

// Sábado de carnaval de 2026, duas da tarde.
const SABADO_14H = new Date(2026, 1, 14, 14, 0);

describe('secoesDosBlocos (a aba Blocos)', () => {
  const titulos = (aba: 'hoje' | 'amanha' | 'geral', agora: Date | null) =>
    secoesDosBlocos(aba, agora).map((secao) => secao.titulo);

  describe('Hoje', () => {
    const [rolando, maisTarde] = secoesDosBlocos('hoje', SABADO_14H);

    it('traz primeiro o que está rolando agora e depois o que ainda vai começar hoje', () => {
      expect(titulos('hoje', SABADO_14H)).toEqual(['Rolando agora', 'Mais tarde hoje']);
      expect(rolando.blocos.every((bloco) => bloco.data === '2026-02-14' && bloco.inicio <= '14:00')).toBe(true);
      expect(maisTarde.blocos.every((bloco) => bloco.data === '2026-02-14' && bloco.inicio > '14:00')).toBe(true);
    });

    it('põe os mais famosos primeiro no que está rolando agora', () => {
      const fama = rolando.blocos.map(famaDoBloco);
      expect(fama).toEqual([...fama].sort((a, b) => b - a));
      expect(rolando.blocos[0].id).toBe('agrada-gregos');
    });

    it('deixa de fora o que já acabou', () => {
      const todos = secoesDosBlocos('hoje', SABADO_14H).flatMap((secao) => secao.blocos);
      // Às 16h, os blocos da Av. Ipiranga das 10h às 15h já acabaram.
      const depois = secoesDosBlocos('hoje', new Date(2026, 1, 14, 16, 0)).flatMap((secao) => secao.blocos);
      expect(depois.length).toBeLessThan(todos.length);
      expect(depois.every((bloco) => !bloco.fim || bloco.fim > '16:00')).toBe(true);
    });

    it('fica vazia num dia sem bloco', () => {
      expect(secoesDosBlocos('hoje', new Date(2026, 0, 30, 12, 0))).toEqual([]);
    });
  });

  it('em Amanhã, traz os blocos do dia seguinte, os mais famosos primeiro', () => {
    const [amanha] = secoesDosBlocos('amanha', SABADO_14H);
    expect(amanha.titulo).toBe('Amanhã');
    expect(amanha.blocos.length).toBe(BLOCOS.filter((bloco) => bloco.data === '2026-02-15').length);
    expect(amanha.blocos[0].id).toBe('bloco-da-pocah');
  });

  it('na Geral, separa por dia, só de hoje em diante (os dias que passaram somem)', () => {
    const secoes = secoesDosBlocos('geral', SABADO_14H);
    expect(secoes[0].titulo).toBe('Sábado, 14 de fevereiro');
    expect(secoes.flatMap((secao) => secao.blocos).every((bloco) => bloco.data >= '2026-02-14')).toBe(true);
  });

  it('sem saber o dia de hoje (a página pronta), a Geral traz todos os blocos', () => {
    expect(secoesDosBlocos('geral', null).flatMap((secao) => secao.blocos).length).toBe(BLOCOS.length);
    expect(secoesDosBlocos('hoje', null)).toEqual([]);
  });
});

describe('blocosDaNoite (a aba After)', () => {
  // Sábado, 07/02/2026, meio-dia: o "hoje" de demonstração.
  const SABADO_7 = new Date(2026, 1, 7, 12, 0);
  const nomes = (aba: 'hoje' | 'amanha' | 'geral', agora: Date | null) =>
    blocosDaNoite(aba, agora).map((bloco) => bloco.nome);

  it('é da noite o bloco que começa a partir das 16h ou vai até as 20h ou mais', () => {
    const daNoite = BLOCOS.filter(eDaNoite);
    expect(daNoite.length).toBeGreaterThan(0);
    for (const bloco of daNoite) {
      const vaiANoite = !!bloco.fim && (bloco.fim >= '20:00' || bloco.fim <= bloco.inicio);
      expect(bloco.inicio >= '16:00' || vaiANoite, bloco.nome).toBe(true);
    }
    expect(eDaNoite(BLOCOS.find((bloco) => bloco.id === 'carnafacul-quem-pede-pede')!)).toBe(false);
  });

  it('em Hoje e Amanhã, só os blocos da noite do dia', () => {
    expect(nomes('hoje', SABADO_7)).toEqual(['Blocos dos Sem Tetos']);
    expect(nomes('amanha', SABADO_7)).toEqual(['Banda do Fuxico']);
  });

  it('o que já acabou hoje sai da lista', () => {
    expect(nomes('hoje', new Date(2026, 1, 7, 18, 30))).toEqual([]);
  });

  it('na Geral, de hoje em diante, em ordem de data e hora', () => {
    const datas = blocosDaNoite('geral', SABADO_7).map((bloco) => bloco.data + bloco.inicio);
    expect(datas.length).toBe(BLOCOS.filter(eDaNoite).length);
    expect(datas).toEqual([...datas].sort());
    expect(blocosDaNoite('geral', new Date(2026, 1, 12, 12, 0)).every((bloco) => bloco.data >= '2026-02-12')).toBe(true);
  });

  it('sem saber o dia (a página pronta), a Geral traz todos e as outras abas ficam vazias', () => {
    expect(blocosDaNoite('geral', null).length).toBe(BLOCOS.filter(eDaNoite).length);
    expect(blocosDaNoite('hoje', null)).toEqual([]);
  });
});
