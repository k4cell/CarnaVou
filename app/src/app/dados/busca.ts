import { diaIso, diaSeguinte, momentoDoBloco } from './agenda';
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
 * Quem decide se um bloco combina com as palavras. Cada palavra precisa aparecer no bloco, em
 * qualquer ordem. Se algum bloco tem as palavras certinhas, ficam só esses; os erros de digitação só
 * contam quando a busca exata não acha nada, para um nome parecido não atrapalhar quem digitou certo.
 */
function combinarPalavras(digitadas: string[]): (bloco: Bloco) => boolean {
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

/** O "quando" que a busca entendeu: um dia ou o que está rolando agora. */
export type QuandoDaBusca = { tipo: 'agora' } | { tipo: 'dia'; dia: string };

/** Palavras que só ligam as outras ("bloco de axé no centro"): a busca não procura por elas. */
const DE_LIGACAO = new Set(
  palavrasDaBusca('de do da dos das no na nos nas em e o a os as com pra para um uma que ta tem bloco blocos bloquinho bloquinhos feira'),
);

/** Os dias da semana, na ordem do `getDay()` (domingo é o 0). */
const DIAS_DA_SEMANA = palavrasDaBusca('domingo segunda terca quarta quinta sexta sabado');

/** O "quando" de uma palavra, se ela for de tempo: hoje, amanhã, agora ou um dia da semana. */
function quandoDaPalavra(palavra: string, agora: Date): QuandoDaBusca | null {
  if (palavra === 'agora' || palavra === 'rolando') {
    return { tipo: 'agora' };
  }
  if (palavra === 'hoje') {
    return { tipo: 'dia', dia: diaIso(agora) };
  }
  if (palavra === 'amanha') {
    return { tipo: 'dia', dia: diaIso(diaSeguinte(agora)) };
  }
  const diaDaSemana = DIAS_DA_SEMANA.indexOf(palavra);
  if (diaDaSemana < 0) {
    return null;
  }
  // O próximo dia com esse nome, a contar de hoje.
  let data = agora;
  while (data.getDay() !== diaDaSemana) {
    data = diaSeguinte(data);
  }
  return { tipo: 'dia', dia: diaIso(data) };
}

function ePalavraDeTempo(palavra: string): boolean {
  return ['agora', 'rolando', 'hoje', 'amanha', 'feira', ...DIAS_DA_SEMANA].includes(palavra);
}

/** A busca montada: quem decide se um bloco combina e o "quando" que ela entendeu e usou. */
export interface Busca {
  combina: (bloco: Bloco) => boolean;
  quando: QuandoDaBusca | null;
}

/**
 * Monta a busca do jeito que a pessoa fala: "samba hoje", "axé amanhã na zona sul", "agora no
 * centro". As palavras de tempo viram o filtro do dia (ou do que está rolando agora), e as de
 * ligação ("de", "no", "bloco") não precisam aparecer no bloco. Se assim não achar nada (um bloco
 * chamado "Domingo Ela não Vai", por exemplo), a busca volta a procurar todas as palavras no bloco.
 * Sem saber o dia de hoje (a página pronta), não tem filtro do dia. Com mais de uma palavra de tempo,
 * vale a última.
 */
export function montarBusca(texto: string, agora: Date | null = null): Busca {
  const todas = palavrasDaBusca(texto);
  const resto = todas.filter((palavra) => !ePalavraDeTempo(palavra) && !DE_LIGACAO.has(palavra));
  const quando = agora
    ? todas.reduce<QuandoDaBusca | null>((achado, palavra) => quandoDaPalavra(palavra, agora) ?? achado, null)
    : null;
  // Só com palavras de ligação ("bloco"), elas valem como palavras do nome.
  const combinaComAsPalavras = combinarPalavras(resto.length > 0 || quando ? resto : todas);
  if (!quando || !agora) {
    return { combina: combinaComAsPalavras, quando: null };
  }
  const combina = (bloco: Bloco) =>
    (quando.tipo === 'agora' ? momentoDoBloco(bloco, agora) === 'rolando' : bloco.data === quando.dia) &&
    combinaComAsPalavras(bloco);
  return BLOCOS.some(combina) ? { combina, quando } : { combina: combinarPalavras(todas), quando: null };
}

/** Só quem decide se o bloco combina, para quem não precisa do "quando". */
export function criarBusca(texto: string, agora: Date | null = null): (bloco: Bloco) => boolean {
  return montarBusca(texto, agora).combina;
}

/** O texto da busca sem as palavras de tempo: é o que fica quando a pessoa tira o filtro do dia. */
export function textoSemOQuando(texto: string): string {
  return texto
    .split(/\s+/)
    .filter((pedaco) => {
      const palavras = palavrasDaBusca(pedaco);
      return palavras.length === 0 || !palavras.every(ePalavraDeTempo);
    })
    .join(' ')
    .trim();
}
