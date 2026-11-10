import { estaNoCentroExpandido } from './limites';

/** Um ponto e quantos blocos ele junta (um, quando não diz). */
interface PontoComPeso {
  lat: number;
  lng: number;
  quantos?: number;
}

/** O centro expandido só vale sozinho quando junta quase todos os blocos. */
const PARTE_DOS_BLOCOS = 0.8;

const blocosEm = (pontos: PontoComPeso[]) => pontos.reduce((soma, ponto) => soma + (ponto.quantos ?? 1), 0);

/**
 * Os pontos que o mapa enquadra. Quando quase todos os blocos (80% ou mais) ficam no centro
 * expandido, só os de lá entram: um bloco sozinho bem longe (na Zona Leste, em Perus) não afasta o
 * mapa a ponto de o centro, onde está quase tudo, ficar pequeno demais. O ponto de longe continua no
 * mapa, é só arrastar. Com os blocos espalhados, entram todos.
 */
export function pontosParaEnquadrar<P extends PontoComPeso>(pontos: P[]): P[] {
  const noCentro = pontos.filter((ponto) => estaNoCentroExpandido(ponto.lat, ponto.lng));
  return blocosEm(noCentro) >= PARTE_DOS_BLOCOS * blocosEm(pontos) ? noCentro : pontos;
}
