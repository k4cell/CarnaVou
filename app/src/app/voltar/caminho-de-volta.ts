import { acharLocal } from '../dados/consultas';

/** Para onde a seta de voltar leva e o nome que o leitor de tela fala. */
export interface CaminhoDeVolta {
  link: string[];
  nome: string;
}

/**
 * Para onde a seta do cabeçalho volta: sempre um nível acima na árvore (bloco → lugar → Em alta),
 * e não para a página anterior do navegador, porque quem chega por um link compartilhado não tem
 * para onde voltar. Nas abas do menu (Blocos, Descobrir, After, Mapa) não tem seta.
 */
export function caminhoDeVolta(endereco: string): CaminhoDeVolta | null {
  const partes = endereco.split(/[?#]/)[0].split('/').filter(Boolean).map(decodeURIComponent);
  if (partes[0] !== 'local') {
    return null;
  }
  if (partes.length === 3) {
    return { link: ['/local', partes[1]], nome: acharLocal(partes[1])?.nome ?? 'o lugar' };
  }
  if (partes.length === 2) {
    return { link: ['/descobrir'], nome: 'Em alta' };
  }
  return null;
}
