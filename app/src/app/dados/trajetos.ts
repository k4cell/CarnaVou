import { TRAJETOS, TRAJETO_DO_BLOCO } from './pontos-dos-blocos';
import { Trajeto } from './tipos';

/**
 * Lê uma linha no formato "encoded polyline" do Google (precisão de 5 casas), que ocupa bem
 * menos espaço que a lista de números. Devolve os pontos como [longitude, latitude].
 */
export function lerLinha(codigo: string): [number, number][] {
  const linha: [number, number][] = [];
  let posicao = 0;
  let lat = 0;
  let lng = 0;
  const proximoNumero = (): number => {
    let resultado = 0;
    let deslocamento = 0;
    let byte: number;
    do {
      byte = codigo.charCodeAt(posicao++) - 63;
      resultado |= (byte & 0x1f) << deslocamento;
      deslocamento += 5;
    } while (byte >= 0x20);
    return resultado & 1 ? ~(resultado >> 1) : resultado >> 1;
  };
  while (posicao < codigo.length) {
    lat += proximoNumero();
    lng += proximoNumero();
    linha.push([lng / 1e5, lat / 1e5]);
  }
  return linha;
}

const jaLidos = new Map<number, Trajeto>();

/**
 * Onde o bloco se concentra e por onde ele passa. Blocos que a gente não conseguiu pôr no mapa
 * ficam sem.
 *
 * Fica fora de consultas.ts de propósito: só o mapa usa os trajetos, e assim eles só são baixados
 * junto com o mapa, sem pesar a primeira tela.
 */
export function trajetoDoBloco(blocoId: string): Trajeto | undefined {
  const indice = TRAJETO_DO_BLOCO[blocoId];
  if (indice === undefined) {
    return undefined;
  }
  let trajeto = jaLidos.get(indice);
  if (!trajeto) {
    const [codigo, aproximado] = TRAJETOS[indice];
    const linha = lerLinha(codigo);
    trajeto = { inicio: linha[0], linha: linha.length > 1 ? linha : undefined, aproximado: aproximado === 1 };
    jaLidos.set(indice, trajeto);
  }
  return trajeto;
}
