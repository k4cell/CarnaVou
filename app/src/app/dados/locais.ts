import { Local } from './tipos';

/**
 * Os 10 lugares "em destaque", na ordem em que aparecem na primeira tela.
 *
 * São os lugares com os maiores blocos do carnaval de rua de 2026 em São Paulo, segundo as
 * notícias e os guias da época. Não é um ranking oficial de público: não existe um número
 * publicado por lugar. Como cada lugar foi escolhido está em docs/dados-carnaval-2026.md.
 *
 * lat e lng são o ponto do lugar no mapa (um por lugar). Vêm do OpenStreetMap, do endereço que
 * as fontes citam para o bloco (por exemplo, Rua da Consolação 2101 ou Avenida Faria Lima 4100).
 */
export const LOCAIS: Local[] = [
  { id: 'ibirapuera', nome: 'Parque Ibirapuera', zona: 'sul', lat: -23.58485, lng: -46.65482 },
  { id: 'consolacao', nome: 'Rua da Consolação e Baixo Augusta', zona: 'centro', lat: -23.55369, lng: -46.66007 },
  { id: 'faria-lima', nome: 'Avenida Faria Lima', zona: 'oeste', lat: -23.59178, lng: -46.68125 },
  { id: 'republica', nome: 'República', zona: 'centro', lat: -23.54317, lng: -46.64252 },
  { id: 'ipiranga-sao-joao', nome: 'Avenida Ipiranga com São João', zona: 'centro', lat: -23.54198, lng: -46.6396 },
  { id: 'santo-amaro', nome: 'Santo Amaro', zona: 'sul', lat: -23.64164, lng: -46.71595 },
  { id: 'pinheiros', nome: 'Pinheiros e Vila Madalena', zona: 'oeste', lat: -23.56614, lng: -46.69401 },
  { id: 'henrique-schaumann', nome: 'Avenida Henrique Schaumann', zona: 'oeste', lat: -23.56265, lng: -46.67893 },
  { id: 'paulo-vi', nome: 'Avenida Paulo VI', zona: 'oeste', lat: -23.54979, lng: -46.67704 },
  { id: 'centro-historico', nome: 'Centro Histórico (Sé e Liberdade)', zona: 'centro', lat: -23.54802, lng: -46.63302 },
];
