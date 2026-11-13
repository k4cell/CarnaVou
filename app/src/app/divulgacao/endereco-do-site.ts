/** O nome do site, no título das páginas e na prévia dos links. */
export const NOME_DO_SITE = 'CarnaVou';

/**
 * O endereço do site no ar, com a barra no fim. Vai na prévia dos links (og:url e og:image), no
 * endereço canônico de cada página e no mapa do site (scripts/publicar/mapa-do-site.mjs lê daqui).
 * Quando o domínio próprio entrar, é só trocar aqui.
 */
export const ENDERECO_DO_SITE = 'https://k4cell.github.io/CarnaVou/';

/** A imagem da prévia dos links (1200 × 630), em app/public. */
export const IMAGEM_DA_PREVIA = `${ENDERECO_DO_SITE}compartilhar.jpg`;

/**
 * O endereço completo de uma página do app ("/local/ibirapuera?hoje=…" vira
 * "https://…/local/ibirapuera/"), sem o que vem depois do "?" ou do "#". As páginas prontas moram
 * numa pasta cada uma (local/ibirapuera/index.html), então o endereço termina com a barra: é o que
 * o servidor entrega sem redirecionar.
 */
export function enderecoCompleto(caminho: string): string {
  const pasta = caminho.split(/[?#]/)[0].replace(/^\/+|\/+$/g, '');
  return pasta ? `${ENDERECO_DO_SITE}${pasta}/` : ENDERECO_DO_SITE;
}
