import { Local } from './tipos';

/**
 * Os 10 lugares "em destaque", na ordem em que aparecem na primeira tela.
 *
 * São os lugares que mais apareceram com megablocos no carnaval de 2026 em São Paulo.
 * Não é um ranking oficial de público: não existe um número publicado por lugar.
 * Os nomes dos lugares são de verdade; os blocos de cada um (ver blocos.ts) são fictícios.
 */
export const LOCAIS: Local[] = [
  { id: 'ibirapuera', nome: 'Parque Ibirapuera', zona: 'sul' },
  { id: 'consolacao', nome: 'Rua da Consolação', zona: 'centro' },
  { id: 'faria-lima', nome: 'Avenida Faria Lima', zona: 'oeste' },
  { id: 'berrini', nome: 'Avenida Luís Carlos Berrini', zona: 'sul' },
  { id: 'henrique-schaumann', nome: 'Avenida Henrique Schaumann', zona: 'oeste' },
  { id: 'republica', nome: 'República', zona: 'centro' },
  { id: 'minhocao', nome: 'Minhocão', zona: 'centro' },
  { id: 'ipiranga-sao-joao', nome: 'Avenida Ipiranga com São João', zona: 'centro' },
  { id: 'paulo-vi', nome: 'Avenida Paulo VI', zona: 'oeste' },
  { id: 'largo-da-batata', nome: 'Largo da Batata', zona: 'oeste' },
];
