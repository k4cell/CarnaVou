import { BLOCOS } from './blocos';
import { LOCAIS } from './locais';
import { Bloco, Local } from './tipos';

function porDataEHora(a: Bloco, b: Bloco): number {
  return (a.data + a.inicio).localeCompare(b.data + b.inicio);
}

export function acharLocal(id: string): Local | undefined {
  return LOCAIS.find((local) => local.id === id);
}

/** Os blocos de um lugar, em ordem de data e hora. */
export function blocosDoLocal(localId: string): Bloco[] {
  return BLOCOS.filter((bloco) => bloco.localId === localId).sort(porDataEHora);
}

export function acharBloco(localId: string, blocoId: string): Bloco | undefined {
  return BLOCOS.find((bloco) => bloco.localId === localId && bloco.id === blocoId);
}

/**
 * Os artistas de um lugar, sem repetir, na ordem dos blocos. Com "aPartirDe" (AAAA-MM-DD),
 * só os dos blocos desse dia em diante; se não sobrar nenhum, volta a valer a lista toda.
 */
export function artistasDoLugar(localId: string, aPartirDe?: string): string[] {
  const todos = blocosDoLocal(localId);
  const dosProximos = aPartirDe ? todos.filter((bloco) => bloco.data >= aPartirDe) : todos;
  const blocos = dosProximos.some((bloco) => bloco.atracoes.length > 0) ? dosProximos : todos;

  const nomes: string[] = [];
  for (const bloco of blocos) {
    for (const atracao of bloco.atracoes) {
      if (!nomes.includes(atracao.nome)) {
        nomes.push(atracao.nome);
      }
    }
  }
  return nomes;
}
