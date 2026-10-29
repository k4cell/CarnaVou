import { distanciaEmMetros, textoDaDistancia } from './distancia';

describe('distanciaEmMetros', () => {
  it('dá zero para o mesmo ponto', () => {
    const ibirapuera = { lat: -23.58485, lng: -46.65482 };
    expect(distanciaEmMetros(ibirapuera, ibirapuera)).toBe(0);
  });

  it('mede um grau de latitude em cerca de 111 km', () => {
    const metros = distanciaEmMetros({ lat: -23, lng: -46 }, { lat: -24, lng: -46 });
    expect(metros).toBeGreaterThan(111_000);
    expect(metros).toBeLessThan(111_400);
  });

  it('mede a distância real entre a Sé e o Ibirapuera (uns 4,4 km em linha reta)', () => {
    const se = { lat: -23.55052, lng: -46.63331 };
    const ibirapuera = { lat: -23.58485, lng: -46.65482 };
    const metros = distanciaEmMetros(se, ibirapuera);
    expect(metros).toBeGreaterThan(4_200);
    expect(metros).toBeLessThan(4_600);
  });

  it('dá a mesma distância de ida e de volta', () => {
    const a = { lat: -23.56614, lng: -46.69401 };
    const b = { lat: -23.64164, lng: -46.71595 };
    expect(distanciaEmMetros(a, b)).toBeCloseTo(distanciaEmMetros(b, a), 6);
  });
});

describe('textoDaDistancia', () => {
  it('diz "menos de 50 m" para quem está praticamente no lugar', () => {
    expect(textoDaDistancia(0)).toBe('menos de 50 m');
    expect(textoDaDistancia(49)).toBe('menos de 50 m');
  });

  it('arredonda os metros de 10 em 10', () => {
    expect(textoDaDistancia(50)).toBe('50 m');
    expect(textoDaDistancia(143)).toBe('140 m');
    expect(textoDaDistancia(417)).toBe('420 m');
  });

  it('passa para km perto de 1000 m, sem mostrar "1000 m"', () => {
    expect(textoDaDistancia(994)).toBe('990 m');
    expect(textoDaDistancia(996)).toBe('1 km');
  });

  it('escreve os km com uma casa e vírgula, e sem a casa quando é redondo', () => {
    expect(textoDaDistancia(1234)).toBe('1,2 km');
    expect(textoDaDistancia(2000)).toBe('2 km');
    expect(textoDaDistancia(9_949)).toBe('9,9 km');
  });

  it('escreve os km inteiros a partir de 10 km', () => {
    expect(textoDaDistancia(10_000)).toBe('10 km');
    expect(textoDaDistancia(23_400)).toBe('23 km');
  });
});
