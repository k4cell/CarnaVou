import { Zona } from './tipos';

/** Um lugar para depois dos blocos: um bar ou um ponto de encontro na rua. */
export interface LugarDoAfter {
  id: string;
  nome: string;
  /** O que é: "Bar" ou "Ponto de encontro". */
  tipo: string;
  endereco: string;
  zona: Zona;
  lat: number;
  lng: number;
}

/**
 * Os lugares da aba After: aonde o povo vai depois dos blocos. Lista feita à mão, só com o que
 * tem fonte (decisão de 30/10/2026):
 * - Beco do Batman e Meio Fio Bar foram indicados na decisão. Os endereços vêm da Wikipedia
 *   (Beco do Batman) e do guia BaresSP (Meio Fio Bar, baressp.com.br/bares/meio-fio-bar).
 * - Meretriz e Galo também foram indicados (30/10/2026), com o nome sem o "Bar". Os endereços vêm
 *   do TripAdvisor e do Bendito Guia (Bar Meretriz) e do guia BaresSP (Bar Galo,
 *   baressp.com.br/bares/bar-galo, página atualizada em 12/03/2026).
 * - Boteco Todos os Santos, Vila 567 e Praça A são bares da Rua Aspicuelta que fazem o "after"
 *   dos blocos, segundo o GPS Brasília (27/02/2025, endereços) e o ABC do ABC (10/02/2025). As
 *   baladas citadas ficaram de fora: o foco é o carnaval de rua.
 * As posições vêm do OpenStreetMap (Nominatim), pelo endereço.
 */
export const LUGARES_DO_AFTER: LugarDoAfter[] = [
  {
    id: 'beco-do-batman',
    nome: 'Beco do Batman',
    tipo: 'Ponto de encontro',
    endereco: 'Rua Gonçalo Afonso, Vila Madalena',
    zona: 'oeste',
    lat: -23.55649,
    lng: -46.68667,
  },
  {
    id: 'meio-fio-bar',
    nome: 'Meio Fio Bar',
    tipo: 'Bar',
    endereco: 'Rua Vupabussu, 31, Pinheiros',
    zona: 'oeste',
    lat: -23.55994,
    lng: -46.69696,
  },
  {
    id: 'meretriz',
    nome: 'Meretriz',
    tipo: 'Bar',
    endereco: 'Rua Edson Dias, 99, Pinheiros',
    zona: 'oeste',
    lat: -23.56368,
    lng: -46.69254,
  },
  {
    id: 'galo',
    nome: 'Galo',
    tipo: 'Bar',
    endereco: 'Rua Álvaro Anes, 88, Pinheiros',
    zona: 'oeste',
    lat: -23.56311,
    lng: -46.69299,
  },
  {
    id: 'boteco-todos-os-santos',
    nome: 'Boteco Todos os Santos',
    tipo: 'Bar',
    endereco: 'Rua Aspicuelta, 585, Vila Madalena',
    zona: 'oeste',
    lat: -23.55844,
    lng: -46.6907,
  },
  {
    id: 'vila-567',
    nome: 'Vila 567',
    tipo: 'Bar',
    endereco: 'Rua Aspicuelta, 567, Vila Madalena',
    zona: 'oeste',
    lat: -23.55833,
    lng: -46.69056,
  },
  {
    id: 'praca-a',
    nome: 'Praça A',
    tipo: 'Bar',
    endereco: 'Rua Aspicuelta, 527, Vila Madalena',
    zona: 'oeste',
    lat: -23.55809,
    lng: -46.69014,
  },
];
