import { distanciaEmMetros } from '../localizacao/distancia';
import { contornoDoCirculo } from './circulo';

describe('contornoDoCirculo', () => {
  const centro = { lat: -23.55, lng: -46.63 };

  it('fecha o contorno: o último ponto é igual ao primeiro', () => {
    const contorno = contornoDoCirculo(centro.lat, centro.lng, 100);
    expect(contorno.length).toBe(49);
    expect(contorno.at(-1)).toEqual(contorno[0]);
  });

  it('põe todos os pontos à distância do raio, em qualquer direção', () => {
    for (const raio of [20, 150, 2000]) {
      for (const [lng, lat] of contornoDoCirculo(centro.lat, centro.lng, raio)) {
        const medida = distanciaEmMetros(centro, { lat, lng });
        expect(medida).toBeGreaterThan(raio * 0.99);
        expect(medida).toBeLessThan(raio * 1.01);
      }
    }
  });

  it('aceita escolher quantos pontos desenhar', () => {
    expect(contornoDoCirculo(centro.lat, centro.lng, 100, 8).length).toBe(9);
  });
});
