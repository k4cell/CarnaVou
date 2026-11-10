import { distanciaEmMetros } from '../localizacao/distancia';

/** Um ponto e quantos blocos ele junta (um, quando não diz). */
interface PontoComPeso {
  lat: number;
  lng: number;
  quantos?: number;
}

/** Até onde vai a região onde os blocos se concentram, a partir do meio deles. */
const RAIO_DA_CONCENTRACAO = 10_000;
/** A região só vale quando junta quase todos os blocos. */
const PARTE_DOS_BLOCOS = 0.8;

const pesoDo = (ponto: PontoComPeso) => ponto.quantos ?? 1;

/** A mediana de uma coordenada, com cada ponto valendo o número de blocos dele. */
function mediana(pontos: PontoComPeso[], coordenada: 'lat' | 'lng', total: number): number {
  const emOrdem = [...pontos].sort((a, b) => a[coordenada] - b[coordenada]);
  let soma = 0;
  for (const ponto of emOrdem) {
    soma += pesoDo(ponto);
    if (soma >= total / 2) {
      return ponto[coordenada];
    }
  }
  return emOrdem[0][coordenada];
}

/**
 * Os pontos que o mapa enquadra. Quando quase todos os blocos (80% ou mais) ficam a até 10 km do meio
 * deles, só esses entram: um bloco sozinho lá longe não afasta o mapa a ponto de o centro, onde está
 * quase tudo, ficar pequeno demais. O ponto de longe continua no mapa, é só arrastar. Com os pontos
 * espalhados, entram todos.
 */
export function pontosParaEnquadrar<P extends PontoComPeso>(pontos: P[]): P[] {
  if (pontos.length < 3) {
    return pontos;
  }
  const total = pontos.reduce((soma, ponto) => soma + pesoDo(ponto), 0);
  const meio = { lat: mediana(pontos, 'lat', total), lng: mediana(pontos, 'lng', total) };
  const perto = pontos.filter((ponto) => distanciaEmMetros(meio, ponto) <= RAIO_DA_CONCENTRACAO);
  const blocosPerto = perto.reduce((soma, ponto) => soma + pesoDo(ponto), 0);
  return blocosPerto >= PARTE_DOS_BLOCOS * total ? perto : pontos;
}
