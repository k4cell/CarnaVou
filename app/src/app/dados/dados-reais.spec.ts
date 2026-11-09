import arquivoDeCorrecoes from '../../../public/correcoes.json';
import { estaNaGrandeSP } from '../mapa/limites';
import { BLOCOS } from './blocos';
import { blocosDoLocal, famaDoBloco } from './consultas';
import { problemasDoArquivo } from './correcoes';
import { itinerarioDoBloco } from './itinerario';
import { LOCAIS } from './locais';
import { trajetoDoBloco } from './trajetos';

/**
 * Confere os dados que vão para o ar, de qualquer ano. Este é o único teste que olha os dados de
 * verdade (os outros usam a cópia congelada de 2026), e a publicação só segue se ele passar.
 * Roda com `ng test --no-watch --configuration dados-reais`.
 */
describe('os dados que vão para o ar', () => {
  it('o arquivo de correções está certo', () => {
    expect(problemasDoArquivo(arquivoDeCorrecoes)).toEqual([]);
  });

  describe('os lugares', () => {
    it('não repetem o id', () => {
      const ids = LOCAIS.map((local) => local.id);
      expect(ids.length).toBeGreaterThan(3);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('todo lugar tem pelo menos um bloco', () => {
      const comBloco = new Set(BLOCOS.map((bloco) => bloco.localId));
      expect(LOCAIS.filter((local) => !comBloco.has(local.id))).toEqual([]);
    });

    it('vêm em ordem, dos que têm os artistas mais famosos para os menos', () => {
      const fama = LOCAIS.map((local) => blocosDoLocal(local.id).reduce((soma, bloco) => soma + famaDoBloco(bloco), 0));
      expect(fama).toEqual([...fama].sort((a, b) => b - a));
    });
  });

  describe('os blocos', () => {
    it('não repetem o id', () => {
      const ids = BLOCOS.map((bloco) => bloco.id);
      expect(ids.length).toBeGreaterThan(50);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('têm a data no id, para o endereço não mudar quando a lista for corrigida', () => {
      const semData = BLOCOS.filter((bloco) => {
        const [, mes, dia] = bloco.data.split('-');
        return !bloco.id.includes(`-${dia}-${mes}`);
      });
      expect(semData.map((bloco) => bloco.id)).toEqual([]);
    });

    it('todo bloco aponta para um lugar que existe', () => {
      const ids = new Set(LOCAIS.map((local) => local.id));
      expect(BLOCOS.filter((bloco) => !ids.has(bloco.localId)).map((bloco) => bloco.id)).toEqual([]);
    });

    it('são todos de um ano só, na época do carnaval (janeiro a março)', () => {
      expect(new Set(BLOCOS.map((bloco) => bloco.data.slice(0, 4))).size).toBe(1);
      expect(BLOCOS.filter((bloco) => !/^\d{4}-0[123]-\d{2}$/.test(bloco.data)).map((bloco) => bloco.id)).toEqual([]);
    });

    it('escrevem toda hora no formato HH:mm', () => {
      const formato = /^\d{2}:\d{2}$/;
      const comHoraErrada = BLOCOS.filter((bloco) =>
        [
          bloco.inicio,
          ...(bloco.desfile ? [bloco.desfile] : []),
          ...(bloco.fim ? [bloco.fim] : []),
          ...bloco.atracoes.flatMap((atracao) => (atracao.inicio ? [atracao.inicio] : [])),
        ].some((hora) => !formato.test(hora)),
      );
      expect(comHoraErrada.map((bloco) => bloco.id)).toEqual([]);
    });

    it('concentram, desfilam e terminam nessa ordem (ou terminam à meia-noite)', () => {
      for (const bloco of BLOCOS) {
        expect(bloco.desfile! >= bloco.inicio, bloco.id).toBe(true);
        expect(bloco.fim! > bloco.desfile! || bloco.fim === '00:00', bloco.id).toBe(true);
      }
    });

    it('têm o itinerário oficial em texto', () => {
      expect(BLOCOS.filter((bloco) => (itinerarioDoBloco(bloco.id) ?? '').length <= 2).map((bloco) => bloco.id)).toEqual([]);
    });

    it('têm artista divulgado em pelo menos alguns', () => {
      expect(BLOCOS.filter((bloco) => bloco.atracoes.length > 0).length).toBeGreaterThan(10);
    });

    it('escrevem o perfil do Instagram dos artistas só com letras, números, ponto e sublinhado', () => {
      const perfis = BLOCOS.flatMap((bloco) => bloco.atracoes.map((atracao) => atracao.perfil ?? ''));
      expect(perfis.filter((perfil) => perfil !== '' && !/^[A-Za-z0-9._]{1,30}$/.test(perfil))).toEqual([]);
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

    it('todo bloco no mapa tem o número do ponto de saída, que junta os blocos do mesmo lugar', () => {
      expect(comPonto.filter((bloco) => bloco.ponto === undefined).map((bloco) => bloco.id)).toEqual([]);
    });
  });
});
