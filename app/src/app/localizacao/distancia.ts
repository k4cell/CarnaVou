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

/** As ruas fazem a gente andar mais que a linha reta: em média, uns 30% a mais. */
const DESVIO_DAS_RUAS = 1.3;
/** O passo de quem anda no meio da festa, mais lento que o normal: 4 km/h. */
const METROS_POR_MINUTO = 4000 / 60;

/**
 * Quanto tempo leva andando, a partir da distância em linha reta: "1 min a pé", "uns 7 min a pé",
 * "uns 25 min a pé", "uns 1 h 30 min a pé". É uma estimativa, sem calcular a rota: arredonda de 5
 * em 5 minutos e, passando de uma hora, de 15 em 15.
 */
export function tempoAPe(metros: number): string {
  const minutos = Math.round((metros * DESVIO_DAS_RUAS) / METROS_POR_MINUTO);
  if (minutos <= 1) {
    return '1 min a pé';
  }
  if (minutos < 10) {
    return `uns ${minutos} min a pé`;
  }
  const arredondado = Math.round(minutos / 5) * 5;
  if (arredondado < 60) {
    return `uns ${arredondado} min a pé`;
  }
  const emQuartos = Math.round(minutos / 15) * 15;
  const horas = Math.floor(emQuartos / 60);
  const resto = emQuartos % 60;
  return `uns ${horas} h${resto ? ` ${resto} min` : ''} a pé`;
}

/** A frase dos cartões do mapa e do After: "A 1,2 km de você, uns 25 min a pé." */
export function fraseDaDistancia(metros: number): string {
  return `A ${textoDaDistancia(metros)} de você, ${tempoAPe(metros)}.`;
}
