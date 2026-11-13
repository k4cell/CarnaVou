import { Aparelho } from '../aparelho/aparelho';
import { EstadoDaLocalizacao } from './localizacao';

const AVISOS = {
  negada:
    'O celular não deixou o CarnaVou ver onde você está. Para mudar, abra as configurações do navegador, em permissões do site.',
  negadaNoIphone:
    'O iPhone não deixou o CarnaVou ver onde você está. Para liberar sem sair do Safari, toque em aA (ou ⋯) na barra › Ajustes do Site › Localização › Permitir. Se não aparecer, vá em Ajustes › Privacidade e Segurança › Serviços de Localização › Sites do Safari.',
  negadaNoAppDoIphone:
    'O iPhone não deixou o CarnaVou ver onde você está. Para liberar, vá em Ajustes › Privacidade e Segurança › Serviços de Localização › Sites do Safari e escolha "Ao Usar o App".',
  semSinal: 'Não consegui achar você agora. Tente de novo em um lugar aberto.',
  indisponivel: 'Este navegador não consegue dizer onde você está.',
};

/**
 * O que dizer quando não deu para achar a pessoa: o celular não deixou (com o caminho para liberar,
 * que no iPhone é outro), não achou a posição agora ou o navegador não sabe. Nos outros estados, nada.
 */
export function avisoDoProblema(estado: EstadoDaLocalizacao, aparelho: Aparelho): string | null {
  switch (estado) {
    case 'negada':
      return !aparelho.ehIphone ? AVISOS.negada : aparelho.instalado ? AVISOS.negadaNoAppDoIphone : AVISOS.negadaNoIphone;
    case 'sem-sinal':
      return AVISOS.semSinal;
    case 'indisponivel':
      return AVISOS.indisponivel;
    default:
      return null;
  }
}
