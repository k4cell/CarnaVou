import { Aba, CartaoDoLugar, diaIso, diaSeguinte, momentoDoBloco } from '../dados/agenda';
import { acharLocal, artistasPorFama, faixaDoLocal, famaDoBloco } from '../dados/consultas';
import { todosOsBlocos } from '../dados/correcoes';
import { artistaEstaNoNome, NOMES_DOS_ESTILOS } from '../dados/formato';
import { QuandoComeca, quandoComeca } from '../dados/quando';
import { Bloco, Estilo, Local, Zona } from '../dados/tipos';

/*
 * O que a vitrine do Descobrir mostra, a partir dos blocos da aba (Hoje, Amanhã ou Geral): o
 * destaque, os mais famosos, o que está rolando e começando (em Hoje), os estilos e os lugares juntos
 * por zona. Não depende da tela: a página
 * pega isto pronto.
 */

/** Um bloco na vitrine, com o que a tela precisa para mostrar e abrir ele. */
export interface BlocoNaVitrine {
  bloco: Bloco;
  local: Local;
  /** A cor do lugar (a mesma da faixa dos cartões dele). */
  faixa: string;
  /** Os artistas, sem quem já está no nome do bloco, separados por vírgula. */
  artistas: string;
  quando: QuandoComeca;
  caminho: string[];
}

/** Um estilo que tem bloco na aba: a pessoa toca e vê a lista deles na aba Blocos. */
export interface EstiloNaVitrine {
  estilo: Estilo;
  nome: string;
  quantos: number;
  /** O que vai para a busca da aba Blocos: o estilo e, em Hoje e Amanhã, o dia. */
  busca: string;
}

/** Os lugares de uma zona, na ordem em que vieram (a da fama). */
export interface ZonaNaVitrine {
  zona: Zona;
  cartoes: CartaoDoLugar[];
}

/** Até quantos blocos cada fileira mostra. */
const FAMOSOS_NA_FILEIRA = 10;

/**
 * Os blocos da aba que ainda dá para aproveitar: sem os cancelados e sem os que já acabaram, em
 * ordem de data e hora.
 */
export function blocosDaVitrine(aba: Aba, agora: Date): Bloco[] {
  const hoje = diaIso(agora);
  const amanha = diaIso(diaSeguinte(agora));
  const doDia = (bloco: Bloco) =>
    aba === 'hoje' ? bloco.data === hoje : aba === 'amanha' ? bloco.data === amanha : bloco.data >= hoje;
  return todosOsBlocos()
    .filter((bloco) => !bloco.cancelado && doDia(bloco) && momentoDoBloco(bloco, agora) !== 'acabou')
    .sort((a, b) => a.data.localeCompare(b.data) || a.inicio.localeCompare(b.inicio));
}

export function naVitrine(bloco: Bloco, agora: Date): BlocoNaVitrine {
  return {
    bloco,
    local: acharLocal(bloco.localId)!,
    faixa: faixaDoLocal(bloco.localId),
    artistas: artistasPorFama([bloco])
      .filter((nome) => !artistaEstaNoNome(bloco, nome))
      .join(', '),
    quando: quandoComeca(bloco, agora),
    caminho: ['/local', bloco.localId, bloco.id],
  };
}

/**
 * O destaque da aba: o mais famoso do que está rolando agora; sem nada rolando, o mais famoso do que
 * ainda vem (no empate, o que começa antes). Sem artista conhecido em nenhum, o que começa antes.
 */
export function destaqueDaVitrine(blocos: Bloco[], agora: Date): Bloco | null {
  const rolando = blocos.filter((bloco) => momentoDoBloco(bloco, agora) === 'rolando');
  const candidatos = rolando.length > 0 ? rolando : blocos;
  // A lista já vem em ordem de data e hora: no empate, fica o primeiro.
  return candidatos.reduce<Bloco | null>(
    (melhor, bloco) => (melhor === null || famaDoBloco(bloco) > famaDoBloco(melhor) ? bloco : melhor),
    null,
  );
}

/** Os mais famosos da aba (só os que têm artista conhecido), sem o destaque. */
export function famososDaVitrine(blocos: Bloco[], destaque: Bloco | null): Bloco[] {
  return blocos
    .filter((bloco) => bloco !== destaque && famaDoBloco(bloco) > 0)
    .sort((a, b) => famaDoBloco(b) - famaDoBloco(a))
    .slice(0, FAMOSOS_NA_FILEIRA);
}

/** O que está rolando e o que começa daqui a pouco, por horário, sem o destaque. */
export function proximosDaVitrine(blocos: Bloco[], destaque: Bloco | null): Bloco[] {
  // A lista já vem por horário: quem está rolando começou antes e fica na frente.
  return blocos.filter((bloco) => bloco !== destaque).slice(0, FAMOSOS_NA_FILEIRA);
}

/** Os estilos que têm bloco na aba, do que tem mais para o que tem menos. */
export function estilosDaVitrine(blocos: Bloco[], aba: Aba): EstiloNaVitrine[] {
  const quantos = new Map<Estilo, number>();
  for (const bloco of blocos) {
    if (bloco.estilo) {
      quantos.set(bloco.estilo, (quantos.get(bloco.estilo) ?? 0) + 1);
    }
  }
  const dia = aba === 'hoje' ? ' hoje' : aba === 'amanha' ? ' amanhã' : '';
  return [...quantos]
    .sort(([, a], [, b]) => b - a)
    .map(([estilo, total]) => ({
      estilo,
      nome: NOMES_DOS_ESTILOS[estilo],
      quantos: total,
      busca: `${NOMES_DOS_ESTILOS[estilo]}${dia}`,
    }));
}

/** Os lugares juntos por zona. A zona do lugar mais famoso vem primeiro. */
export function lugaresPorZona(cartoes: CartaoDoLugar[]): ZonaNaVitrine[] {
  const zonas: ZonaNaVitrine[] = [];
  for (const cartao of cartoes) {
    const zona = zonas.find((candidata) => candidata.zona === cartao.local.zona);
    if (zona) {
      zona.cartoes.push(cartao);
    } else {
      zonas.push({ zona: cartao.local.zona, cartoes: [cartao] });
    }
  }
  return zonas;
}
