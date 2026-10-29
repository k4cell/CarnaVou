const RAIO_DA_TERRA_EM_METROS = 6_371_000;

export interface Ponto {
  lat: number;
  lng: number;
}

function emRadianos(graus: number): number {
  return (graus * Math.PI) / 180;
}

/** A distância em linha reta entre dois pontos da Terra, em metros (fórmula de Haversine). */
export function distanciaEmMetros(de: Ponto, para: Ponto): number {
  const dLat = emRadianos(para.lat - de.lat);
  const dLng = emRadianos(para.lng - de.lng);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(emRadianos(de.lat)) * Math.cos(emRadianos(para.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * RAIO_DA_TERRA_EM_METROS * Math.asin(Math.sqrt(a));
}

/**
 * A distância escrita do jeito que a gente fala: "menos de 50 m", "350 m", "1,2 km", "23 km".
 * Arredonda de propósito, porque o celular nunca sabe a posição exata.
 */
export function textoDaDistancia(metros: number): string {
  if (metros < 50) {
    return 'menos de 50 m';
  }
  const arredondado = Math.round(metros / 10) * 10;
  if (arredondado < 1000) {
    return `${arredondado} m`;
  }
  if (metros < 10_000) {
    const km = (metros / 1000).toFixed(1);
    return `${km.endsWith('.0') ? km.slice(0, -2) : km.replace('.', ',')} km`;
  }
  return `${Math.round(metros / 1000)} km`;
}
