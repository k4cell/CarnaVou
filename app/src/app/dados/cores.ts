import { LOCAIS } from './locais';

// As cores das faixas, do rosa ao verde-mar: são as variáveis de cor de `styles.scss`, na mesma ordem
// do `@each` que pinta `[data-faixa]`. A cor de cada cartão de bloco fica em cores-dos-cartoes.ts.
export const FAIXAS = ['rosa', 'amarelo', 'verde', 'laranja', 'roxo', 'vermelho', 'azul', 'verde-mar'];

/**
 * A cor de cada lugar, nos cartões dos bairros do Descobrir: as cores se revezam na ordem em que os
 * bairros aparecem lá (as zonas na ordem dos lugares e, em cada zona, os lugares um atrás do outro).
 */
function escolherAsCoresDosLugares(): Map<string, string> {
  const zonas = [...new Set(LOCAIS.map((local) => local.zona))];
  const emOrdem = zonas.flatMap((zona) => LOCAIS.filter((local) => local.zona === zona));
  return new Map(emOrdem.map((local, posicao) => [local.id, FAIXAS[posicao % FAIXAS.length]]));
}

let coresDosLugares: Map<string, string> | undefined;

/** A cor do lugar no Descobrir (os bairros). Um lugar que não existe fica com a primeira cor. */
export function faixaDoLocal(localId: string): string {
  coresDosLugares ??= escolherAsCoresDosLugares();
  return coresDosLugares.get(localId) ?? FAIXAS[0];
}
