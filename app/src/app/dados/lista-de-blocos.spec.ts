import { BLOCOS } from './blocos';
import { famaDoBloco } from './consultas';
import { blocosDaNoite, eDaNoite, secoesDosBlocos } from './lista-de-blocos';
import { Bloco } from './tipos';

// Sábado de carnaval de 2026, duas da tarde.
const SABADO_14H = new Date(2026, 1, 14, 14, 0);

describe('secoesDosBlocos (a aba Blocos)', () => {
  const titulos = (aba: 'hoje' | 'amanha' | 'geral', agora: Date | null) =>
    secoesDosBlocos(aba, agora).map((secao) => secao.titulo);
  const todos = (aba: 'hoje' | 'amanha' | 'geral', agora: Date | null) =>
    secoesDosBlocos(aba, agora).flatMap((secao) => secao.grupos.flat());
  const ids = (grupo: Bloco[]) => grupo.map((bloco) => bloco.id);

  describe('Hoje', () => {
    const [rolando] = secoesDosBlocos('hoje', SABADO_14H);

    it('traz primeiro o que está rolando agora e depois o que ainda vai começar hoje', () => {
      // Sábado, 07/02, às 10h: só o Ibirapuera já começou; os outros circuitos abrem às 11h.
      const dezDaManha = new Date(2026, 1, 7, 10, 0);
      const [agora, depois] = secoesDosBlocos('hoje', dezDaManha);
      expect(titulos('hoje', dezDaManha)).toEqual(['Rolando agora', 'Mais tarde hoje']);
      expect(agora.grupos.every((grupo) => grupo[0].inicio <= '10:00')).toBe(true);
      expect(depois.grupos.flat().every((bloco) => bloco.inicio > '10:00')).toBe(true);
      expect(todos('hoje', dezDaManha).every((bloco) => bloco.data === '2026-02-07')).toBe(true);
    });

    it('põe os mais famosos primeiro no que está rolando agora', () => {
      const fama = rolando.grupos.map((grupo) =>
        Math.max(...grupo.filter((bloco) => bloco.inicio <= '14:00').map(famaDoBloco)),
      );
      expect(fama).toEqual([...fama].sort((a, b) => b - a));
      expect(ids(rolando.grupos[0])).toContain('agrada-gregos');
    });

    it('deixa de fora o que já acabou', () => {
      // Às 16h, os blocos da Av. Ipiranga das 10h às 15h já acabaram.
      const depois = todos('hoje', new Date(2026, 1, 14, 16, 0));
      expect(depois.length).toBeLessThan(todos('hoje', SABADO_14H).length);
      expect(depois.every((bloco) => !bloco.fim || bloco.fim > '16:00')).toBe(true);
    });

    it('junta os blocos do mesmo dia no mesmo circuito, por horário, mesmo os que ainda vão começar', () => {
      // Sábado, 07/02, meio-dia, no Ibirapuera: Quem Pede, Pede (9h) e Forrozin (12h) estão rolando,
      // e o Bicho Maluco Beleza começa às 14h ali mesmo.
      const meioDia = new Date(2026, 1, 7, 12, 0);
      const [rolandoAoMeioDia] = secoesDosBlocos('hoje', meioDia);
      expect(rolandoAoMeioDia.grupos.map(ids)).toContainEqual([
        'carnafacul-quem-pede-pede',
        'forrozin',
        'bicho-maluco-beleza-com-alceu-valenca',
      ]);
      expect(ids(todos('hoje', meioDia)).filter((id) => id === 'bicho-maluco-beleza-com-alceu-valenca').length).toBe(1);
    });

    it('não repete nem perde bloco ao juntar', () => {
      const lista = ids(todos('hoje', SABADO_14H));
      expect(new Set(lista).size).toBe(lista.length);
    });

    it('fica vazia num dia sem bloco', () => {
      expect(secoesDosBlocos('hoje', new Date(2026, 0, 30, 12, 0))).toEqual([]);
    });
  });

  it('em Amanhã, traz os blocos do dia seguinte, os mais famosos primeiro', () => {
    const [amanha] = secoesDosBlocos('amanha', SABADO_14H);
    expect(amanha.titulo).toBe('Amanhã');
    expect(amanha.grupos.flat().length).toBe(BLOCOS.filter((bloco) => bloco.data === '2026-02-15').length);
    // A Pocah, no Ibirapuera, junto com o Sertanejinho do Teló, que começa antes ali mesmo.
    expect(ids(amanha.grupos[0])).toEqual(['sertanejinho-do-telo', 'bloco-da-pocah']);
  });

  it('não junta blocos de ruas diferentes num lugar que é uma subprefeitura', () => {
    // Domingo, 08/02, em Santana/Tucuruvi: três blocos, cada um numa rua.
    const [amanha] = secoesDosBlocos('amanha', new Date(2026, 1, 7, 12, 0));
    const deSantana = amanha.grupos.filter((grupo) => grupo[0].localId === 'santana-tucuruvi');
    expect(deSantana.length).toBe(3);
    expect(deSantana.every((grupo) => grupo.length === 1)).toBe(true);
  });

  it('na Geral, separa por dia, só de hoje em diante (os dias que passaram somem)', () => {
    const secoes = secoesDosBlocos('geral', SABADO_14H);
    expect(secoes[0].titulo).toBe('Sábado, 14 de fevereiro');
    expect(todos('geral', SABADO_14H).every((bloco) => bloco.data >= '2026-02-14')).toBe(true);
  });

  it('sem saber o dia de hoje (a página pronta), a Geral traz todos os blocos', () => {
    expect(todos('geral', null).length).toBe(BLOCOS.length);
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
    expect(nomes('amanha', SABADO_7)).toEqual(['Banda do Fuxico', "Banda Grone's - G.C.E. Grone's"]);
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
