import { Bloco } from './tipos';

/**
 * DADOS FICTÍCIOS. Servem só para montar e testar as telas.
 * Nenhum bloco, artista ou horário daqui existe de verdade.
 * Carnaval de 2027: sábado 06/02, terça 09/02, quarta de cinzas 10/02.
 */
export const BLOCOS: Bloco[] = [
  // Parque Ibirapuera
  {
    id: 'megabloco-do-ibira',
    nome: 'Megabloco do Ibira',
    data: '2027-02-06',
    inicio: '13:00',
    fim: '20:00',
    localId: 'ibirapuera',
    atracoes: [
      { nome: 'Banda Serpentina', inicio: '13:00' },
      { nome: 'Mariana Tamborim', inicio: '15:30' },
      { nome: 'DJ Purpurina', inicio: '18:00' },
    ],
    estilo: 'pop',
  },
  {
    id: 'axe-do-obelisco',
    nome: 'Axé do Obelisco',
    data: '2027-02-07',
    inicio: '12:00',
    localId: 'ibirapuera',
    atracoes: [
      { nome: 'Camila Abadá', inicio: '12:00' },
      { nome: 'Os Trio Elétricos do Zé', inicio: '14:30' },
    ],
    estilo: 'axe',
  },
  {
    id: 'segunda-de-folia',
    nome: 'Segunda de Folia',
    data: '2027-02-08',
    inicio: '14:00',
    localId: 'ibirapuera',
    atracoes: [
      { nome: 'MC Confete', inicio: '14:00' },
      { nome: 'DJ Fantasia', inicio: '16:00' },
    ],
    estilo: 'funk',
  },
  {
    id: 'pos-folia',
    nome: 'Pós-Folia',
    data: '2027-02-13',
    inicio: '15:00',
    localId: 'ibirapuera',
    atracoes: [
      { nome: 'Os Trio Elétricos do Zé', inicio: '15:00' },
      { nome: 'MC Pandeiro', inicio: '17:00' },
    ],
    estilo: 'pop',
  },

  // Rua da Consolação
  {
    id: 'cordao-da-purpurina',
    nome: 'Cordão da Purpurina',
    data: '2027-01-31',
    inicio: '14:00',
    localId: 'consolacao',
    atracoes: [
      { nome: 'DJ Purpurina', inicio: '14:00' },
      { nome: 'MC Confete', inicio: '16:00' },
    ],
    estilo: 'pop',
  },
  {
    id: 'samba-da-augusta',
    nome: 'Samba da Augusta',
    data: '2027-02-07',
    inicio: '14:00',
    localId: 'consolacao',
    atracoes: [
      { nome: 'Banda Serpentina', inicio: '14:00' },
      { nome: 'Zeca Tamborim', inicio: '16:00' },
    ],
    estilo: 'samba',
  },
  {
    id: 'cinzas-sem-pressa',
    nome: 'Cinzas Sem Pressa',
    data: '2027-02-10',
    inicio: '17:00',
    localId: 'consolacao',
    atracoes: [
      { nome: 'DJ Purpurina', inicio: '17:00' },
      { nome: 'Zeca Tamborim', inicio: '19:00' },
    ],
    estilo: 'eletronico',
    publico: 'Eletrônica',
  },

  // Avenida Faria Lima
  {
    id: 'marchinha-sem-juizo',
    nome: 'Marchinha Sem Juízo',
    data: '2027-02-06',
    inicio: '16:00',
    localId: 'faria-lima',
    atracoes: [{ nome: 'Orquestra do Confete', inicio: '16:00' }],
    estilo: 'marchinha',
  },
  {
    id: 'bloco-da-gravata-solta',
    nome: 'Bloco da Gravata Solta',
    data: '2027-02-09',
    inicio: '13:00',
    fim: '21:00',
    localId: 'faria-lima',
    atracoes: [
      { nome: 'Banda Serpentina', inicio: '13:00' },
      { nome: 'MC Pandeiro', inicio: '17:00' },
    ],
    estilo: 'pop',
  },

  // Avenida Luís Carlos Berrini
  {
    id: 'samba-do-escritorio',
    nome: 'Samba do Escritório',
    data: '2027-02-06',
    inicio: '11:00',
    localId: 'berrini',
    atracoes: [{ nome: 'Zeca Tamborim', inicio: '11:00' }],
    estilo: 'samba',
  },
  {
    id: 'axe-do-home-office',
    nome: 'Axé do Home Office',
    data: '2027-02-07',
    inicio: '14:00',
    localId: 'berrini',
    atracoes: [
      { nome: 'Camila Abadá', inicio: '14:00' },
      { nome: 'Nando Bumbo', inicio: '16:30' },
    ],
    estilo: 'axe',
  },

  // Avenida Henrique Schaumann
  {
    id: 'samba-do-quintal',
    nome: 'Samba do Quintal',
    data: '2027-01-30',
    inicio: '15:00',
    localId: 'henrique-schaumann',
    atracoes: [
      { nome: 'Banda Serpentina', inicio: '15:00' },
      { nome: 'Zeca Tamborim', inicio: '17:00' },
    ],
    estilo: 'samba',
  },
  {
    id: 'frevo-na-vila',
    nome: 'Frevo na Vila',
    data: '2027-02-08',
    inicio: '15:30',
    localId: 'henrique-schaumann',
    atracoes: [
      { nome: 'Orquestra Sombrinha', inicio: '15:30' },
      { nome: 'Dona Fanfarra', inicio: '17:30' },
    ],
    estilo: 'frevo',
  },

  // República
  {
    id: 'funk-na-laje',
    nome: 'Funk na Laje',
    data: '2027-02-07',
    inicio: '18:00',
    localId: 'republica',
    atracoes: [
      { nome: 'MC Confete', inicio: '18:00' },
      { nome: 'DJ Serpentina', inicio: '19:30' },
      { nome: 'MC Pandeiro', inicio: '21:00' },
    ],
    estilo: 'funk',
  },
  {
    id: 'cordao-da-fantasia',
    nome: 'Cordão da Fantasia',
    data: '2027-02-09',
    inicio: '14:00',
    fim: '22:00',
    localId: 'republica',
    atracoes: [
      { nome: 'DJ Fantasia', inicio: '14:00' },
      { nome: 'Duo Lantejoula', inicio: '18:00' },
    ],
    estilo: 'pop',
    publico: 'LGBTQIA+',
  },

  // Minhocão
  {
    id: 'domingo-no-elevado',
    nome: 'Domingo no Elevado',
    data: '2027-02-07',
    inicio: '15:00',
    localId: 'minhocao',
    atracoes: [{ nome: 'Lia Batucada', inicio: '15:00' }],
    estilo: 'samba',
  },
  {
    id: 'minhocao-em-cores',
    nome: 'Minhocão em Cores',
    data: '2027-02-13',
    inicio: '14:00',
    localId: 'minhocao',
    atracoes: [
      { nome: 'DJ Fantasia', inicio: '14:00' },
      { nome: 'Duo Lantejoula', inicio: '17:00' },
    ],
    estilo: 'eletronico',
    publico: 'LGBTQIA+',
  },

  // Avenida Ipiranga com São João
  {
    id: 'esquina-do-samba',
    nome: 'Esquina do Samba',
    data: '2027-02-06',
    inicio: '10:00',
    localId: 'ipiranga-sao-joao',
    atracoes: [{ nome: 'Bando do Apito', inicio: '10:00' }],
    estilo: 'samba',
  },
  {
    id: 'marchinha-da-esquina',
    nome: 'Marchinha da Esquina',
    data: '2027-02-14',
    inicio: '12:00',
    localId: 'ipiranga-sao-joao',
    atracoes: [{ nome: 'Orquestra do Confete', inicio: '12:00' }],
    estilo: 'marchinha',
  },

  // Avenida Paulo VI
  {
    id: 'bloco-da-ladeira',
    nome: 'Bloco da Ladeira',
    data: '2027-02-07',
    inicio: '14:00',
    localId: 'paulo-vi',
    atracoes: [
      { nome: 'Tião do Surdo', inicio: '14:00' },
      { nome: 'MC Confete', inicio: '16:00' },
    ],
    estilo: 'funk',
  },
  {
    id: 'pagode-da-paulo-vi',
    nome: 'Pagode da Paulo VI',
    data: '2027-02-09',
    inicio: '15:00',
    localId: 'paulo-vi',
    atracoes: [{ nome: 'Banda Serpentina', inicio: '15:00' }],
    estilo: 'samba',
  },

  // Largo da Batata
  {
    id: 'cordao-do-pandeiro',
    nome: 'Cordão do Pandeiro',
    data: '2027-02-06',
    inicio: '12:00',
    localId: 'largo-da-batata',
    atracoes: [
      { nome: 'Nando Bumbo', inicio: '12:00' },
      { nome: 'Mariana Tamborim', inicio: '14:30' },
    ],
    estilo: 'samba',
    publico: 'Mulheres',
  },
  {
    id: 'frevo-do-largo',
    nome: 'Frevo do Largo',
    data: '2027-02-14',
    inicio: '14:00',
    localId: 'largo-da-batata',
    atracoes: [
      { nome: 'Orquestra Sombrinha', inicio: '14:00' },
      { nome: 'Dona Fanfarra', inicio: '16:00' },
    ],
    estilo: 'frevo',
  },
];
