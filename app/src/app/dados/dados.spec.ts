import { estaNaGrandeSP } from '../mapa/limites';
import { BLOCOS } from './blocos';
import { acharLocal, artistasDoLugar, blocosDoLocal, faixaDoLocal, famaDoBloco } from './consultas';
import { itinerarioDoBloco } from './itinerario';
import { LOCAIS } from './locais';
import { lerLinha, trajetoDoBloco } from './trajetos';

/** As sete cores das faixas, do rosa ao azul. Com mais de sete lugares, elas recomeçam. */
const SETE_CORES = ['rosa', 'amarelo', 'verde', 'laranja', 'roxo', 'vermelho', 'azul'];

describe('dados', () => {
  describe('os lugares', () => {
    it('não repetem o id', () => {
      const ids = LOCAIS.map((local) => local.id);
      expect(ids.length).toBeGreaterThan(3);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('cobrem as cinco zonas da cidade', () => {
      expect(new Set(LOCAIS.map((local) => local.zona))).toEqual(new Set(['centro', 'sul', 'oeste', 'leste', 'norte']));
    });

    it('têm os grandes pontos do carnaval com o nome que o povo conhece', () => {
      const nomes = LOCAIS.map((local) => local.nome);
      expect(nomes).toContain('Parque Ibirapuera');
      expect(nomes).toContain('Rua da Consolação e Baixo Augusta');
      expect(nomes).toContain('Avenida Faria Lima');
    });

    it('vêm em ordem, dos que têm os artistas mais famosos para os menos', () => {
      const fama = LOCAIS.map((local) => blocosDoLocal(local.id).reduce((soma, bloco) => soma + famaDoBloco(bloco), 0));
      expect(fama).toEqual([...fama].sort((a, b) => b - a));
      expect(LOCAIS[0].id).toBe('ibirapuera');
    });

    it('todo lugar tem pelo menos um bloco', () => {
      const comBloco = new Set(BLOCOS.map((bloco) => bloco.localId));
      expect(LOCAIS.every((local) => comBloco.has(local.id))).toBe(true);
    });
  });

  describe('os blocos', () => {
    it('vêm da lista oficial, sem repetir o id', () => {
      const ids = BLOCOS.map((bloco) => bloco.id);
      expect(ids.length).toBeGreaterThan(50);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('só ficam os que têm atração, desfilam num circuito de megabloco ou são destaque na Leste ou na Norte', () => {
      const circuito = /Pedro [ÁA]lvares Cabral|Consola[çc][ãa]o, 2101|Faria Lima, 4100|^Av\.? Ipiranga|Pça\.? ?da Rep[úu]blica|Av\. S[ãa]o Jo[ãa]o|Paulo VI|Henrique Schaumann/i;
      for (const bloco of BLOCOS) {
        const zona = acharLocal(bloco.localId)?.zona;
        const destaque = zona === 'leste' || zona === 'norte';
        expect(bloco.atracoes.length > 0 || circuito.test(itinerarioDoBloco(bloco.id) ?? '') || destaque, bloco.id).toBe(
          true,
        );
      }
    });

    it('todo bloco aponta para um lugar que existe', () => {
      const ids = new Set(LOCAIS.map((local) => local.id));
      expect(BLOCOS.every((bloco) => ids.has(bloco.localId))).toBe(true);
    });

    it('ficam entre o pré-carnaval e o pós-carnaval de 2026', () => {
      expect(BLOCOS.every((bloco) => bloco.data >= '2026-02-06' && bloco.data <= '2026-02-22')).toBe(true);
    });

    it('escreve toda hora no formato HH:mm', () => {
      const formato = /^\d{2}:\d{2}$/;
      const horas = BLOCOS.flatMap((bloco) => [
        bloco.inicio,
        ...(bloco.desfile ? [bloco.desfile] : []),
        ...(bloco.fim ? [bloco.fim] : []),
        ...bloco.atracoes.flatMap((atracao) => (atracao.inicio ? [atracao.inicio] : [])),
      ]);
      expect(horas.every((hora) => formato.test(hora))).toBe(true);
    });

    it('concentra, desfila e termina nessa ordem (ou termina à meia-noite)', () => {
      for (const bloco of BLOCOS) {
        expect(bloco.desfile! >= bloco.inicio, bloco.id).toBe(true);
        expect(bloco.fim! > bloco.desfile! || bloco.fim === '00:00', bloco.id).toBe(true);
      }
    });

    it('todo bloco tem o itinerário oficial em texto', () => {
      expect(BLOCOS.every((bloco) => (itinerarioDoBloco(bloco.id) ?? '').length > 2)).toBe(true);
    });

    it('só marca artistas e estilo em alguns blocos, quando as notícias dizem', () => {
      const comArtista = BLOCOS.filter((bloco) => bloco.atracoes.length > 0);
      expect(comArtista.length).toBeGreaterThan(10);
      expect(comArtista.length).toBeLessThan(BLOCOS.length);
      expect(BLOCOS.some((bloco) => bloco.estilo)).toBe(true);
    });
  });

  describe('os pontos e as linhas', () => {
    const comPonto = BLOCOS.filter((bloco) => trajetoDoBloco(bloco.id));

    it('põem a grande maioria dos blocos no mapa', () => {
      expect(comPonto.length / BLOCOS.length).toBeGreaterThan(0.8);
    });

    it('ficam todos na Grande São Paulo', () => {
      for (const bloco of comPonto) {
        const trajeto = trajetoDoBloco(bloco.id)!;
        for (const [lng, lat] of [trajeto.inicio, ...(trajeto.linha ?? [])]) {
          expect(estaNaGrandeSP(lat, lng), bloco.id).toBe(true);
        }
      }
    });

    it('começam a linha no ponto da concentração', () => {
      for (const bloco of comPonto) {
        const { inicio, linha } = trajetoDoBloco(bloco.id)!;
        if (linha) {
          expect(linha[0], bloco.id).toEqual(inicio);
          expect(linha.length, bloco.id).toBeGreaterThanOrEqual(2);
        }
      }
    });

    it('têm blocos que andam (com linha) e blocos parados (só o ponto)', () => {
      expect(comPonto.some((bloco) => trajetoDoBloco(bloco.id)!.linha)).toBe(true);
      expect(comPonto.some((bloco) => !trajetoDoBloco(bloco.id)!.linha)).toBe(true);
    });

    it('marcam quando o ponto é aproximado', () => {
      expect(comPonto.some((bloco) => trajetoDoBloco(bloco.id)!.aproximado)).toBe(true);
      expect(comPonto.some((bloco) => !trajetoDoBloco(bloco.id)!.aproximado)).toBe(true);
    });

    it('lê a linha comprimida (o exemplo do Google)', () => {
      expect(lerLinha('_p~iF~ps|U_ulLnnqC_mqNvxq`@')).toEqual([
        [-120.2, 38.5],
        [-120.95, 40.7],
        [-126.453, 43.252],
      ]);
    });

    it('não tem ponto para um bloco que não existe', () => {
      expect(trajetoDoBloco('bloco-que-nao-existe')).toBeUndefined();
    });
  });

  describe('faixaDoLocal', () => {
    it('reveza as cores, do rosa ao azul, na ordem dos lugares', () => {
      const faixas = LOCAIS.map((local) => faixaDoLocal(local.id));
      expect(faixas).toEqual(faixas.map((_, i) => SETE_CORES[i % SETE_CORES.length]));
    });

    it('dá a mesma cor para o mesmo lugar, sempre', () => {
      expect(faixaDoLocal('ibirapuera')).toBe('rosa');
      expect(faixaDoLocal('consolacao')).toBe('amarelo');
    });

    it('cai na primeira cor para um lugar que não existe', () => {
      expect(faixaDoLocal('lugar-que-nao-existe')).toBe('rosa');
    });
  });

  describe('artistasDoLugar', () => {
    it('junta os artistas do lugar sem repetir, do mais famoso para o menos', () => {
      const artistas = artistasDoLugar('ibirapuera');
      expect(artistas.length).toBeGreaterThan(5);
      expect(new Set(artistas).size).toBe(artistas.length);
      expect(artistas[0]).toBe('Ivete Sangalo');
    });

    it('pega só os dos blocos de um dia em diante', () => {
      const artistas = artistasDoLugar('ibirapuera', '2026-02-14');
      expect(artistas[0]).toBe('Léo Santana');
      expect(artistas).not.toContain('Ivete Sangalo');
    });

    it('volta a valer a lista toda quando nenhum bloco dali em diante tem artista', () => {
      expect(artistasDoLugar('ibirapuera', '2026-03-01')).toEqual(artistasDoLugar('ibirapuera'));
    });

    it('fica vazio quando o lugar não tem artista divulgado', () => {
      expect(artistasDoLugar('paulo-vi')).toEqual([]);
    });
  });
});
