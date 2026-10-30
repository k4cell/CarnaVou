import { Aba, diaIso, diaSeguinte, horaIso, jaAcabou } from './agenda';
import { BLOCOS } from './blocos';
import { acharLocal, famaDoBloco } from './consultas';
import { dataPorExtenso } from './formato';
import { Bloco } from './tipos';

/** Um pedaço da lista da aba Blocos: "Rolando agora", "Mais tarde hoje", um dia… */
export interface SecaoDeBlocos {
  titulo: string;
  /** Cada grupo vira um cartão: os blocos do mesmo dia no mesmo lugar, um embaixo do outro. */
  grupos: Bloco[][];
}

const quando = (bloco: Bloco) => bloco.data + bloco.inicio;

/** Os mais famosos primeiro; quem não tem artista conhecido vem depois, por horário. */
function porFama(blocos: Bloco[]): Bloco[] {
  return [...blocos].sort((a, b) => famaDoBloco(b) - famaDoBloco(a) || quando(a).localeCompare(quando(b)));
}

function porHorario(blocos: Bloco[]): Bloco[] {
  return [...blocos].sort((a, b) => quando(a).localeCompare(quando(b)));
}

/**
 * Os blocos do mesmo dia num circuito de megabloco (como o Ibirapuera) saem do mesmo ponto, um
 * depois do outro: são do mesmo lugar. Num lugar que é uma subprefeitura inteira, cada bloco é um.
 */
function chaveDoLugar(bloco: Bloco): string {
  return acharLocal(bloco.localId)?.circuito ? `${bloco.data}|${bloco.localId}` : bloco.id;
}

/**
 * Junta os blocos do mesmo dia e do mesmo lugar, na ordem da lista: o grupo fica onde aparece o
 * primeiro deles e leva junto, por horário, os outros do mesmo lugar que ainda estão em `restantes`
 * (quem entra num grupo sai de lá). Assim quem está num bloco já vê que o próximo é ali mesmo.
 */
function juntarPorLugar(ordem: Bloco[], restantes: Set<Bloco>): Bloco[][] {
  const grupos: Bloco[][] = [];
  for (const bloco of ordem) {
    if (!restantes.has(bloco)) {
      continue;
    }
    const chave = chaveDoLugar(bloco);
    const grupo = porHorario([...restantes].filter((outro) => chaveDoLugar(outro) === chave));
    grupo.forEach((outro) => restantes.delete(outro));
    grupos.push(grupo);
  }
  return grupos;
}

/** Os blocos de cada dia, os mais famosos primeiro, um pedaço por dia. */
function porDia(blocos: Bloco[]): SecaoDeBlocos[] {
  const dias = [...new Set(blocos.map((bloco) => bloco.data))].sort();
  return dias.map((dia) => {
    const doDia = blocos.filter((bloco) => bloco.data === dia);
    return { titulo: dataPorExtenso(dia), grupos: juntarPorLugar(porFama(doDia), new Set(doDia)) };
  });
}

/**
 * A lista da aba Blocos. O foco é o presente e o futuro: o que já acabou não aparece.
 * - Hoje: "Rolando agora" (os mais famosos primeiro) e "Mais tarde hoje" (por horário).
 * - Amanhã: os blocos de amanhã, os mais famosos primeiro.
 * - Geral: de hoje em diante, um pedaço por dia.
 * Os blocos do mesmo dia no mesmo lugar ficam juntos, num grupo só (veja `juntarPorLugar`): o que
 * começa mais tarde no lugar de um bloco que está rolando aparece junto com ele.
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
    const restantes = new Set(deHoje);
    const rolando = deHoje.filter((bloco) => bloco.inicio <= hora);
    const maisTarde = deHoje.filter((bloco) => bloco.inicio > hora);
    secoes.push({ titulo: 'Rolando agora', grupos: juntarPorLugar(porFama(rolando), restantes) });
    secoes.push({ titulo: 'Mais tarde hoje', grupos: juntarPorLugar(porHorario(maisTarde), restantes) });
  } else if (aba === 'amanha') {
    const amanha = diaIso(diaSeguinte(agora));
    const deAmanha = BLOCOS.filter((bloco) => bloco.data === amanha);
    secoes.push({ titulo: 'Amanhã', grupos: juntarPorLugar(porFama(deAmanha), new Set(deAmanha)) });
  } else {
    secoes.push(...porDia([...deHoje, ...BLOCOS.filter((bloco) => bloco.data > dia)]));
  }
  return secoes.filter((secao) => secao.grupos.length > 0);
}

/**
 * Bloco da noite: começa a partir das 16h ou vai até as 20h ou mais (um fim antes do começo passa
 * da meia-noite).
 */
export function eDaNoite(bloco: Bloco): boolean {
  return bloco.inicio >= '16:00' || (!!bloco.fim && (bloco.fim >= '20:00' || bloco.fim <= bloco.inicio));
}

/**
 * Os blocos da noite, para a aba After, em ordem de data e hora: os de hoje (sem os que já
 * acabaram), os de amanhã ou, na Geral, os de hoje em diante. Sem saber o dia, a Geral traz todos.
 */
export function blocosDaNoite(aba: Aba, agora: Date | null): Bloco[] {
  const daNoite = porHorario(BLOCOS.filter(eDaNoite));
  if (agora === null) {
    return aba === 'geral' ? daNoite : [];
  }
  const dia = diaIso(agora);
  const deHoje = daNoite.filter((bloco) => bloco.data === dia && !jaAcabou(bloco, horaIso(agora)));
  if (aba === 'hoje') {
    return deHoje;
  }
  if (aba === 'amanha') {
    const amanha = diaIso(diaSeguinte(agora));
    return daNoite.filter((bloco) => bloco.data === amanha);
  }
  return [...deHoje, ...daNoite.filter((bloco) => bloco.data > dia)];
}
