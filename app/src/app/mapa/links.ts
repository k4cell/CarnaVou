/**
 * Links que abrem o app de mapa do celular (ou o site dele) já com o destino. Sem API e sem custo.
 * Os formatos vêm da documentação do Google Maps (parâmetros `api=1` e `travelmode`) e do Uber
 * (`m.uber.com/looking`, o "universal link"). No carnaval quase ninguém vai de carro: as rotas são
 * a pé e de metrô (o transporte público do Google Maps, com trem e ônibus).
 */

export type ModoDaRota = 'a-pe' | 'metro';

const MODOS_DO_GOOGLE: Record<ModoDaRota, string> = { 'a-pe': 'walking', metro: 'transit' };

export function linkDoGoogleMaps(lat: number, lng: number, modo: ModoDaRota): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=${MODOS_DO_GOOGLE[modo]}`;
}

/**
 * Abre o Uber com o destino já marcado. Sem a partida, o Uber usa onde a pessoa está; o nome
 * aparece como o endereço do destino.
 */
export function linkDoUber(lat: number, lng: number, nome: string): string {
  const destino = JSON.stringify({ latitude: lat, longitude: lng, addressLine1: nome });
  return `https://m.uber.com/looking?drop%5B0%5D=${encodeURIComponent(destino)}`;
}

/** Os três botões de ir até um ponto, na ordem da tela: Ir a pé, Uber e Metrô. */
export function linksDeIr(lat: number, lng: number, nome: string) {
  return {
    aPe: linkDoGoogleMaps(lat, lng, 'a-pe'),
    uber: linkDoUber(lat, lng, nome),
    metro: linkDoGoogleMaps(lat, lng, 'metro'),
  };
}
