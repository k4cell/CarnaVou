/**
 * Links que abrem o app de mapa do celular (ou o site dele) já com o destino. Sem API e sem custo.
 * Os formatos vêm da documentação do Google Maps (parâmetro `api=1`), do Waze (`waze.com/ul`) e
 * do Uber (`m.uber.com/looking`, o "universal link").
 */

export function linkDoGoogleMaps(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export function linkDoWaze(lat: number, lng: number): string {
  return `https://waze.com/ul?ll=${lat}%2C${lng}&navigate=yes`;
}

/**
 * Abre o Uber com o destino já marcado. Sem a partida, o Uber usa onde a pessoa está; o nome
 * aparece como o endereço do destino.
 */
export function linkDoUber(lat: number, lng: number, nome: string): string {
  const destino = JSON.stringify({ latitude: lat, longitude: lng, addressLine1: nome });
  return `https://m.uber.com/looking?drop%5B0%5D=${encodeURIComponent(destino)}`;
}
