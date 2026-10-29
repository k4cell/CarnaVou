import { BLOCOS } from './blocos';
import { artistasDoLugar } from './consultas';
import { LOCAIS } from './locais';

describe('dados', () => {
  it('tem 10 lugares em destaque, sem repetir', () => {
    const ids = LOCAIS.map((local) => local.id);
    expect(ids.length).toBe(10);
    expect(new Set(ids).size).toBe(10);
  });

  it('não repete o id de nenhum bloco', () => {
    const ids = BLOCOS.map((bloco) => bloco.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('todo bloco aponta para um lugar que existe', () => {
    const ids = new Set(LOCAIS.map((local) => local.id));
    expect(BLOCOS.every((bloco) => ids.has(bloco.localId))).toBe(true);
  });

  it('todo lugar tem pelo menos um bloco', () => {
    const comBloco = new Set(BLOCOS.map((bloco) => bloco.localId));
    expect(LOCAIS.every((local) => comBloco.has(local.id))).toBe(true);
  });

  it('põe os blocos entre o pré-carnaval e o pós-carnaval de 2026', () => {
    expect(BLOCOS.every((bloco) => bloco.data >= '2026-02-07' && bloco.data <= '2026-02-22')).toBe(true);
  });

  it('só tem hora de fim depois da hora de início', () => {
    const comFim = BLOCOS.filter((bloco) => bloco.fim);
    expect(comFim.length).toBeGreaterThan(0);
    expect(comFim.every((bloco) => (bloco.fim ?? '') > bloco.inicio)).toBe(true);
  });

  it('escreve toda hora no formato HH:mm', () => {
    const formato = /^\d{2}:\d{2}$/;
    const horas = BLOCOS.flatMap((bloco) => [
      bloco.inicio,
      ...(bloco.fim ? [bloco.fim] : []),
      ...bloco.atracoes.flatMap((atracao) => (atracao.inicio ? [atracao.inicio] : [])),
    ]);
    expect(horas.every((hora) => formato.test(hora))).toBe(true);
  });

  it('só marca o público-alvo e o estilo em alguns blocos, quando a fonte diz', () => {
    expect(BLOCOS.some((bloco) => bloco.publico)).toBe(true);
    expect(BLOCOS.some((bloco) => !bloco.publico)).toBe(true);
    expect(BLOCOS.some((bloco) => bloco.estilo)).toBe(true);
    expect(BLOCOS.some((bloco) => !bloco.estilo)).toBe(true);
  });

  it('põe cada lugar na Grande São Paulo, com latitude e longitude', () => {
    expect(
      LOCAIS.every((l) => l.lat > -24.1 && l.lat < -23.2 && l.lng > -47.2 && l.lng < -46.2),
    ).toBe(true);
  });

  it('não repete o mesmo ponto para dois lugares', () => {
    const pontos = LOCAIS.map((l) => `${l.lat},${l.lng}`);
    expect(new Set(pontos).size).toBe(pontos.length);
  });

  describe('artistasDoLugar', () => {
    it('junta os artistas do lugar sem repetir, na ordem dos blocos', () => {
      const artistas = artistasDoLugar('ibirapuera');
      expect(artistas.length).toBe(16);
      expect(new Set(artistas).size).toBe(16);
      expect(artistas.slice(0, 3)).toEqual(['Ivete Sangalo', 'Mariana Aydar', 'Alceu Valença']);
    });

    it('pega só os dos blocos de um dia em diante', () => {
      const artistas = artistasDoLugar('ibirapuera', '2026-02-14');
      expect(artistas.length).toBe(10);
      expect(artistas[0]).toBe('Gloria Groove');
    });

    it('volta a valer a lista toda quando nenhum bloco dali em diante tem artista', () => {
      expect(artistasDoLugar('santo-amaro', '2026-03-01').length).toBe(9);
    });

    it('fica vazio quando o lugar não tem artista divulgado', () => {
      expect(artistasDoLugar('paulo-vi')).toEqual([]);
    });
  });
});
