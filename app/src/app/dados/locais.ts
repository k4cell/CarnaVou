import { Local } from './tipos';

/**
 * Os lugares: os grandes pontos do carnaval (os circuitos dos megablocos, como o Parque
 * Ibirapuera) e, para os outros blocos, a subprefeitura. Os que têm os artistas mais famosos
 * vêm primeiro.
 * Arquivo gerado por design/dados/gerar_dados.py: não mude à mão.
 */
export const LOCAIS: Local[] = [
  { id: 'ibirapuera', nome: 'Parque Ibirapuera', zona: 'sul', circuito: true },
  { id: 'consolacao', nome: 'Rua da Consolação e Baixo Augusta', zona: 'centro', circuito: true },
  { id: 'santo-amaro', nome: 'Santo Amaro', zona: 'sul' },
  { id: 'faria-lima', nome: 'Avenida Faria Lima', zona: 'oeste', circuito: true },
  { id: 'ipiranga-sao-joao', nome: 'Av. Ipiranga, São João e República', zona: 'centro', circuito: true },
  { id: 'henrique-schaumann', nome: 'Rua Henrique Schaumann', zona: 'oeste', circuito: true },
  { id: 'paulo-vi', nome: 'Avenida Paulo VI', zona: 'oeste', circuito: true },
  { id: 'freguesia-brasilandia', nome: 'Freguesia/Brasilândia', zona: 'norte' },
  { id: 'santana-tucuruvi', nome: 'Santana/Tucuruvi', zona: 'norte' },
  { id: 'aricanduva-vila-formosa', nome: 'Aricanduva/Vila Formosa', zona: 'leste' },
  { id: 'jacana-tremembe', nome: 'Jaçanã/Tremembé', zona: 'norte' },
  { id: 'perus', nome: 'Perus', zona: 'norte' },
  { id: 'sao-miguel-paulista', nome: 'São Miguel Paulista', zona: 'leste' },
];
