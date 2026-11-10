/** O retângulo da Grande São Paulo: [oeste, sul] e [leste, norte]. O mapa não sai daqui. */
export const LIMITES_DA_GRANDE_SP: [[number, number], [number, number]] = [
  [-47.2, -23.95],
  [-46.2, -23.2],
];

/**
 * O centro expandido, onde ficam os circuitos dos megablocos: mais ou menos o que fica entre as
 * marginais Tietê (norte) e Pinheiros (oeste), a Av. dos Bandeirantes (sul) e a Av. Salim Farah
 * Maluf (leste). [oeste, sul] e [leste, norte].
 */
export const LIMITES_DO_CENTRO_EXPANDIDO: [[number, number], [number, number]] = [
  [-46.725, -23.62],
  [-46.58, -23.515],
];

function dentroDe([[oeste, sul], [leste, norte]]: [[number, number], [number, number]], lat: number, lng: number): boolean {
  return lng >= oeste && lng <= leste && lat >= sul && lat <= norte;
}

/** A posição cai dentro do mapa? Quem está fora (em outra cidade) não aparece nele. */
export function estaNaGrandeSP(lat: number, lng: number): boolean {
  return dentroDe(LIMITES_DA_GRANDE_SP, lat, lng);
}

export function estaNoCentroExpandido(lat: number, lng: number): boolean {
  return dentroDe(LIMITES_DO_CENTRO_EXPANDIDO, lat, lng);
}
