import { linkDoGoogleMaps, linkDoUber, linkDoWaze } from './links';

describe('links de "Ir", Waze e Uber', () => {
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

  it('monta o link do Uber com o destino e o nome dele, e a partida onde a pessoa está', () => {
    const link = linkDoUber(-23.58485, -46.65482, 'Agrada Gregos');
    expect(link.startsWith('https://m.uber.com/looking?drop%5B0%5D=')).toBe(true);
    const destino = JSON.parse(decodeURIComponent(link.split('=')[1]));
    expect(destino).toEqual({ latitude: -23.58485, longitude: -46.65482, addressLine1: 'Agrada Gregos' });
    expect(link).not.toContain('pickup');
  });
});
