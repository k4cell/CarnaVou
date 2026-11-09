import { acharBloco, acharLocal } from '../dados/consultas';

/** Para onde a seta de voltar leva e o nome que o leitor de tela fala. */
export interface CaminhoDeVolta {
  /** O endereço de destino. */
  url: string;
  nome: string;
  /** Verdadeiro quando é a tela de onde a pessoa veio: aí a seta volta no histórico do navegador. */
  peloHistorico: boolean;
}

const NOMES_DAS_ABAS: Record<string, string> = {
  '': 'Blocos',
  descobrir: 'Descobrir',
  after: 'After',
  mapa: 'Mapa',
};

/** As páginas sobre o próprio app, que ficam fora das abas e ganham a seta de voltar. */
const PAGINAS_DO_APP: Record<string, string> = {
  sobre: 'Sobre',
  privacidade: 'Privacidade',
  termos: 'Termos de uso',
};

function partesDoEndereco(endereco: string): string[] {
  return endereco.split(/[?#]/)[0].split('/').filter(Boolean).map(decodeURIComponent);
}

/** O nome de uma tela, para o leitor de tela falar "Voltar para…". */
function nomeDaTela(endereco: string): string {
  const [primeira = '', lugar, bloco] = partesDoEndereco(endereco);
  if (primeira !== 'local') {
    return NOMES_DAS_ABAS[primeira] ?? PAGINAS_DO_APP[primeira] ?? 'a tela anterior';
  }
  if (bloco) {
    return acharBloco(lugar, bloco)?.nome ?? 'o bloco';
  }
  return acharLocal(lugar)?.nome ?? 'o lugar';
}

/**
 * Para onde a seta do cabeçalho volta, nas telas de lugar e de bloco: para a tela de onde a pessoa
 * veio e, para quem chegou direto por um link compartilhado (que não tem para onde voltar), um nível
 * acima na árvore (bloco → lugar → Descobrir). Nas páginas Sobre, Privacidade e Termos, sem ter de
 * onde voltar, a seta leva para a aba Blocos. Nas abas do menu (Blocos, Descobrir, After, Mapa) não
 * tem seta.
 */
export function caminhoDeVolta(endereco: string, anterior?: string): CaminhoDeVolta | null {
  const partes = partesDoEndereco(endereco);
  if (partes.length === 1 && partes[0] in PAGINAS_DO_APP) {
    return anterior !== undefined
      ? { url: anterior, nome: nomeDaTela(anterior), peloHistorico: true }
      : { url: '/', nome: 'Blocos', peloHistorico: false };
  }
  if (partes[0] !== 'local' || partes.length < 2) {
    return null;
  }
  if (anterior !== undefined) {
    return { url: anterior, nome: nomeDaTela(anterior), peloHistorico: true };
  }
  if (partes.length === 3) {
    return { url: `/local/${partes[1]}`, nome: acharLocal(partes[1])?.nome ?? 'o lugar', peloHistorico: false };
  }
  return { url: '/descobrir', nome: 'Descobrir', peloHistorico: false };
}
