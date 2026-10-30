import { Aba, blocosDaAba } from './agenda';
import { LOCAIS } from './locais';
import { Bloco, Local, Trajeto } from './tipos';
import { trajetoDoBloco } from './trajetos';

/** Um ponto do mapa: onde um ou mais blocos da aba se concentram. */
export interface Concentracao {
  /** A posição do ponto, como texto ("-46.65746,-23.58702"). */
  id: string;
  /** O lugar do primeiro bloco do ponto. */
  local: Local;
  /** Os blocos que se concentram aqui, em ordem de data e hora. */
  blocos: Bloco[];
  /** Por onde esses blocos passam, sem repetir (vários blocos dividem o mesmo trajeto). */
  trajetos: Trajeto[];
  lat: number;
  lng: number;
}

/** O id do ponto: a posição dele. Blocos que se concentram no mesmo lugar dividem o ponto. */
export function idDoPonto([lng, lat]: [number, number]): string {
  return `${lng.toFixed(5)},${lat.toFixed(5)}`;
}

/**
 * Onde se concentram os blocos da aba (Hoje, Amanhã ou Geral). Blocos que se concentram no mesmo
 * lugar (como os do Ibirapuera) dividem o ponto. Os que a gente não conseguiu pôr no mapa ficam
 * de fora.
 *
 * Fica fora de consultas.ts porque usa os trajetos: assim só é baixado junto com o mapa.
 */
export function concentracoesDaAba(aba: Aba, agora: Date | null): Concentracao[] {
  const porId = new Map<string, Concentracao>();
  for (const local of LOCAIS) {
    for (const bloco of blocosDaAba(aba, local.id, agora)) {
      const trajeto = trajetoDoBloco(bloco.id);
      if (!trajeto) {
        continue;
      }
      const id = idDoPonto(trajeto.inicio);
      let ponto = porId.get(id);
      if (!ponto) {
        ponto = { id, local, blocos: [], trajetos: [], lng: trajeto.inicio[0], lat: trajeto.inicio[1] };
        porId.set(id, ponto);
      }
      ponto.blocos.push(bloco);
      if (!ponto.trajetos.includes(trajeto)) {
        ponto.trajetos.push(trajeto);
      }
    }
  }
  const pontos = [...porId.values()];
  // Um ponto pode juntar blocos de dois lugares: a ordem de data e hora vale para o ponto todo.
  for (const ponto of pontos) {
    ponto.blocos.sort((a, b) => (a.data + a.inicio).localeCompare(b.data + b.inicio));
  }
  return pontos;
}
