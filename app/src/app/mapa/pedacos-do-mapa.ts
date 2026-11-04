import type { AddProtocolAction, RequestTransformFunction } from 'maplibre-gl';

/**
 * O MapLibre pede os pedaços do mapa de dentro de um worker, e esses pedidos não chegam ao service
 * worker: nada ficava guardado para usar sem internet (medi em 04/11/2026). Com este endereço de
 * mentira, o worker manda o pedido para a página, a página pede de verdade, e aí o service worker
 * guarda o pedaço (grupo `mapa-pedacos`, em ngsw-config.json).
 */
export const PROTOCOLO_DOS_PEDACOS = 'guardado';

/** Troca o endereço dos pedaços do mapa. O resto (como as letras) a página já pede sozinha. */
export const pedirPelaPagina: RequestTransformFunction = (url, tipo) =>
  tipo === 'Tile' && url.startsWith('https://')
    ? { url: `${PROTOCOLO_DOS_PEDACOS}://${url.slice('https://'.length)}` }
    : undefined;

/** Baixa um pedaço, na página. É o que o MapLibre chama para o endereço de mentira. */
export const baixarPedaco: AddProtocolAction = async (pedido, controle) => {
  const endereco = pedido.url.replace(`${PROTOCOLO_DOS_PEDACOS}://`, 'https://');
  const resposta = await fetch(endereco, { signal: controle.signal });
  if (!resposta.ok) {
    throw new Error(`Não consegui baixar o pedaço do mapa (${resposta.status}).`);
  }
  return { data: await resposta.arrayBuffer() };
};
