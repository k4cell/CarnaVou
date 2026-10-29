import { CIRCUITOS } from './circuitos';
import { Circuito } from './tipos';

/**
 * O circuito dos megablocos de um lugar. Só alguns lugares têm: os outros não têm trajeto nas fontes.
 *
 * Fica fora de consultas.ts de propósito: só o mapa usa os trajetos, e assim eles só são baixados
 * junto com o mapa, sem pesar a primeira tela.
 */
export function circuitoDoLocal(localId: string): Circuito | undefined {
  return CIRCUITOS.find((circuito) => circuito.localId === localId);
}
