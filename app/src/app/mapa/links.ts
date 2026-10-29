/**
 * Links que abrem o app de mapa do celular (ou o site dele) já com o destino. Sem API e sem custo.
 * Os formatos vêm da documentação do Google Maps (parâmetro `api=1`) e do Waze (`waze.com/ul`).
 */

export function linkDoGoogleMaps(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export function linkDoWaze(lat: number, lng: number): string {
  return `https://waze.com/ul?ll=${lat}%2C${lng}&navigate=yes`;
}
