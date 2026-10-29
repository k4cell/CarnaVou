import { distanciaEmMetros } from '../localizacao/distancia';
import { estaNaGrandeSP } from '../mapa/limites';
import { BLOCOS } from './blocos';
import { CIRCUITOS } from './circuitos';
import { acharLocal, artistasDoLugar, faixaDoLocal } from './consultas';
import { LOCAIS } from './locais';
import { circuitoDoLocal } from './trajetos';

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

  describe('circuitos dos megablocos', () => {
    it('tem os seis circuitos que a CET publicou com começo e fim, um por lugar', () => {
      expect(CIRCUITOS.map((circuito) => circuito.localId).sort()).toEqual(
        ['consolacao', 'faria-lima', 'henrique-schaumann', 'ibirapuera', 'ipiranga-sao-joao', 'paulo-vi'],
      );
    });

    it('não tem circuito nos lugares sem trajeto nas fontes', () => {
      for (const id of ['santo-amaro', 'republica', 'pinheiros', 'centro-historico']) {
        expect(circuitoDoLocal(id), id).toBeUndefined();
      }
    });

    it('cada circuito tem descrição, fonte e uma linha de verdade, dentro da Grande SP', () => {
      for (const circuito of CIRCUITOS) {
        expect(acharLocal(circuito.localId), circuito.localId).toBeDefined();
        expect(circuito.descricao.length, circuito.localId).toBeGreaterThan(10);
        expect(circuito.fonte, circuito.localId).toContain('CET');
        expect(circuito.trajeto.length, circuito.localId).toBeGreaterThanOrEqual(2);
        for (const [lng, lat] of circuito.trajeto) {
          expect(estaNaGrandeSP(lat, lng), circuito.localId).toBe(true);
        }
      }
    });

    it('cada circuito passa perto do pino do lugar (a menos de 1,5 km)', () => {
      for (const circuito of CIRCUITOS) {
        const local = acharLocal(circuito.localId)!;
        const maisPerto = Math.min(...circuito.trajeto.map(([lng, lat]) => distanciaEmMetros(local, { lat, lng })));
        expect(maisPerto, circuito.localId).toBeLessThan(1500);
      }
    });
  });

  it('só guarda o endereço de concentração em texto, quando a fonte deu', () => {
    const comEndereco = BLOCOS.filter((bloco) => bloco.concentracao).map((bloco) => bloco.id);
    expect(comEndereco.sort()).toEqual(
      ['megabloco-emo', 'minhoqueens', 'pipoca-da-rainha', 'tarado-ni-voce', 'vem-com-o-gigante'],
    );
  });

  describe('faixaDoLocal', () => {
    it('reveza as sete cores, do rosa ao azul, na ordem dos lugares', () => {
      const faixas = LOCAIS.map((local) => faixaDoLocal(local.id));
      expect(faixas.slice(0, 7)).toEqual(['rosa', 'amarelo', 'verde', 'laranja', 'roxo', 'vermelho', 'azul']);
      expect(faixas[7]).toBe('rosa');
    });

    it('dá a mesma cor para o mesmo lugar, sempre', () => {
      expect(faixaDoLocal('consolacao')).toBe('amarelo');
      expect(faixaDoLocal('consolacao')).toBe(faixaDoLocal('consolacao'));
    });

    it('cai na primeira cor para um lugar que não existe', () => {
      expect(faixaDoLocal('lugar-que-nao-existe')).toBe('rosa');
    });
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
