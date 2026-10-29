import { linkDoGoogleMaps, linkDoWaze } from './links';

describe('links de "Como chegar"', () => {
  it('monta o link de rota do Google Maps com a latitude e a longitude do destino', () => {
    expect(linkDoGoogleMaps(-23.58485, -46.65482)).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=-23.58485,-46.65482',
    );
  });

  it('monta o link do Waze já mandando navegar até o destino', () => {
    expect(linkDoWaze(-23.58485, -46.65482)).toBe(
      'https://waze.com/ul?ll=-23.58485%2C-46.65482&navigate=yes',
    );
  });
});
