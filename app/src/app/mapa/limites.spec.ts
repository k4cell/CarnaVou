import { BLOCOS } from '../dados/blocos';
import { trajetoDoBloco } from '../dados/trajetos';
import { estaNaGrandeSP } from './limites';

describe('estaNaGrandeSP', () => {
  it('aceita o ponto de todos os blocos do app', () => {
    for (const bloco of BLOCOS) {
      const ponto = trajetoDoBloco(bloco.id)?.inicio;
      if (ponto) {
        expect(estaNaGrandeSP(ponto[1], ponto[0]), bloco.nome).toBe(true);
      }
    }
  });

  it('aceita a Avenida Paulista', () => {
    expect(estaNaGrandeSP(-23.5614, -46.6559)).toBe(true);
  });

  it('recusa o Rio de Janeiro e Campinas', () => {
    expect(estaNaGrandeSP(-22.9068, -43.1729)).toBe(false);
    expect(estaNaGrandeSP(-22.9099, -47.0626)).toBe(false);
  });

  it('recusa a Zona Norte do hemisfério errado (sinal trocado)', () => {
    expect(estaNaGrandeSP(23.55, 46.63)).toBe(false);
  });
});
