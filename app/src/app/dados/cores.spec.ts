import { BLOCOS } from './blocos';
import { blocosDoLocal } from './consultas';
import { FAIXAS, faixaDoLocal } from './cores';
import { faixaDoBloco } from './cores-dos-cartoes';
import { secoesDosBlocos } from './lista-de-blocos';
import { LOCAIS } from './locais';
import { Bloco } from './tipos';

/** Os cartões da aba Blocos, na ordem da tela: a Geral e, em várias horas de cada dia, o Hoje, o Amanhã e a Geral. */
function cartoesDaAbaBlocos(): Bloco[][][] {
  const dias = [...new Set(BLOCOS.map((bloco) => bloco.data))].sort();
  const momentos = dias.flatMap((dia) =>
    ['09', '10', '12', '14', '15', '17', '18', '20'].map((hora) => new Date(`${dia}T${hora}:00:00`)),
  );
  const cartoes = (aba: 'hoje' | 'amanha' | 'geral', agora: Date | null) =>
    secoesDosBlocos(aba, agora)
      .filter((secao) => secao.titulo !== 'Cancelados')
      .flatMap((secao) => secao.grupos);
  return [
    cartoes('geral', null),
    ...momentos.flatMap((agora) => [cartoes('hoje', agora), cartoes('amanha', agora), cartoes('geral', agora)]),
  ];
}

/** Os pares de vizinhos com a mesma cor, para o erro dizer quais são. */
function vizinhosDaMesmaCor<T>(itens: T[], cor: (item: T) => string, nome: (item: T) => string): string[] {
  return itens.flatMap((item, i) =>
    i > 0 && cor(item) === cor(itens[i - 1]) ? [`${nome(itens[i - 1])} e ${nome(item)}`] : [],
  );
}

describe('as cores das faixas', () => {
  describe('faixaDoBloco', () => {
    it('dá a cada cartão da aba Blocos uma cor diferente da do vizinho, mesmo no mesmo lugar', () => {
      const repetidos = cartoesDaAbaBlocos().flatMap((cartoes) =>
        vizinhosDaMesmaCor(
          cartoes,
          (cartao) => faixaDoBloco(cartao[0]),
          (cartao) => cartao[0].nome,
        ),
      );
      expect(repetidos).toEqual([]);
    });

    it('separa pela cor dois cartões seguidos do mesmo lugar no mesmo dia', () => {
      const doMesmoLugar = cartoesDaAbaBlocos()[0].filter(
        (cartao, i, todos) => i > 0 && cartao[0].localId === todos[i - 1][0].localId,
      );
      expect(doMesmoLugar.length).toBeGreaterThan(0);
    });

    it('dá a mesma cor a todos os blocos de um cartão', () => {
      for (const cartao of cartoesDaAbaBlocos()[0]) {
        expect(new Set(cartao.map(faixaDoBloco)), cartao[0].nome).toEqual(new Set([faixaDoBloco(cartao[0])]));
      }
    });

    it('na página do lugar, não repete a cor de um dia para o outro', () => {
      for (const local of LOCAIS) {
        const blocos = blocosDoLocal(local.id);
        const primeiroDeCadaDia = blocos.filter((bloco, i) => i === 0 || bloco.data !== blocos[i - 1].data);
        expect(vizinhosDaMesmaCor(primeiroDeCadaDia, faixaDoBloco, (bloco) => bloco.data), local.nome).toEqual([]);
      }
    });

    it('não muda quando uma correção troca a data ou o horário do bloco', () => {
      const bloco = BLOCOS[0];
      expect(faixaDoBloco({ ...bloco, data: '2026-03-01', inicio: '23:00' })).toBe(faixaDoBloco(bloco));
    });

    it('usa só as oito cores', () => {
      expect(BLOCOS.every((bloco) => FAIXAS.includes(faixaDoBloco(bloco)))).toBe(true);
      expect(FAIXAS.length).toBe(8);
    });
  });

  describe('faixaDoLocal', () => {
    it('nos bairros do Descobrir, um lugar ao lado do outro tem cor diferente, e o primeiro fica com o rosa', () => {
      const zonas = [...new Set(LOCAIS.map((local) => local.zona))];
      const emOrdem = zonas.flatMap((zona) => LOCAIS.filter((local) => local.zona === zona));
      expect(faixaDoLocal(emOrdem[0].id)).toBe('rosa');
      expect(vizinhosDaMesmaCor(emOrdem, (local) => faixaDoLocal(local.id), (local) => local.nome)).toEqual([]);
    });

    it('cai na primeira cor para um lugar que não existe', () => {
      expect(faixaDoLocal('lugar-que-nao-existe')).toBe('rosa');
    });
  });
});
