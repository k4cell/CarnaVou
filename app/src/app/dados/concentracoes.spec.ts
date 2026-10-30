import { blocosDaAba } from './agenda';
import { BLOCOS } from './blocos';
import { concentracoesDaAba, idDoPonto } from './concentracoes';
import { LOCAIS } from './locais';
import { trajetoDoBloco } from './trajetos';

// Sábado de carnaval de 2026, duas da tarde.
const SABADO_14H = new Date(2026, 1, 14, 14, 0);

describe('concentracoesDaAba', () => {
  const daAba = (aba: 'hoje' | 'amanha' | 'geral', agora: Date | null) =>
    LOCAIS.flatMap((local) => blocosDaAba(aba, local.id, agora)).filter((bloco) => trajetoDoBloco(bloco.id));

  it('põe todo bloco da aba que tem ponto num ponto só, sem perder nenhum', () => {
    const pontos = concentracoesDaAba('hoje', SABADO_14H);
    const blocosNosPontos = pontos.flatMap((ponto) => ponto.blocos.map((bloco) => bloco.id));
    expect(blocosNosPontos.sort()).toEqual(daAba('hoje', SABADO_14H).map((bloco) => bloco.id).sort());
  });

  it('junta no mesmo ponto os blocos que se concentram no mesmo lugar', () => {
    const pontos = concentracoesDaAba('geral', SABADO_14H);
    expect(pontos.length).toBeLessThan(daAba('geral', SABADO_14H).length);
    for (const ponto of pontos) {
      for (const bloco of ponto.blocos) {
        expect(idDoPonto(trajetoDoBloco(bloco.id)!.inicio), bloco.id).toBe(ponto.id);
      }
    }
  });

  it('põe o ponto na concentração e não repete o trajeto dividido por vários blocos', () => {
    const ibirapuera = concentracoesDaAba('geral', SABADO_14H).find((ponto) =>
      ponto.blocos.some((bloco) => bloco.id === 'agrada-gregos'),
    )!;
    const [lng, lat] = trajetoDoBloco('agrada-gregos')!.inicio;
    expect([ibirapuera.lng, ibirapuera.lat]).toEqual([lng, lat]);
    expect(ibirapuera.local.id).toBe('ibirapuera');
    expect(ibirapuera.blocos.length).toBeGreaterThan(1);
    expect(new Set(ibirapuera.trajetos).size).toBe(ibirapuera.trajetos.length);
  });

  it('deixa os blocos de cada ponto em ordem de data e hora', () => {
    for (const ponto of concentracoesDaAba('geral', null)) {
      const quando = ponto.blocos.map((bloco) => bloco.data + bloco.inicio);
      expect(quando, ponto.id).toEqual([...quando].sort());
    }
  });

  it('fica vazia num dia sem bloco', () => {
    expect(concentracoesDaAba('hoje', new Date(2026, 0, 30, 12, 0))).toEqual([]);
  });

  it('sem saber o dia de hoje, a Geral tem os pontos de todos os blocos', () => {
    const total = concentracoesDaAba('geral', null).reduce((soma, ponto) => soma + ponto.blocos.length, 0);
    expect(total).toBe(BLOCOS.filter((bloco) => trajetoDoBloco(bloco.id)).length);
  });
});
