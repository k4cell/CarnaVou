import type { AddProtocolAction } from 'maplibre-gl';

import { enderecoNoSite } from './maplibre';

/**
 * O mapa é nosso: os pedaços e as letras ficam no próprio site, em `mapa/pedacos/` e `mapa/letras/`
 * (gerados por scripts/mapa/gerar-pedacos-do-mapa.py). O estilo chama esses arquivos com este
 * endereço de mentira ("guardado://mapa/pedacos/14/6068/9286.pbf") por dois motivos: o site pode
 * morar numa pasta (no GitHub Pages, /CarnaVou/), e o MapLibre pede os pedaços de dentro de um
 * worker, que o service worker não vê. Com o endereço de mentira, quem baixa é a página, a partir
 * da base dela, e o service worker guarda o arquivo para usar sem internet (ngsw-config.json).
 */
export const PROTOCOLO_DOS_PEDACOS = 'guardado';

/** Baixa um arquivo do mapa, na página. É o que o MapLibre chama para o endereço de mentira. */
export const baixarPedaco: AddProtocolAction = async (pedido, controle) => {
  const caminho = pedido.url.slice(`${PROTOCOLO_DOS_PEDACOS}://`.length);
  const resposta = await fetch(enderecoNoSite(caminho), { signal: controle.signal });
  // Um pedaço que não existe não tem nada para desenhar (é um pedaço vazio da borda do mapa).
  if (resposta.status === 404 && caminho.startsWith('mapa/pedacos/')) {
    return { data: new ArrayBuffer(0) };
  }
  if (!resposta.ok) {
    throw new Error(`Não consegui baixar ${caminho} (${resposta.status}).`);
  }
  return { data: await resposta.arrayBuffer() };
};
