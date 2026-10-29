import { Circuito } from './tipos';

/**
 * Os circuitos dos megablocos de 2026: por onde os grandes blocos de cada lugar desfilaram,
 * segundo a CET. Só entram os que têm começo e fim nas fontes (os outros lugares ficam sem
 * linha). As linhas seguem as ruas do OpenStreetMap.
 *
 * Gerado por design/mapa/gerar-circuitos.py: não edite à mão, mude o script e rode de novo.
 */
export const CIRCUITOS: Circuito[] = [
  {
    localId: 'ibirapuera',
    descricao: 'Av. Pedro Álvares Cabral, do Obelisco ao Monumento às Bandeiras',
    fonte: 'CET (14/02/2026) e DCI (22/02/2026)',
    trajeto: [[-46.65537, -23.58524], [-46.65561, -23.58496], [-46.65593, -23.58483], [-46.65602, -23.58471], [-46.65718, -23.58246], [-46.65752, -23.58207], [-46.65803, -23.58175], [-46.66065, -23.58051], [-46.66093, -23.58031]],
  },
  {
    localId: 'consolacao',
    descricao: 'Rua da Consolação, da Av. Paulista até a Praça Roosevelt',
    fonte: 'CET, citada pelo InfoMoney (08/02/2026)',
    trajeto: [[-46.66278, -23.55566], [-46.66017, -23.55356], [-46.65831, -23.55233], [-46.65451, -23.55036], [-46.65219, -23.54905], [-46.64741, -23.54748], [-46.64731, -23.54736], [-46.64732, -23.54727]],
  },
  {
    localId: 'faria-lima',
    descricao: 'Av. Brigadeiro Faria Lima, do número 4100 ao 4500',
    fonte: 'CET (14/02/2026)',
    trajeto: [[-46.68114, -23.59176], [-46.68008, -23.59556]],
  },
  {
    localId: 'ipiranga-sao-joao',
    descricao: 'Av. Ipiranga, Av. São Luís e Rua Xavier de Toledo, até o Theatro Municipal',
    fonte: 'CET (14/02/2026), trajeto do Tarado Ni Você',
    trajeto: [[-46.64035, -23.54229], [-46.64051, -23.54242], [-46.64031, -23.54254], [-46.64093, -23.54304], [-46.64101, -23.54319], [-46.64111, -23.54318], [-46.64178, -23.54371], [-46.64196, -23.54355], [-46.64348, -23.54478], [-46.64342, -23.54484], [-46.64369, -23.54505], [-46.64354, -23.54520], [-46.64339, -23.54527], [-46.64307, -23.54665], [-46.64285, -23.54660], [-46.64280, -23.54679], [-46.64222, -23.54698], [-46.64219, -23.54711], [-46.64222, -23.54698], [-46.64187, -23.54672], [-46.64184, -23.54654], [-46.64142, -23.54642], [-46.64104, -23.54609], [-46.63986, -23.54525], [-46.63927, -23.54571], [-46.63910, -23.54549], [-46.63869, -23.54577], [-46.63842, -23.54542]],
  },
  {
    localId: 'paulo-vi',
    descricao: 'Av. Paulo VI, da Praça Márcia Aliberti Mammana até a Av. Sumaré',
    fonte: 'CET (14/02/2026)',
    trajeto: [[-46.67690, -23.55021], [-46.67690, -23.55001], [-46.67722, -23.54997], [-46.67698, -23.54835], [-46.67662, -23.54448], [-46.67671, -23.54447]],
  },
  {
    localId: 'henrique-schaumann',
    descricao: 'Av. Henrique Schaumann, entre a Av. Rebouças e a Rua Teodoro Sampaio',
    fonte: 'CET, citada pelo InfoMoney (08/02/2026)',
    trajeto: [[-46.67806, -23.56427], [-46.67812, -23.56418], [-46.67823, -23.56424], [-46.68011, -23.56159], [-46.68012, -23.56155], [-46.67993, -23.56145], [-46.67999, -23.56142], [-46.68109, -23.55987], [-46.68097, -23.55980], [-46.68104, -23.55969]],
  },
];
