import { LUGARES_DO_AFTER, LugarDoAfter } from '../dados/lugares-do-after';
import { Zona } from '../dados/tipos';
import { distanciaEmMetros } from '../localizacao/distancia';

/**
 * Lugares a menos disso um do outro dividem o ponto no mapa, para os pinos não ficarem um em cima do
 * outro. É a mesma distância dos blocos que saem do mesmo ponto.
 */
const JUNTOS_ATE_METROS = 300;

/** Um ponto do mapa do After: um bar ou ponto de encontro, ou alguns, pertinho um do outro. */
export interface PontoDoAfter {
  /** O id do ponto no mapa, como "after:galo". */
  ponto: string;
  lugares: LugarDoAfter[];
  /** "Galo e Meretriz": para o leitor de tela e para o Uber. */
  nome: string;
  zona: Zona;
  /** O meio dos lugares do ponto. */
  lat: number;
  lng: number;
}

const media = (numeros: number[]) => numeros.reduce((soma, numero) => soma + numero, 0) / numeros.length;

const juntarNomes = new Intl.ListFormat('pt-BR', { style: 'long', type: 'conjunction' });

/** Junta os lugares vizinhos, na ordem da lista: cada um entra no primeiro ponto que fica perto dele. */
export function pontosDoAfter(lugares: LugarDoAfter[]): PontoDoAfter[] {
  const grupos: LugarDoAfter[][] = [];
  for (const lugar of lugares) {
    const grupo = grupos.find(([primeiro]) => distanciaEmMetros(primeiro, lugar) < JUNTOS_ATE_METROS);
    if (grupo) {
      grupo.push(lugar);
    } else {
      grupos.push([lugar]);
    }
  }
  return grupos.map((grupo) => ({
    ponto: `after:${grupo[0].id}`,
    lugares: grupo,
    nome: juntarNomes.format(grupo.map((lugar) => lugar.nome)),
    zona: grupo[0].zona,
    lat: media(grupo.map((lugar) => lugar.lat)),
    lng: media(grupo.map((lugar) => lugar.lng)),
  }));
}

/** Os pontos do mapa do After. */
export const PONTOS_DO_AFTER = pontosDoAfter(LUGARES_DO_AFTER);

/** O ponto onde fica um lugar do After. */
export function pontoDoLugarDoAfter(id: string): PontoDoAfter | undefined {
  return PONTOS_DO_AFTER.find((ponto) => ponto.lugares.some((lugar) => lugar.id === id));
}
