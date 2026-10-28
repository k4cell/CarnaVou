import { BLOCOS } from './blocos';
import { LOCAIS } from './locais';
import { SEMANA_EM_DESTAQUE } from './semana';
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

/** Os artistas de um lugar na semana em destaque, sem repetir, na ordem em que aparecem. */
export function artistasDaSemana(localId: string): string[] {
  const nomes: string[] = [];
  for (const bloco of blocosDoLocal(localId)) {
    if (bloco.data < SEMANA_EM_DESTAQUE.inicio || bloco.data > SEMANA_EM_DESTAQUE.fim) {
      continue;
    }
    for (const atracao of bloco.atracoes) {
      if (!nomes.includes(atracao.nome)) {
        nomes.push(atracao.nome);
      }
    }
  }
  return nomes;
}
