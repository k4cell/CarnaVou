/** O retângulo da Grande São Paulo: [oeste, sul] e [leste, norte]. O mapa não sai daqui. */
export const LIMITES_DA_GRANDE_SP: [[number, number], [number, number]] = [
  [-47.2, -23.95],
  [-46.2, -23.2],
];

/** A posição cai dentro do mapa? Quem está fora (em outra cidade) não aparece nele. */
export function estaNaGrandeSP(lat: number, lng: number): boolean {
  const [[oeste, sul], [leste, norte]] = LIMITES_DA_GRANDE_SP;
  return lng >= oeste && lng <= leste && lat >= sul && lat <= norte;
}
