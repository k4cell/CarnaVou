import { ResolveFn } from '@angular/router';

import { acharBloco, acharLocal, artistasDoLugar, blocosAtivosDoLocal } from '../dados/consultas';
import { artistaEstaNoNome, dataPorExtenso, formatarHora } from '../dados/formato';
import { Bloco, Local } from '../dados/tipos';

// A descrição de cada página: aparece embaixo do título no Google e na prévia do link no WhatsApp.
// As páginas prontas são geradas sem as correções de última hora, então a descrição vem da lista.

const CARNAVAL = 'carnaval de rua de São Paulo';

/** A descrição do site, que vale para a aba Blocos e para a página que não tiver uma própria. */
export const DESCRICAO_DO_SITE = `Os blocos do ${CARNAVAL}: o que está rolando agora e o que vem hoje e amanhã, com horário, lugar, artistas e mapa.`;

export const DESCRICOES = {
  descobrir: `Não sabe para qual bloco ir? Veja o destaque do momento, os mais famosos, os estilos e os bairros do ${CARNAVAL}.`,
  after: `Depois do bloco: os bares e os blocos da noite do ${CARNAVAL}, com o caminho até cada um.`,
  mapa: `O mapa dos blocos do ${CARNAVAL}: onde cada um se concentra, o trajeto e como chegar a pé, de Uber ou de metrô.`,
  sobre: `O que é o CarnaVou, de onde vêm os dados dos blocos do ${CARNAVAL} e como falar com a gente.`,
  privacidade:
    'O que o CarnaVou guarda no seu celular e o que ele não guarda nem envia, como a sua localização.',
  termos: 'As regras de uso do CarnaVou, um guia não oficial do carnaval de rua de São Paulo.',
} as const;

/** "A", "A e B", "A, B e C". */
function emLista(nomes: string[]): string {
  return nomes.length <= 1
    ? (nomes[0] ?? '')
    : `${nomes.slice(0, -1).join(', ')} e ${nomes.at(-1)}`;
}

/** "Parque Ibirapuera no carnaval de rua de São Paulo: 15 blocos, com Ivete Sangalo, … e …." */
export function descricaoDoLocal(local: Local): string {
  const quantos = blocosAtivosDoLocal(local.id).length;
  const artistas = artistasDoLugar(local.id).slice(0, 3);
  const com = artistas.length > 0 ? `, com ${emLista(artistas)}` : '';
  return `${local.nome} no ${CARNAVAL}: ${quantos} ${quantos === 1 ? 'bloco' : 'blocos'}${com}. Os dias, os horários e o mapa.`;
}

/** "Sábado, 14 de fevereiro de 2026, das 13h às 18h · Parque Ibirapuera · com Gloria Groove e Gretchen." */
export function descricaoDoBloco(bloco: Bloco, local?: Local): string {
  const horario = bloco.fim
    ? `das ${formatarHora(bloco.inicio)} às ${formatarHora(bloco.fim)}`
    : `a partir das ${formatarHora(bloco.inicio)}`;
  const artistas = bloco.atracoes
    .map((atracao) => atracao.nome)
    .filter((nome) => !artistaEstaNoNome(bloco, nome))
    .slice(0, 3);
  const partes = [
    `${dataPorExtenso(bloco.data)} de ${bloco.data.slice(0, 4)}, ${horario}`,
    ...(local ? [local.nome] : []),
    ...(artistas.length > 0 ? [`com ${emLista(artistas)}`] : []),
  ];
  return `${bloco.cancelado ? 'Cancelado. ' : ''}${partes.join(' · ')}. Bloco do ${CARNAVAL}.`;
}

export const descricaoDaRotaDoLocal: ResolveFn<string> = (rota) => {
  const local = acharLocal(rota.params['local']);
  return local ? descricaoDoLocal(local) : DESCRICAO_DO_SITE;
};

export const descricaoDaRotaDoBloco: ResolveFn<string> = (rota) => {
  const bloco = acharBloco(rota.params['local'], rota.params['bloco']);
  return bloco ? descricaoDoBloco(bloco, acharLocal(bloco.localId)) : DESCRICAO_DO_SITE;
};
