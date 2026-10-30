import { horaIso, jaAcabou } from '../dados/agenda';
import { concentracoesDaAba } from '../dados/concentracoes';
import { famaDoBloco } from '../dados/consultas';
import { Bloco } from '../dados/tipos';
import { Ponto, distanciaEmMetros } from '../localizacao/distancia';

/** Quantos blocos a lista "Perto de você" recomenda. */
const QUANTOS = 3;
/** Os grandes blocos (com artista conhecido) contam como se estivessem na metade da distância. */
const PESO_DO_GRANDE = 2;

export interface BlocoPerto {
  bloco: Bloco;
  /** O id do ponto do mapa onde o bloco se concentra. */
  ponto: string;
  /** A distância em linha reta até a concentração. */
  metros: number;
  /** Já começou (e não acabou)? Se não, começa mais tarde hoje. */
  rolando: boolean;
}

/**
 * Os blocos para recomendar a quem tocou em "onde estou": os que estão rolando agora, os mais
 * perto primeiro. Os grandes blocos (com artista conhecido) ganham peso e contam como se
 * estivessem na metade da distância. Sem nenhum rolando, vêm os que ainda começam hoje.
 *
 * Fica com o mapa porque usa os pontos dos blocos: assim só é baixado junto com ele.
 */
export function blocosPertoDeVoce(voce: Ponto, agora: Date): BlocoPerto[] {
  const hora = horaIso(agora);
  const deHoje = concentracoesDaAba('hoje', agora).flatMap((ponto) =>
    ponto.blocos
      .filter((bloco) => !jaAcabou(bloco, hora))
      .map((bloco) => ({ bloco, ponto: ponto.id, metros: distanciaEmMetros(voce, ponto), rolando: bloco.inicio <= hora })),
  );
  const rolando = deHoje.filter((candidato) => candidato.rolando);
  const peso = ({ bloco, metros }: BlocoPerto) => (famaDoBloco(bloco) > 0 ? metros / PESO_DO_GRANDE : metros);
  return (rolando.length > 0 ? rolando : deHoje).sort((a, b) => peso(a) - peso(b)).slice(0, QUANTOS);
}
