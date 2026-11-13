import { ResolveFn, Routes } from '@angular/router';

import { acharBloco, acharLocal } from './dados/consultas';
import { DESCRICOES, descricaoDaRotaDoBloco, descricaoDaRotaDoLocal } from './divulgacao/descricoes';
import { NOME_DO_SITE } from './divulgacao/endereco-do-site';
import { PaginaBlocos } from './lista-de-blocos/pagina-blocos';
import { PaginaLocal } from './local/pagina-local';

// Cada página tem o título e a descrição dela (data.descricao), que vão para o Google e para a
// prévia do link (veja divulgacao/titulo-e-descricao.ts).

const tituloDoLocal: ResolveFn<string> = (rota) => {
  const lugar = acharLocal(rota.params['local']);
  return lugar ? `${lugar.nome} · ${NOME_DO_SITE}` : NOME_DO_SITE;
};

const tituloDoBloco: ResolveFn<string> = (rota) => {
  const bloco = acharBloco(rota.params['local'], rota.params['bloco']);
  return bloco ? `${bloco.nome} · ${NOME_DO_SITE}` : NOME_DO_SITE;
};

export const routes: Routes = [
  // A tela principal é a aba Blocos: o que está rolando agora e o que vem.
  { path: '', component: PaginaBlocos, title: NOME_DO_SITE },
  // O Descobrir (os bairros) já foi a tela principal.
  {
    path: 'descobrir',
    loadComponent: () => import('./destaques/destaques').then((modulo) => modulo.Destaques),
    title: `Descobrir · ${NOME_DO_SITE}`,
    data: { descricao: DESCRICOES.descobrir },
  },
  { path: 'local/:local', component: PaginaLocal, title: tituloDoLocal, resolve: { descricao: descricaoDaRotaDoLocal } },
  {
    path: 'local/:local/:bloco',
    // A página do bloco traz o itinerário em texto, que pesa: só é baixada quando alguém abre um bloco.
    loadComponent: () => import('./bloco/pagina-bloco').then((modulo) => modulo.PaginaBloco),
    title: tituloDoBloco,
    resolve: { descricao: descricaoDaRotaDoBloco },
  },
  // O endereço antigo da aba Blocos, para os links já mandados continuarem abrindo.
  { path: 'blocos', redirectTo: '' },
  {
    path: 'after',
    loadComponent: () => import('./after/pagina-after').then((modulo) => modulo.PaginaAfter),
    title: `After · ${NOME_DO_SITE}`,
    data: { descricao: DESCRICOES.after },
  },
  {
    path: 'mapa',
    // O mapa (e o MapLibre, que pesa) só é baixado quando a pessoa abre esta aba.
    loadComponent: () => import('./mapa/pagina-mapa').then((modulo) => modulo.PaginaMapa),
    title: `Mapa · ${NOME_DO_SITE}`,
    data: { descricao: DESCRICOES.mapa },
  },
  // As páginas sobre o próprio app: o que ele é, a privacidade e os termos de uso.
  {
    path: 'sobre',
    loadComponent: () => import('./sobre/pagina-sobre').then((modulo) => modulo.PaginaSobre),
    title: `Sobre · ${NOME_DO_SITE}`,
    data: { descricao: DESCRICOES.sobre },
  },
  {
    path: 'privacidade',
    loadComponent: () => import('./sobre/pagina-privacidade').then((modulo) => modulo.PaginaPrivacidade),
    title: `Privacidade · ${NOME_DO_SITE}`,
    data: { descricao: DESCRICOES.privacidade },
  },
  {
    path: 'termos',
    loadComponent: () => import('./sobre/pagina-termos').then((modulo) => modulo.PaginaTermos),
    title: `Termos de uso · ${NOME_DO_SITE}`,
    data: { descricao: DESCRICOES.termos },
  },
  // Endereços que não existem (inclusive os antigos /amigos e /favoritos) voltam para o início.
  { path: '**', redirectTo: '' },
];
