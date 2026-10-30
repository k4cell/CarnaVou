import { linkDoGoogleMaps, linkDoUber, linksDeIr } from './links';

describe('links de "Ir a pé", Uber e Metrô', () => {
  it('monta a rota a pé do Google Maps com a latitude e a longitude do destino', () => {
    expect(linkDoGoogleMaps(-23.58485, -46.65482, 'a-pe')).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=-23.58485,-46.65482&travelmode=walking',
    );
  });

  it('monta a rota de transporte público (metrô, trem e ônibus) do Google Maps', () => {
    expect(linkDoGoogleMaps(-23.58485, -46.65482, 'metro')).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=-23.58485,-46.65482&travelmode=transit',
    );
  });

  it('monta o link do Uber com o destino e o nome dele, e a partida onde a pessoa está', () => {
    const link = linkDoUber(-23.58485, -46.65482, 'Agrada Gregos');
    expect(link.startsWith('https://m.uber.com/looking?drop%5B0%5D=')).toBe(true);
    const destino = JSON.parse(decodeURIComponent(link.split('=')[1]));
    expect(destino).toEqual({ latitude: -23.58485, longitude: -46.65482, addressLine1: 'Agrada Gregos' });
    expect(link).not.toContain('pickup');
  });

  it('junta os três, na ordem da tela', () => {
    expect(Object.keys(linksDeIr(-23.5, -46.6, 'X'))).toEqual(['aPe', 'uber', 'metro']);
  });
});
