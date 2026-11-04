import { Aba, diaIso, diaSeguinte, horaIso, jaAcabou } from './agenda';
import { BLOCOS } from './blocos';
import { famaDoBloco } from './consultas';
import { dataPorExtenso } from './formato';
import { Bloco } from './tipos';

/** Um pedaço da lista da aba Blocos: "Rolando agora", "Mais tarde hoje", um dia… */
export interface SecaoDeBlocos {
  titulo: string;
  /** Cada grupo vira um cartão: os blocos do mesmo dia no mesmo lugar, um embaixo do outro. */
  grupos: Bloco[][];
}

/** Com até tantos blocos em Hoje, a lista mostra também o próximo dia. */
const POUCOS_BLOCOS_HOJE = 3;

const quando = (bloco: Bloco) => bloco.data + bloco.inicio;

/** Os mais famosos primeiro; quem não tem artista conhecido vem depois, por horário. */
function porFama(blocos: Bloco[]): Bloco[] {
  return [...blocos].sort((a, b) => famaDoBloco(b) - famaDoBloco(a) || quando(a).localeCompare(quando(b)));
}

function porHorario(blocos: Bloco[]): Bloco[] {
  return [...blocos].sort((a, b) => quando(a).localeCompare(quando(b)));
}

/**
 * Os blocos do mesmo dia que saem do mesmo ponto (a menos de 300 m, veja `gerar_dados.py`) são do
 * mesmo lugar, para quem está ali. O bloco sem ponto conhecido fica sozinho.
 */
function chaveDoLugar(bloco: Bloco): string {
  return bloco.ponto === undefined ? bloco.id : `${bloco.data}|${bloco.localId}|${bloco.ponto}`;
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

/** O próximo dia com bloco depois de hoje, com o título dizendo que dia é. */
function proximoDia(blocos: Bloco[], hoje: string, amanha: string): SecaoDeBlocos[] {
  const dias = blocos.map((bloco) => bloco.data).filter((data) => data > hoje);
  if (dias.length === 0) {
    return [];
  }
  const dia = dias.reduce((menor, data) => (data < menor ? data : menor));
  const doDia = blocos.filter((bloco) => bloco.data === dia);
  return [
    {
      titulo: `${dia === amanha ? 'Amanhã' : 'Próximo dia'}: ${dataPorExtenso(dia)}`,
      grupos: juntarPorLugar(porFama(doDia), new Set(doDia)),
    },
  ];
}

/**
 * A lista da aba Blocos. O foco é o presente e o futuro: o que já acabou não aparece.
 * - Hoje: "Rolando agora" (os mais famosos primeiro) e "Mais tarde hoje" (por horário). Quando hoje
 *   tem pouco bloco, vem também o próximo dia com bloco, para a lista não ficar quase vazia.
 * - Amanhã: os blocos de amanhã, os mais famosos primeiro.
 * - Geral: de hoje em diante, um pedaço por dia.
 * Os blocos do mesmo dia no mesmo lugar ficam juntos, num grupo só (veja `juntarPorLugar`): o que
 * começa mais tarde no lugar de um bloco que está rolando aparece junto com ele.
 * Sem saber o dia de hoje (a página pronta), a Geral traz todos os blocos.
 * `incluir` é a busca e os filtros da tela: só entra o bloco que passar por ele.
 */
export function secoesDosBlocos(
  aba: Aba,
  agora: Date | null,
  incluir: (bloco: Bloco) => boolean = () => true,
): SecaoDeBlocos[] {
  const blocos = BLOCOS.filter(incluir);
  if (agora === null) {
    return aba === 'geral' ? porDia(blocos) : [];
  }
  const dia = diaIso(agora);
  const hora = horaIso(agora);
  const deHoje = blocos.filter((bloco) => bloco.data === dia && !jaAcabou(bloco, hora));

  const secoes: SecaoDeBlocos[] = [];
  if (aba === 'hoje') {
    const restantes = new Set(deHoje);
    const rolando = deHoje.filter((bloco) => bloco.inicio <= hora);
    const maisTarde = deHoje.filter((bloco) => bloco.inicio > hora);
    secoes.push({ titulo: 'Rolando agora', grupos: juntarPorLugar(porFama(rolando), restantes) });
    secoes.push({ titulo: 'Mais tarde hoje', grupos: juntarPorLugar(porHorario(maisTarde), restantes) });
    if (deHoje.length <= POUCOS_BLOCOS_HOJE) {
      secoes.push(...proximoDia(blocos, dia, diaIso(diaSeguinte(agora))));
    }
  } else if (aba === 'amanha') {
    const amanha = diaIso(diaSeguinte(agora));
    const deAmanha = blocos.filter((bloco) => bloco.data === amanha);
    secoes.push({ titulo: 'Amanhã', grupos: juntarPorLugar(porFama(deAmanha), new Set(deAmanha)) });
  } else {
    secoes.push(...porDia([...deHoje, ...blocos.filter((bloco) => bloco.data > dia)]));
  }
  return secoes.filter((secao) => secao.grupos.length > 0);
}

/**
 * Só para a busca: o que já aconteceu, do mais recente para o mais antigo. As listas mostram só o
 * presente e o futuro, mas quem procura um artista que já tocou precisa saber disso, e não achar
 * que o artista não está no app.
 */
export function secaoDoQueJaAconteceu(agora: Date | null, incluir: (bloco: Bloco) => boolean): SecaoDeBlocos | null {
  if (agora === null) {
    return null;
  }
  const dia = diaIso(agora);
  const hora = horaIso(agora);
  const passados = BLOCOS.filter(
    (bloco) => incluir(bloco) && (bloco.data < dia || (bloco.data === dia && jaAcabou(bloco, hora))),
  );
  if (passados.length === 0) {
    return null;
  }
  return { titulo: 'Já aconteceu', grupos: porHorario(passados).reverse().map((bloco) => [bloco]) };
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
