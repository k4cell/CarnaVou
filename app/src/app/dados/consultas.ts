import { todosOsBlocos } from './correcoes';
import { LOCAIS } from './locais';
import { Bloco, Local } from './tipos';

function porDataEHora(a: Bloco, b: Bloco): number {
  return (a.data + a.inicio).localeCompare(b.data + b.inicio);
}

export function acharLocal(id: string): Local | undefined {
  return LOCAIS.find((local) => local.id === id);
}

/**
 * O cartão do bloco na aba Blocos: os blocos do mesmo dia que saem do mesmo ponto (a menos de 300 m,
 * veja `gerar_dados.py`) dividem o cartão. O bloco sem ponto conhecido fica sozinho.
 */
export function cartaoDoBloco(bloco: Bloco): string {
  return bloco.ponto === undefined ? bloco.id : `${bloco.data}|${bloco.localId}|${bloco.ponto}`;
}

/** Os blocos de um lugar, em ordem de data e hora. */
export function blocosDoLocal(localId: string): Bloco[] {
  return todosOsBlocos()
    .filter((bloco) => bloco.localId === localId)
    .sort(porDataEHora);
}

/** Os blocos de um lugar que continuam de pé: sem os cancelados. */
export function blocosAtivosDoLocal(localId: string): Bloco[] {
  return blocosDoLocal(localId).filter((bloco) => !bloco.cancelado);
}

/**
 * O megabloco conta, na ordem por fama, como se tivesse pelo menos estes seguidores: assim um gigante
 * sem artista divulgado (como o Galo da Madrugada) não fica lá embaixo. É o mesmo número de
 * FAMA_DO_MEGABLOCO, em scripts/dados/gerar_dados.py, que ordena os lugares.
 */
export const FAMA_DO_MEGABLOCO = 1_000_000;

/**
 * A fama do bloco: a soma dos seguidores dos artistas dele, e pelo menos FAMA_DO_MEGABLOCO num
 * megabloco. Bloco sem artista conhecido fica com 0.
 */
export function famaDoBloco(bloco: Bloco): number {
  const soma = bloco.atracoes.reduce((total, atracao) => total + (atracao.seguidores ?? 0), 0);
  return bloco.megabloco ? Math.max(soma, FAMA_DO_MEGABLOCO) : soma;
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

/** Os mais famosos entre os blocos (só os que têm artista conhecido ou são megablocos, sem os cancelados), do mais para o menos. */
export function maisFamosos(blocos: Bloco[], quantos: number): Bloco[] {
  return blocos
    .filter((bloco) => famaDoBloco(bloco) > 0 && !bloco.cancelado)
    .sort((a, b) => famaDoBloco(b) - famaDoBloco(a))
    .slice(0, quantos);
}

/** Os blocos mais famosos do lugar, do mais para o menos. */
export function destaquesDoLocal(localId: string, quantos: number): Bloco[] {
  return maisFamosos(blocosDoLocal(localId), quantos);
}

/** O id sem a data do fim: "monobloco-08-02" vira "monobloco". */
function semAData(id: string): string {
  return id.replace(/-\d{2}-\d{2}(-\d+)?$/, '');
}

/**
 * O bloco de um lugar, pelo id do endereço. Um link antigo continua abrindo, mesmo que a data do
 * bloco tenha mudado ou que o link seja de antes de o id ter data: vale o primeiro bloco com o mesmo
 * nome naquele lugar.
 */
export function acharBloco(localId: string, blocoId: string): Bloco | undefined {
  const blocos = blocosDoLocal(localId);
  return blocos.find((bloco) => bloco.id === blocoId) ?? blocos.find((bloco) => semAData(bloco.id) === semAData(blocoId));
}

/** O mesmo, em qualquer lugar. Serve para o que ficou guardado no aparelho, como os favoritos. */
export function acharBlocoPeloId(blocoId: string): Bloco | undefined {
  const blocos = todosOsBlocos();
  return blocos.find((bloco) => bloco.id === blocoId) ?? blocos.find((bloco) => semAData(bloco.id) === semAData(blocoId));
}
/**
 * Os artistas de um lugar, sem repetir, do mais famoso para o menos. Com "aPartirDe" (AAAA-MM-DD),
 * só os dos blocos desse dia em diante; se não sobrar nenhum, volta a valer a lista toda.
 */
export function artistasDoLugar(localId: string, aPartirDe?: string): string[] {
  const todos = blocosAtivosDoLocal(localId);
  const dosProximos = aPartirDe ? todos.filter((bloco) => bloco.data >= aPartirDe) : todos;
  const blocos = dosProximos.some((bloco) => bloco.atracoes.length > 0) ? dosProximos : todos;
  return artistasPorFama(blocos);
}
