import { LOCAIS } from '../dados/locais';
import { estaNaGrandeSP } from './limites';

describe('estaNaGrandeSP', () => {
  it('aceita todos os lugares do app', () => {
    for (const local of LOCAIS) {
      expect(estaNaGrandeSP(local.lat, local.lng), local.nome).toBe(true);
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
