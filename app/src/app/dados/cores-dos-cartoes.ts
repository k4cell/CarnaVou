import { jaAcabou } from './agenda';
import { BLOCOS } from './blocos';
import { cartaoDoBloco, famaDoBloco } from './consultas';
import { FAIXAS, faixaDoLocal } from './cores';
import { LOCAIS } from './locais';
import { Bloco } from './tipos';

// A cor de cada cartão da aba Blocos (os blocos do mesmo dia que saem do mesmo ponto). Dois cartões
// vizinhos nunca ficam com a mesma cor, mesmo sendo do mesmo lugar: são coisas separadas. O bloco
// leva a cor do cartão dele para todo canto (a página dele, a do lugar, o Descobrir). As cores vêm
// da lista (BLOCOS), e não das correções: um bloco cancelado ou com outra data não troca a cor de
// ninguém.

/** Um pouco de peso para cada par de cartões do mesmo dia: ficar lado a lado pesa bem mais. */
const PESO_DO_MESMO_DIA = 0.01;
/** E um pouco mais para os cartões do mesmo lugar em dias que não são vizinhos (veja a página do lugar). */
const PESO_DO_MESMO_LUGAR = 0.05;

const porId = new Map(BLOCOS.map((bloco) => [bloco.id, bloco]));
const dias = [...new Set(BLOCOS.map((bloco) => bloco.data))].sort();
const blocosDoDia = (dia: string) => BLOCOS.filter((bloco) => bloco.data === dia);
/** Os cartões, na ordem da lista: cada cartão fica onde aparece o primeiro bloco dele. */
const cartoes = (blocos: Bloco[]) => [...new Set(blocos.map(cartaoDoBloco))];

/**
 * Todas as ordens em que os cartões aparecem na aba Blocos, como em `secoesDosBlocos`: a Geral e o
 * Amanhã (cada dia pela fama, um dia atrás do outro) e, a cada hora em que a lista muda (um bloco
 * começa ou acaba), o Hoje (os que estão rolando, pela fama, e depois os que vêm, pelo horário) e a
 * Geral daquela hora. O fim de um dia encosta no começo do próximo.
 */
function ordensDosCartoes(): string[][] {
  // Cada dia é ordenado uma vez só, pela fama e pelo horário; a cada hora, só se filtra.
  const fama = new Map(BLOCOS.map((bloco) => [bloco, famaDoBloco(bloco)]));
  const pelaFama = dias.map((dia) =>
    blocosDoDia(dia).sort((a, b) => fama.get(b)! - fama.get(a)! || a.inicio.localeCompare(b.inicio)),
  );
  const famaDoDia = pelaFama.map(cartoes);
  const ordens = [famaDoDia.flat()];
  pelaFama.forEach((blocos, i) => {
    const peloHorario = [...blocos].sort((a, b) => a.inicio.localeCompare(b.inicio));
    const proximo = famaDoDia[i + 1] ?? [];
    const horas = new Set(['00:00', ...blocos.flatMap((bloco) => [bloco.inicio, bloco.fim ?? bloco.inicio])]);
    for (const hora of horas) {
      const vivo = (bloco: Bloco) => !jaAcabou(bloco, hora);
      const rolando = blocos.filter((bloco) => vivo(bloco) && bloco.inicio <= hora);
      const depois = peloHorario.filter((bloco) => vivo(bloco) && bloco.inicio > hora);
      ordens.push([...cartoes([...rolando, ...depois]), ...proximo]);
      ordens.push([...cartoes(blocos.filter(vivo)), ...proximo]);
    }
  });
  return ordens;
}

/**
 * Escolhe a cor de cada cartão. Pesa quem fica lado a lado: na aba Blocos e na página do lugar (um
 * dia embaixo do outro), e um pouco os cartões do mesmo dia. Vai na ordem da Geral: cada cartão fica
 * com a cor que menos se repete nos vizinhos que já têm cor e, no empate, com a cor da vez no rodízio
 * do rosa ao verde-mar.
 */
function escolherAsCores(): Map<string, string> {
  // Os vizinhos de cada cartão, com o peso de cada um.
  const vizinhos = new Map<string, Map<string, number>>();
  const somarDeUmLado = (a: string, b: string, quanto: number) => {
    const deA = vizinhos.get(a) ?? new Map<string, number>();
    deA.set(b, (deA.get(b) ?? 0) + quanto);
    vizinhos.set(a, deA);
  };
  const somar = (a: string, b: string, quanto: number) => {
    if (a !== b) {
      somarDeUmLado(a, b, quanto);
      somarDeUmLado(b, a, quanto);
    }
  };
  const ordens = ordensDosCartoes();
  for (const ordem of ordens) {
    ordem.slice(1).forEach((cartao, i) => somar(cartao, ordem[i], 1));
  }
  for (const dia of dias) {
    const doDia = cartoes(blocosDoDia(dia));
    doDia.forEach((cartao, i) => doDia.slice(i + 1).forEach((outro) => somar(cartao, outro, PESO_DO_MESMO_DIA)));
  }
  // Na página do lugar, cada dia é um cartão, um embaixo do outro. Os dias que não são vizinhos pesam
  // um pouco: um dia some de lá quando todos os blocos dele estão nos destaques do alto.
  for (const local of LOCAIS) {
    const porDia = dias
      .map((dia) => cartoes(blocosDoDia(dia).filter((bloco) => bloco.localId === local.id)))
      .filter((doDia) => doDia.length > 0);
    porDia.forEach((doDia, i) =>
      porDia.slice(i + 1).forEach((depois, distancia) =>
        doDia.forEach((cartao) =>
          depois.forEach((outro) => somar(cartao, outro, distancia === 0 ? 1 : PESO_DO_MESMO_LUGAR)),
        ),
      ),
    );
  }

  const cores = new Map<string, string>();
  ordens[0].forEach((cartao, posicao) => {
    const repeticoes = new Map<string, number>();
    for (const [outro, quanto] of vizinhos.get(cartao) ?? []) {
      const cor = cores.get(outro);
      if (cor) {
        repeticoes.set(cor, (repeticoes.get(cor) ?? 0) + quanto);
      }
    }
    const daVez = FAIXAS[posicao % FAIXAS.length];
    const opcoes = [daVez, ...FAIXAS.filter((faixa) => faixa !== daVez)];
    const vezes = (faixa: string) => repeticoes.get(faixa) ?? 0;
    cores.set(cartao, opcoes.reduce((melhor, faixa) => (vezes(faixa) < vezes(melhor) ? faixa : melhor)));
  });
  return cores;
}

let coresDosCartoes: Map<string, string> | undefined;

/**
 * A cor do bloco: a do cartão dele na aba Blocos. É a mesma no cartão, na página do bloco, na do
 * lugar e no Descobrir. A escolha é feita uma vez, na primeira consulta.
 */
export function faixaDoBloco(bloco: Bloco): string {
  coresDosCartoes ??= escolherAsCores();
  return coresDosCartoes.get(cartaoDoBloco(porId.get(bloco.id) ?? bloco)) ?? faixaDoLocal(bloco.localId);
}
