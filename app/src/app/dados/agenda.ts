import { artistasDoLugar, blocosDoLocal, faixaDoLocal } from './consultas';
import { formatarHora } from './formato';
import { LOCAIS } from './locais';
import { Bloco, Local } from './tipos';

/** As três abas da tela inicial. */
export type Aba = 'hoje' | 'amanha' | 'geral';

export interface CartaoDoLugar {
  local: Local;
  /** O selo do canto do cartão: "Já começou", "Hoje às 16h", "Amanhã às 11h", "5 blocos"… */
  selo: string;
  /** Nome da cor da faixa (rosa, amarelo…): é sempre a mesma para o mesmo lugar. */
  faixa: string;
  principal: string;
  /** O resto dos artistas, já com a vírgula na frente: ", B, C e mais 4". */
  resto: string;
}

const MAXIMO_DE_ARTISTAS = 3;
const JA_ACABOU = 'Já acabou';

const doisDigitos = (numero: number): string => String(numero).padStart(2, '0');

/** "2027-02-06", no fuso de quem está olhando. */
export function diaIso(data: Date): string {
  return `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}`;
}

/** "14:05" */
export function horaIso(data: Date): string {
  return `${doisDigitos(data.getHours())}:${doisDigitos(data.getMinutes())}`;
}

export function diaSeguinte(data: Date): Date {
  const seguinte = new Date(data);
  seguinte.setDate(seguinte.getDate() + 1);
  return seguinte;
}

function artistasDosBlocos(blocos: Bloco[]): string[] {
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

/** O primeiro artista aparece em destaque; dos outros, só os primeiros e a conta do resto. */
function resumirArtistas(nomes: string[]): { principal: string; resto: string } {
  const [principal = '', ...outros] = nomes;
  const mostrados = outros.slice(0, MAXIMO_DE_ARTISTAS - 1);
  const escondidos = outros.length - mostrados.length;

  let resto = mostrados.length > 0 ? `, ${mostrados.join(', ')}` : '';
  if (escondidos > 0) {
    resto += ` e mais ${escondidos}`;
  }
  return { principal, resto };
}

/**
 * O selo de um lugar que tem bloco hoje. Só sabemos a hora que o bloco acaba quando ela
 * existe: sem ela, o bloco conta como rolando até o fim do dia.
 */
function seloDeHoje(blocosDeHoje: Bloco[], hora: string): string {
  const rolando = blocosDeHoje.some(
    (bloco) => bloco.inicio <= hora && (bloco.fim === undefined || hora < bloco.fim),
  );
  if (rolando) {
    return 'Já começou';
  }
  const proximo = blocosDeHoje.find((bloco) => bloco.inicio > hora);
  return proximo ? `Hoje às ${formatarHora(proximo.inicio)}` : JA_ACABOU;
}

/** "Amanhã às 11h": a hora do primeiro bloco do dia seguinte. */
function seloDeAmanha(blocosDeAmanha: Bloco[]): string {
  return `Amanhã às ${formatarHora(blocosDeAmanha[0].inicio)}`;
}

function seloDeContagem(quantidade: number): string {
  return quantidade === 1 ? '1 bloco' : `${quantidade} blocos`;
}

/** O selo na aba Geral: hoje, depois amanhã e, se não for nenhum dos dois, quantos blocos faltam. */
function seloGeral(blocos: Bloco[], dia: string, amanha: string, hora: string): string {
  const deHoje = blocos.filter((bloco) => bloco.data === dia);
  const statusDeHoje = deHoje.length > 0 ? seloDeHoje(deHoje, hora) : null;

  if (statusDeHoje !== null && statusDeHoje !== JA_ACABOU) {
    return statusDeHoje;
  }
  const deAmanha = blocos.filter((bloco) => bloco.data === amanha);
  if (deAmanha.length > 0) {
    return seloDeAmanha(deAmanha);
  }
  const depois = blocos.filter((bloco) => bloco.data > amanha).length;
  if (depois > 0) {
    return seloDeContagem(depois);
  }
  return statusDeHoje ?? 'Sem mais blocos';
}

function montar(local: Local, selo: string, artistas: string[]): CartaoDoLugar {
  return {
    local,
    selo,
    faixa: faixaDoLocal(local.id),
    ...resumirArtistas(artistas),
  };
}

/**
 * Os cartões de cada aba da tela inicial.
 * "agora" vazio (nulo) é o que o servidor e a primeira pintura do site enxergam, quando ainda
 * não se sabe o dia de hoje: só a aba Geral, com a contagem de todos os blocos.
 */
export function cartoesDaAba(aba: Aba, agora: Date | null): CartaoDoLugar[] {
  if (agora === null) {
    if (aba !== 'geral') {
      return [];
    }
    return LOCAIS.map((local) =>
      montar(local, seloDeContagem(blocosDoLocal(local.id).length), artistasDoLugar(local.id)),
    );
  }

  const dia = diaIso(agora);
  const amanha = diaIso(diaSeguinte(agora));
  const hora = horaIso(agora);
  const cartoes: CartaoDoLugar[] = [];

  for (const local of LOCAIS) {
    const blocos = blocosDoLocal(local.id);
    const deHoje = blocos.filter((bloco) => bloco.data === dia);
    const deAmanha = blocos.filter((bloco) => bloco.data === amanha);

    if (aba === 'hoje' && deHoje.length > 0) {
      cartoes.push(montar(local, seloDeHoje(deHoje, hora), artistasDosBlocos(deHoje)));
    } else if (aba === 'amanha' && deAmanha.length > 0) {
      cartoes.push(montar(local, seloDeAmanha(deAmanha), artistasDosBlocos(deAmanha)));
    } else if (aba === 'geral') {
      cartoes.push(montar(local, seloGeral(blocos, dia, amanha, hora), artistasDoLugar(local.id, dia)));
    }
  }
  return cartoes;
}

/**
 * Os blocos de um lugar que contam na aba, em ordem de data e hora: os de hoje, os de amanhã ou,
 * na Geral, os que ainda vão passar. Sem saber o dia de hoje, a Geral mostra todos.
 */
export function blocosDaAba(aba: Aba, localId: string, agora: Date | null): Bloco[] {
  const blocos = blocosDoLocal(localId);
  if (agora === null) {
    return aba === 'geral' ? blocos : [];
  }
  const dia = diaIso(agora);
  if (aba === 'hoje') {
    return blocos.filter((bloco) => bloco.data === dia);
  }
  if (aba === 'amanha') {
    const amanha = diaIso(diaSeguinte(agora));
    return blocos.filter((bloco) => bloco.data === amanha);
  }
  return blocos.filter((bloco) => bloco.data >= dia);
}
