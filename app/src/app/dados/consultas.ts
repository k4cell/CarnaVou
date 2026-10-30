import { BLOCOS } from './blocos';
import { LOCAIS } from './locais';
import { Bloco, Local } from './tipos';

function porDataEHora(a: Bloco, b: Bloco): number {
  return (a.data + a.inicio).localeCompare(b.data + b.inicio);
}

export function acharLocal(id: string): Local | undefined {
  return LOCAIS.find((local) => local.id === id);
}

// As cores das faixas, do rosa ao azul: são as variáveis de cor de `styles.scss`, na mesma ordem
// do `@each` que pinta `.cartao[data-faixa]`.
export const FAIXAS = ['rosa', 'amarelo', 'verde', 'laranja', 'roxo', 'vermelho', 'azul'];

/**
 * A cor da faixa de um lugar (rosa, amarelo…). É sempre a mesma para o mesmo lugar, onde quer que
 * ele apareça: no cartão da lista e nos banners da página dele. As cores se revezam na ordem dos
 * lugares; um lugar que não existe fica com a primeira.
 */
export function faixaDoLocal(localId: string): string {
  const posicao = LOCAIS.findIndex((local) => local.id === localId);
  return FAIXAS[Math.max(posicao, 0) % FAIXAS.length];
}

/** Os blocos de um lugar, em ordem de data e hora. */
export function blocosDoLocal(localId: string): Bloco[] {
  return BLOCOS.filter((bloco) => bloco.localId === localId).sort(porDataEHora);
}

/** A fama do bloco: a soma dos seguidores dos artistas dele. Bloco sem artista conhecido fica com 0. */
export function famaDoBloco(bloco: Bloco): number {
  return bloco.atracoes.reduce((soma, atracao) => soma + (atracao.seguidores ?? 0), 0);
}

/** Os nomes dos artistas dos blocos, sem repetir, do mais famoso para o menos. */
export function artistasPorFama(blocos: Bloco[]): string[] {
  const seguidores = new Map<string, number>();
  for (const bloco of blocos) {
    for (const atracao of bloco.atracoes) {
      if (!seguidores.has(atracao.nome)) {
        seguidores.set(atracao.nome, atracao.seguidores ?? 0);
      }
    }
  }
  return [...seguidores].sort(([, a], [, b]) => b - a).map(([nome]) => nome);
}

/** Os mais famosos entre os blocos (só os que têm artista conhecido), do mais para o menos. */
export function maisFamosos(blocos: Bloco[], quantos: number): Bloco[] {
  return blocos
    .filter((bloco) => famaDoBloco(bloco) > 0)
    .sort((a, b) => famaDoBloco(b) - famaDoBloco(a))
    .slice(0, quantos);
}

/** Os blocos mais famosos do lugar, do mais para o menos. */
export function destaquesDoLocal(localId: string, quantos: number): Bloco[] {
  return maisFamosos(blocosDoLocal(localId), quantos);
}

export function acharBloco(localId: string, blocoId: string): Bloco | undefined {
  return BLOCOS.find((bloco) => bloco.localId === localId && bloco.id === blocoId);
}
/**
 * Os artistas de um lugar, sem repetir, do mais famoso para o menos. Com "aPartirDe" (AAAA-MM-DD),
 * só os dos blocos desse dia em diante; se não sobrar nenhum, volta a valer a lista toda.
 */
export function artistasDoLugar(localId: string, aPartirDe?: string): string[] {
  const todos = blocosDoLocal(localId);
  const dosProximos = aPartirDe ? todos.filter((bloco) => bloco.data >= aPartirDe) : todos;
  const blocos = dosProximos.some((bloco) => bloco.atracoes.length > 0) ? dosProximos : todos;
  return artistasPorFama(blocos);
}
