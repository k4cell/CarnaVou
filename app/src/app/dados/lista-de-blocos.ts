import { Aba, diaIso, diaSeguinte, horaIso, jaAcabou } from './agenda';
import { BLOCOS } from './blocos';
import { famaDoBloco } from './consultas';
import { dataPorExtenso } from './formato';
import { Bloco } from './tipos';

/** Um pedaço da lista da aba Blocos: "Rolando agora", "Mais tarde hoje", um dia… */
export interface SecaoDeBlocos {
  titulo: string;
  blocos: Bloco[];
}

const quando = (bloco: Bloco) => bloco.data + bloco.inicio;

/** Os mais famosos primeiro; quem não tem artista conhecido vem depois, por horário. */
function porFama(blocos: Bloco[]): Bloco[] {
  return [...blocos].sort((a, b) => famaDoBloco(b) - famaDoBloco(a) || quando(a).localeCompare(quando(b)));
}

function porHorario(blocos: Bloco[]): Bloco[] {
  return [...blocos].sort((a, b) => quando(a).localeCompare(quando(b)));
}

/** Os blocos de cada dia, os mais famosos primeiro, um pedaço por dia. */
function porDia(blocos: Bloco[]): SecaoDeBlocos[] {
  const dias = [...new Set(blocos.map((bloco) => bloco.data))].sort();
  return dias.map((dia) => ({
    titulo: dataPorExtenso(dia),
    blocos: porFama(blocos.filter((bloco) => bloco.data === dia)),
  }));
}

/**
 * A lista da aba Blocos. O foco é o presente e o futuro: o que já acabou não aparece.
 * - Hoje: "Rolando agora" (os mais famosos primeiro) e "Mais tarde hoje" (por horário).
 * - Amanhã: os blocos de amanhã, os mais famosos primeiro.
 * - Geral: de hoje em diante, um pedaço por dia.
 * Sem saber o dia de hoje (a página pronta), a Geral traz todos os blocos.
 */
export function secoesDosBlocos(aba: Aba, agora: Date | null): SecaoDeBlocos[] {
  if (agora === null) {
    return aba === 'geral' ? porDia(BLOCOS) : [];
  }
  const dia = diaIso(agora);
  const hora = horaIso(agora);
  const deHoje = BLOCOS.filter((bloco) => bloco.data === dia && !jaAcabou(bloco, hora));

  const secoes: SecaoDeBlocos[] = [];
  if (aba === 'hoje') {
    const rolando = deHoje.filter((bloco) => bloco.inicio <= hora);
    const maisTarde = deHoje.filter((bloco) => bloco.inicio > hora);
    secoes.push({ titulo: 'Rolando agora', blocos: porFama(rolando) });
    secoes.push({ titulo: 'Mais tarde hoje', blocos: porHorario(maisTarde) });
  } else if (aba === 'amanha') {
    const amanha = diaIso(diaSeguinte(agora));
    secoes.push({ titulo: 'Amanhã', blocos: porFama(BLOCOS.filter((bloco) => bloco.data === amanha)) });
  } else {
    secoes.push(...porDia([...deHoje, ...BLOCOS.filter((bloco) => bloco.data > dia)]));
  }
  return secoes.filter((secao) => secao.blocos.length > 0);
}
