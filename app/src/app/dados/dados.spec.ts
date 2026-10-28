import { BLOCOS } from './blocos';
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

  it('põe os blocos entre o pré-carnaval e o pós-carnaval de 2027', () => {
    expect(BLOCOS.every((bloco) => bloco.data >= '2027-01-30' && bloco.data <= '2027-02-14')).toBe(true);
  });

  it('só tem hora de fim depois da hora de início', () => {
    const comFim = BLOCOS.filter((bloco) => bloco.fim);
    expect(comFim.length).toBeGreaterThan(0);
    expect(comFim.every((bloco) => (bloco.fim ?? '') > bloco.inicio)).toBe(true);
  });

  it('todo bloco tem pelo menos uma atração', () => {
    expect(BLOCOS.every((bloco) => bloco.atracoes.length > 0)).toBe(true);
  });
});
