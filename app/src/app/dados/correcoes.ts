import { computed, signal } from '@angular/core';

import { BLOCOS } from './blocos';
import { Bloco } from './tipos';

/**
 * Uma linha do arquivo de correções (`public/correcoes.json`): o que mudou num bloco depois da lista
 * oficial. O arquivo fica separado dos dados gerados pelos scripts, então continua valendo quando
 * eles são gerados de novo.
 */
export interface Correcao {
  /** O id do bloco: o fim do endereço da página dele. */
  id: string;
  cancelado?: boolean;
  data?: string;
  inicio?: string;
  desfile?: string;
  fim?: string;
  nota?: string;
}

const HORARIOS = ['inicio', 'desfile', 'fim'] as const;
const CAMPOS_DA_MUDANCA = ['cancelado', 'data', ...HORARIOS, 'nota'];
const CAMPOS = ['id', ...CAMPOS_DA_MUDANCA];
const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;
const DIA = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
/** Um fim antes desta hora é depois da meia-noite. */
const FIM_DA_MADRUGADA = '06:00';

/** Os horários do bloco com a correção, fora de ordem? Um engano comum é mudar um e esquecer o outro. */
function horariosForaDeOrdem(bloco: Bloco, correcao: Record<string, unknown>): boolean {
  const inicio = (correcao['inicio'] as string | undefined) ?? bloco.inicio;
  const desfile = (correcao['desfile'] as string | undefined) ?? bloco.desfile;
  const fim = (correcao['fim'] as string | undefined) ?? bloco.fim;
  const fimCerto = !fim || fim > (desfile ?? inicio) || fim < FIM_DA_MADRUGADA;
  return (!!desfile && desfile < inicio) || !fimCerto;
}

/** O que está errado numa linha do arquivo. Vazio quando ela está certa. */
function problemasDaLinha(linha: unknown): string[] {
  if (typeof linha !== 'object' || linha === null) {
    return [`Esta linha não está entre chaves: ${JSON.stringify(linha)}`];
  }
  const correcao = linha as Record<string, unknown>;
  const nome = String(correcao['id']);
  const bloco = BLOCOS.find((candidato) => candidato.id === correcao['id']);
  if (!bloco) {
    return [`${nome}: não existe bloco com esse id.`];
  }

  const problemas = Object.keys(correcao)
    .filter((campo) => !CAMPOS.includes(campo))
    .map((campo) => `${nome}: não conheço o campo "${campo}".`);
  if (!CAMPOS_DA_MUDANCA.some((campo) => correcao[campo] !== undefined)) {
    problemas.push(`${nome}: a linha não diz o que mudou.`);
  }
  for (const campo of HORARIOS) {
    const hora = correcao[campo];
    if (hora !== undefined && (typeof hora !== 'string' || !HORA.test(hora))) {
      problemas.push(`${nome}: ${campo} tem que ser uma hora como "14:30".`);
    }
  }
  const dia = correcao['data'];
  if (dia !== undefined && (typeof dia !== 'string' || !DIA.test(dia) || dia.slice(0, 4) !== bloco.data.slice(0, 4))) {
    problemas.push(`${nome}: data tem que ser um dia do mesmo ano, como "${bloco.data}".`);
  }
  if (correcao['cancelado'] !== undefined && typeof correcao['cancelado'] !== 'boolean') {
    problemas.push(`${nome}: cancelado tem que ser true, sem aspas.`);
  }
  if (correcao['nota'] !== undefined && typeof correcao['nota'] !== 'string') {
    problemas.push(`${nome}: nota tem que ser um texto entre aspas.`);
  }
  if (problemas.length === 0 && horariosForaDeOrdem(bloco, correcao)) {
    problemas.push(`${nome}: os horários ficaram fora de ordem (concentração, desfile e fim).`);
  }
  return problemas;
}

function linhasDoArquivo(arquivo: unknown): unknown[] | undefined {
  const linhas = (arquivo as { blocos?: unknown } | null)?.blocos;
  return Array.isArray(linhas) ? linhas : undefined;
}

/**
 * Tudo o que está errado no arquivo, para a publicação parar e o site no ar continuar o anterior.
 * Roda no `dados-reais.spec.ts`.
 */
export function problemasDoArquivo(arquivo: unknown): string[] {
  const linhas = linhasDoArquivo(arquivo);
  if (!linhas) {
    return ['O arquivo precisa ter a lista "blocos".'];
  }
  const ids = linhas.map((linha) => (linha as { id?: unknown } | null)?.id);
  const repetidos = [...new Set(ids.filter((id, posicao) => ids.indexOf(id) !== posicao))];
  return [
    ...linhas.flatMap(problemasDaLinha),
    ...repetidos.map((id) => `${String(id)}: o bloco aparece em mais de uma linha. Junte numa só.`),
  ];
}

/** As linhas certas do arquivo. A que tiver algum erro fica de fora, para nunca atrapalhar o app. */
export function lerCorrecoes(arquivo: unknown): Correcao[] {
  return (linhasDoArquivo(arquivo) ?? [])
    .filter((linha) => problemasDaLinha(linha).length === 0)
    .map((linha) => linha as Correcao);
}

const correcoesAtuais = signal<ReadonlyMap<string, Correcao>>(new Map());

/** Troca as correções que valem agora. As telas se atualizam sozinhas. */
export function definirCorrecoes(correcoes: readonly Correcao[]): void {
  correcoesAtuais.set(new Map(correcoes.map((correcao) => [correcao.id, correcao])));
}

function corrigir(bloco: Bloco, { cancelado, data, inicio, desfile, fim, nota }: Correcao): Bloco {
  return {
    ...bloco,
    ...(data && { data }),
    ...(inicio && { inicio }),
    ...(desfile && { desfile }),
    ...(fim && { fim }),
    ...(cancelado && { cancelado }),
    ...((data || inicio || desfile || fim) && { horarioMudou: true }),
    ...(nota && { nota }),
  };
}

const blocosCorrigidos = computed<readonly Bloco[]>(() => {
  const correcoes = correcoesAtuais();
  if (correcoes.size === 0) {
    return BLOCOS;
  }
  return BLOCOS.map((bloco) => {
    const correcao = correcoes.get(bloco.id);
    return correcao ? corrigir(bloco, correcao) : bloco;
  });
});

/** Os blocos como eles estão agora: a lista oficial mais as correções. */
export function todosOsBlocos(): readonly Bloco[] {
  return blocosCorrigidos();
}
