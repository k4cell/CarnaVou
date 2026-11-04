import { BLOCOS } from './blocos';
import { acharLocal } from './consultas';
import { NOMES_DAS_ZONAS, NOMES_DOS_ESTILOS, semAcento } from './formato';
import { Bloco } from './tipos';

/**
 * As palavras do jeito que a busca compara: sem acento, em minúsculas e sem o que as pessoas costumam
 * escrever de vários jeitos. "Pabllo Vittar", "pablo vitar" e "PABLO VITAR" viram a mesma coisa, e
 * "Pocah" vira "poca".
 */
function palavrasDaBusca(texto: string): string[] {
  return semAcento(texto)
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/ph/g, 'f')
    .replace(/y/g, 'i')
    .replace(/w/g, 'v')
    .replace(/k/g, 'c')
    .replace(/h\b/g, '')
    .replace(/([a-z])\1+/g, '$1')
    .split(' ')
    .filter(Boolean);
}

/** Quantas letras é preciso trocar, tirar, pôr ou inverter para uma palavra virar a outra. */
function letrasDeDiferenca(a: string, b: string): number {
  let antesDoAnterior: number[] = [];
  let anterior = Array.from({ length: b.length + 1 }, (_, indice) => indice);
  for (let i = 1; i <= a.length; i++) {
    const atual = [i];
    for (let j = 1; j <= b.length; j++) {
      const troca = a[i - 1] === b[j - 1] ? 0 : 1;
      atual[j] = Math.min(anterior[j] + 1, atual[j - 1] + 1, anterior[j - 1] + troca);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        atual[j] = Math.min(atual[j], antesDoAnterior[j - 2] + 1);
      }
    }
    antesDoAnterior = anterior;
    anterior = atual;
  }
  return anterior[b.length];
}

/** Palavra curta precisa estar certa; numa média vale um erro de digitação e, numa longa, dois. */
function errosAceitos(palavra: string): number {
  if (palavra.length >= 7) {
    return 2;
  }
  return palavra.length >= 4 ? 1 : 0;
}

/** A palavra digitada parece com esta? Vale também a palavra pela metade ("sangl" para "sangalo"). */
function parecida(digitada: string, palavra: string): boolean {
  const aceitos = errosAceitos(digitada);
  return (
    aceitos > 0 &&
    (letrasDeDiferenca(digitada, palavra) <= aceitos ||
      letrasDeDiferenca(digitada, palavra.slice(0, digitada.length)) <= aceitos)
  );
}

const PALAVRAS_DO_BLOCO = new WeakMap<Bloco, string[]>();

/** Onde a busca procura: o nome do bloco, os artistas, o lugar, a zona e o estilo. */
function palavrasDoBloco(bloco: Bloco): string[] {
  let palavras = PALAVRAS_DO_BLOCO.get(bloco);
  if (!palavras) {
    const lugar = acharLocal(bloco.localId);
    palavras = palavrasDaBusca(
      [
        bloco.nome,
        ...bloco.atracoes.map((atracao) => atracao.nome),
        lugar?.nome ?? '',
        lugar ? NOMES_DAS_ZONAS[lugar.zona] : '',
        bloco.estilo ? NOMES_DOS_ESTILOS[bloco.estilo] : '',
      ].join(' '),
    );
    PALAVRAS_DO_BLOCO.set(bloco, palavras);
  }
  return palavras;
}

/**
 * Monta a busca: devolve quem decide se um bloco combina com o que a pessoa digitou. Cada palavra
 * digitada precisa aparecer no bloco, em qualquer ordem. Se algum bloco tem as palavras certinhas,
 * ficam só esses; os erros de digitação só contam quando a busca exata não acha nada, para um nome
 * parecido não atrapalhar quem digitou certo.
 */
export function criarBusca(texto: string): (bloco: Bloco) => boolean {
  const digitadas = palavrasDaBusca(texto);
  if (digitadas.length === 0) {
    return () => true;
  }
  const exata = (bloco: Bloco) =>
    digitadas.every((digitada) => palavrasDoBloco(bloco).some((palavra) => palavra.includes(digitada)));
  if (BLOCOS.some(exata)) {
    return exata;
  }
  return (bloco) =>
    digitadas.every((digitada) =>
      palavrasDoBloco(bloco).some((palavra) => palavra.includes(digitada) || parecida(digitada, palavra)),
    );
}
