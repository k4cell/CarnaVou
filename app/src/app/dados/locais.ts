import { Local } from './tipos';

/**
 * Os 10 lugares "em destaque", na ordem em que aparecem na primeira tela.
 *
 * São os lugares que mais apareceram com megablocos no carnaval de 2026 em São Paulo.
 * Não é um ranking oficial de público: não existe um número publicado por lugar.
 * Os nomes dos lugares são de verdade; os blocos de cada um (ver blocos.ts) são fictícios.
 */
export const LOCAIS: Local[] = [
  { id: 'ibirapuera', nome: 'Parque Ibirapuera', regiao: 'Zona Sul' },
  { id: 'consolacao', nome: 'Rua da Consolação', regiao: 'Centro' },
  { id: 'faria-lima', nome: 'Avenida Faria Lima', regiao: 'Zona Oeste' },
  { id: 'berrini', nome: 'Avenida Luís Carlos Berrini', regiao: 'Zona Sul' },
  { id: 'henrique-schaumann', nome: 'Avenida Henrique Schaumann', regiao: 'Zona Oeste' },
  { id: 'republica', nome: 'República', regiao: 'Centro' },
  { id: 'minhocao', nome: 'Minhocão', regiao: 'Centro' },
  { id: 'ipiranga-sao-joao', nome: 'Avenida Ipiranga com São João', regiao: 'Centro' },
  { id: 'paulo-vi', nome: 'Avenida Paulo VI', regiao: 'Zona Oeste' },
  { id: 'largo-da-batata', nome: 'Largo da Batata', regiao: 'Zona Oeste' },
];
