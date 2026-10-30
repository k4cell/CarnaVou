import { ITINERARIOS, ITINERARIO_DO_BLOCO } from './itinerarios';

/**
 * O itinerário do bloco, como a lista oficial escreve ("R. Augusta, R. Peixoto Gomide…").
 *
 * Fica fora de consultas.ts de propósito: só a página do bloco e o mapa usam, e assim o texto só
 * é baixado com eles, sem pesar a primeira tela.
 */
export function itinerarioDoBloco(blocoId: string): string | undefined {
  const indice = ITINERARIO_DO_BLOCO[blocoId];
  return indice === undefined ? undefined : ITINERARIOS[indice];
}
