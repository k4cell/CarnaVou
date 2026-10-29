import { Local } from './tipos';

/**
 * Os 10 lugares "em destaque", na ordem em que aparecem na primeira tela.
 *
 * São os lugares com os maiores blocos do carnaval de rua de 2026 em São Paulo, segundo as
 * notícias e os guias da época. Não é um ranking oficial de público: não existe um número
 * publicado por lugar. Como cada lugar foi escolhido está em docs/dados-carnaval-2026.md.
 */
export const LOCAIS: Local[] = [
  { id: 'ibirapuera', nome: 'Parque Ibirapuera', zona: 'sul' },
  { id: 'consolacao', nome: 'Rua da Consolação e Baixo Augusta', zona: 'centro' },
  { id: 'faria-lima', nome: 'Avenida Faria Lima', zona: 'oeste' },
  { id: 'republica', nome: 'República', zona: 'centro' },
  { id: 'ipiranga-sao-joao', nome: 'Avenida Ipiranga com São João', zona: 'centro' },
  { id: 'santo-amaro', nome: 'Santo Amaro', zona: 'sul' },
  { id: 'pinheiros', nome: 'Pinheiros e Vila Madalena', zona: 'oeste' },
  { id: 'henrique-schaumann', nome: 'Avenida Henrique Schaumann', zona: 'oeste' },
  { id: 'paulo-vi', nome: 'Avenida Paulo VI', zona: 'oeste' },
  { id: 'centro-historico', nome: 'Centro Histórico (Sé e Liberdade)', zona: 'centro' },
];
